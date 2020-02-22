const Common = require('./common');

module.exports = class TemplateAction {
  constructor(connection, templatesPerPage, logining) {
    this.connection = connection;
    this.templatesPerPage = templatesPerPage;
    this.logining = logining;
    this.templateTypes = {testTask: 1, test: 2, task: 3, groupTask: 4};
  }

  tableNameByTemplateType(templateType) {
    if (templateType === this.templateTypes.testTask) {
      return 'template_test_task';
    }
    if (templateType === this.templateTypes.test) {
      return 'template_test';
    }
    if (templateType === this.templateTypes.task) {
      return 'template_task';
    }
    if (templateType === this.templateTypes.groupTask) {
      return 'template_group_task';
    }
  }

  upload(userId, templateType, template, callbackPositive, callbackNegative) {
    let tableName = this.tableNameByTemplateType(templateType);
    this.connection.query("INSERT INTO `server`.`" + tableName + "` SET ?",
      {user_id: userId, template: Common.compressString(template)})
      .then(results => {callbackPositive(results);})
      .catch(err => {
        this.logining.error('Insert into `server`.`'+tableName+'`: ' + err.message);
        callbackNegative();
      });
  }

  download(userId, templateId, templateType, callbackPositive, callbackNegative) {
    let tableName = this.tableNameByTemplateType(templateType);
    this.connection.query("SELECT * FROM `server`.`"+tableName+"` WHERE `"+tableName+"`.`id`=? AND `"+tableName+"`.`user_id`=?",
      [templateId, userId])
      .then(results => {
        callbackPositive(results);
      })
      .catch((err) => {
        this.logining.error('Select from `server`.`'+tableName+'`: ' + err.message);
        callbackNegative();
      });
  }

  remove(userId, templateId, templateType, callbackPositive, callbackNegative) {
    let tableName = this.tableNameByTemplateType(templateType);
    this.connection.query("SELECT * FROM `server`.`"+tableName+"` WHERE `"+tableName+"`.`id`=? AND `"+tableName+"`.`user_id`=?",
      [templateId, userId])
      .then(results => {
        if (results[0].length === 1) {
          this.connection.query("DELETE FROM `server`.`"+tableName+"` WHERE `"+tableName+"`.`id`=? AND `"+tableName+"`.`user_id`=?",
            [templateId, userId])
            .then(() => {
              callbackPositive();
            })
            .catch((err) => {
              this.logining.error('Delete from `server`.`'+tableName+'`: ' + err.message);
              callbackNegative();
            });
        } else {
          callbackNegative();
        }
      })
      .catch((err) => {
        this.logining.error('Select from `server`.`'+tableName+'`: ' + err.message);
        callbackNegative();
      });
  }

  update(userId, templateId, template, templateType, callbackPositive, callbackNegative) {
    let tableName = this.tableNameByTemplateType(templateType);
    this.connection.query("SELECT * FROM `server`.`"+tableName+"` WHERE `"+tableName+"`.`id`=? AND `"+tableName+"`.`user_id`=?",
      [templateId, userId])
      .then(results => {
        if (results[0].length === 1) {
          this.connection.query("UPDATE `server`.`"+tableName+"` SET `"+tableName+"`.`template`=? WHERE `"+tableName+"`.`id`=? AND `"+tableName+"`.`user_id`=?",
            [Common.compressString(template), templateId, userId])
            .then(() => {
              callbackPositive();
            })
            .catch((err) => {
              this.logining.error('Update `server`.`'+tableName+'`: ' + err.message);
              callbackNegative();
            });
        } else {
          callbackNegative();
        }
      })
      .catch((err) => {
        this.logining.error('Select from `server`.`'+tableName+'`: ' + err.message);
        callbackNegative();
      });
  }

  viewList(userId, pageId, templateType, callbackPositive, callbackNegative) {
    let tableName = this.tableNameByTemplateType(templateType);
    let offset = pageId * this.templatesPerPage;
    this.connection.query("SELECT * FROM `server`.`" + tableName + "` WHERE `" + tableName + "`.`user_id`=? ORDER BY `" + tableName + "`.`id` desc LIMIT " +
      this.templatesPerPage + " OFFSET " + offset, [userId])
      .then(results => {
        callbackPositive(results);
      })
      .catch((err) => {
        this.logining.error('Select from `server`.`'+tableName+'`: ' + err.message);
        callbackNegative();
      });
  }

  generate(userId, templateId, templateType, number, callbackTemplateToContent, callbackPositive, callbackNegative) {
    this.download(userId, templateId, templateType, results => {
      try {
        if (results[0].length === 1) {
          let template = JSON.parse(Common.uncompressString(results[0][0].template));
          let content = [];
          for (let i = 0; i < number; ++i) {
            let fileName = 'variant_';
            if (i < 10) {
              fileName += '0' + i;
            } else {
              fileName += i;
            }
            fileName += '.txt';

            content.push([fileName, callbackTemplateToContent(template)]);
          }
          callbackPositive(content);
        }
      } catch (err) {
        callbackNegative(err.message);
      }
    }, callbackNegative);
  }
};
