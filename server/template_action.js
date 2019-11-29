module.exports = class TemplateAction {
  static upload(userId, isTemplateTest, template, callbackPositive, callbackNegative) {
    let tableName = isTemplateTest ? 'template_test' : 'template_test_task';
    connection.query("INSERT INTO `server`.`" + tableName + "` SET ?",
      {user_id: userId, template: compressString(template)})
      .then(results => {callbackPositive(results);})
      .catch(err => {
        logining.error('Insert into `server`.`'+tableName+'`: ' + err.message);
        callbackNegative();
      });
  }

  static download(userId, templateId, isTemplateTest, callbackPositive, callbackNegative) {
    let tableName = isTemplateTest ? 'template_test' : 'template_test_task';
    connection.query("SELECT * FROM `server`.`"+tableName+"` WHERE `"+tableName+"`.`id`=? AND `"+tableName+"`.`user_id`=?",
      [templateId, userId])
      .then(results => {
        callbackPositive(results);
      })
      .catch((err) => {
        logining.error('Select from `server`.`'+tableName+'`: ' + err.message);
        callbackNegative();
      });
  }

  static remove(userId, templateId, isTemplateTest, callbackPositive, callbackNegative) {
    let tableName = isTemplateTest ? 'template_test' : 'template_test_task';
    connection.query("SELECT * FROM `server`.`"+tableName+"` WHERE `"+tableName+"`.`id`=? AND `"+tableName+"`.`user_id`=?",
      [templateId, userId])
      .then(results => {
        if (results[0].length === 1) {
          connection.query("DELETE FROM `server`.`"+tableName+"` WHERE `"+tableName+"`.`id`=? AND `"+tableName+"`.`user_id`=?",
            [templateId, userId])
            .then(() => {
              callbackPositive();
            })
            .catch((err) => {
              logining.error('Delete from `server`.`'+tableName+'`: ' + err.message);
              callbackNegative();
            });
        } else {
          callbackNegative();
        }
      })
      .catch((err) => {
        logining.error('Select from `server`.`'+tableName+'`: ' + err.message);
        callbackNegative();
      });
  }

  static update(userId, templateId, templateTestTask, isTemplateTest, callbackPositive, callbackNegative) {
    let tableName = isTemplateTest ? 'template_test' : 'template_test_task';
    connection.query("SELECT * FROM `server`.`"+tableName+"` WHERE `"+tableName+"`.`id`=? AND `"+tableName+"`.`user_id`=?",
      [templateId, userId])
      .then(results => {
        if (results[0].length === 1) {
          connection.query("UPDATE `server`.`"+tableName+"` SET `"+tableName+"`.`template`=? WHERE `"+tableName+"`.`id`=? AND `"+tableName+"`.`user_id`=?",
            [compressString(templateTestTask), templateId, userId])
            .then(() => {
              callbackPositive();
            })
            .catch((err) => {
              logining.error('Update `server`.`'+tableName+'`: ' + err.message);
              callbackNegative();
            });
        } else {
          callbackNegative();
        }
      })
      .catch((err) => {
        logining.error('Select from `server`.`'+tableName+'`: ' + err.message);
        callbackNegative();
      });
  }

  static viewList(userId, pageId, isTemplateTest, callbackPositive, callbackNegative) {
    let tableName = isTemplateTest ? 'template_test' : 'template_test_task';
    let offset = pageId * TEMPLATES_PER_PAGE;
    connection.query("SELECT * FROM `server`.`" + tableName + "` WHERE `" + tableName + "`.`user_id`=? LIMIT " +
      TEMPLATES_PER_PAGE + " OFFSET " + offset, [userId])
      .then(results => {
        callbackPositive(results);
      })
      .catch((err) => {
        logining.error('Select from `server`.`'+tableName+'`: ' + err.message);
        callbackNegative();
      });
  }
};
