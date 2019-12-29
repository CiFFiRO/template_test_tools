const express = require("express");
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const Validator = require('./validator');
const mysql = require("mysql2");
const nodemailer = require('nodemailer');
const generator = require('./generator');
const Log = require('./log');
const process = require('process');
const archiver = require('archiver');
const TemplateAction = require('./template_action');
const Common = require('./common');
const fs = require('fs');
const Ini = require('ini');

const MAX_GENERATION_NUMBER = 50;

let config = Ini.parse(fs.readFileSync(path.join(__dirname, "config.ini"), 'utf-8'));
let logging = new Log(path.join(__dirname, "log.txt"));

logging.log('Server start');

let signals = 'SIGTERM SIGPIPE SIGBUS SIGFPE SIGSEGV SIGILL SIGINT SIGHUP SIGBREAK'.split(' ');
for (let i=0;i<signals.length;++i) {
  process.on(signals[i], (signal) => {
    logging.fatal(`Server stop by receive ${signal} signal`);
    process.exit(0);
  });
}

const transporter = nodemailer.createTransport({
  host: config.Mail.Host,
  port: config.Mail.Port,
  secure: config.Mail.Secure,
  auth: {
    user: config.Mail.User,
    pass: config.Mail.Pass
  }
});

transporter.verify((error, success) => {
  if (error) {
    logging.fatal("Mail connection - " + error.message);
    process.exit(1);
  } else {
    logging.log('Mail connect success');
  }
});

const connection = mysql.createConnection({
  host: config.MySQL.Host,
  user: config.MySQL.User,
  database: config.MySQL.DatabaseName,
  password: config.MySQL.Pass
}).promise();

connection.connect()
  .then(() => {logging.log('MySQL connect success');})
  .catch(error => {
  logging.fatal("MySQL connection - " + error.message);
  process.exit(1);
});

let templateAction = new TemplateAction(connection, config.Server.TemplatesPerPage, logging);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/tools', express.static(path.join(__dirname, "../tools")));
app.use(express.static(path.join(__dirname, "../web_application")));

app.post("/registration", (request, response) => {
  if (!Validator.registrationForm(request.body)) {
    response.send({ok: false});
    return;
  }

  connection.query("SELECT * FROM `server`.`user` WHERE `user`.`e-mail` = ? OR `user`.`nickname` = ?",
    [request.body.email, request.body.nickname])
    .then(results => {
      if (results[0].length === 0) {
        connection.query("INSERT INTO `server`.`form` (`e-mail`, `nickname`, `password_hash`, `first_name`, `second_name`) VALUES (?, ?, ?, ?, ?)",
          [request.body.email, request.body.nickname, Common.getHash(request.body.password),
            request.body.firstName, request.body.secondName])
          .then(results => {
            let insertId = results[0].insertId;
            let time = Common.timeNow();
            let confirmCode = Common.getHash(request.body.email+request.body.nickname+time);
            connection.query('INSERT INTO `server`.`registration` (`time`, `confirm_hash`, `complete`, `form_id`) VALUES (?, ?, ?, ?)',
              [time, confirmCode, 0, insertId])
              .then(() => {
                let mailOptions = {
                  from: 'templatetestportal@mail.ru',
                  to: request.body.email,
                  subject: 'Регистрация на портале TemplateTest',
                  text: 'Здравствуйте!\nВаш код подтверждения регистрации - ' +  confirmCode + '.\nДействителен сутки.' +
                  '\n\n\nПисьмо отправленно автоматически, пожалуйста, не отвечайте на него.'
                };
                transporter.sendMail(mailOptions, function(error, info){
                  if (error) {
                    response.send({ok: false});
                    logging.error('Can\'t send mail - ' + error.message);
                  } else {
                    response.send({ok: true});
                  }
                });
              })
              .catch(err => {
                logging.error('Insert into `server`.`registration`: ' + err.message);
                response.send({ok: false});
              });
          })
          .catch(err => {
            logging.error('Insert into `server`.`form`: ' + err.message);
            response.send({ok: false});
          });
      } else {
        logging.error('Try register not unique form(=' + request.body + ')');
        response.send({ok: false});
      }
    })
    .catch(err => {
      logging.error('Select `server`.`user`: ' + err.message);
      response.send({ok: false});
    });
});

app.post("/registration_confirm", (request, response) => {
  if (!request.body.hasOwnProperty('code')) {
    response.send({ok: false});
    return;
  }

  connection.query("SELECT * FROM `server`.`registration` WHERE `registration`.`confirm_hash` = ?", [request.body.code])
    .then(results => {
      if (results[0].length === 0) {
        response.send({ok: false});
      } else {
        let data = results[0][0];
        if (data.time + config.Server.RegistrationConfirmTimeLimit < Common.timeNow() || data.complete === 1) {
          response.send({ok: false});
        } else {
          connection.query("UPDATE `server`.`registration` SET `registration`.`complete`=1 WHERE `registration`.`confirm_hash` = ?",
            [request.body.code])
            .then(() => {
              connection.query("SELECT * FROM `server`.`form` WHERE `form`.`id` = ?", [data.form_id])
                .then(results => {
                  let form = results[0][0];
                  connection.query("INSERT INTO `server`.`user` (`e-mail`, `nickname`, `password_hash`) VALUES (?, ?, ?)",
                    [form['e-mail'], form.nickname, form.password_hash])
                    .then(results => {
                      let insertId = results[0].insertId;
                      connection.query("INSERT INTO `server`.`description` (`user_id`, `first_name`, `second_name`) VALUES (?, ?, ?)",
                        [insertId, form.first_name, form.second_name])
                        .then(() => {
                          response.send({ok: true});
                        })
                        .catch(err => {
                          logging.error('Insert into `server`.`description`: ' + err.message);
                          response.send({ok: false});
                        });
                    })
                    .catch(err => {
                      logging.error('Insert into `server`.`user`: ' + err.message);
                      response.send({ok: false});
                    });
                })
                .catch(err => {
                  logging.error('Select from `server`.`form`: ' + err.message);
                  response.send({ok: false});
                });
            })
            .catch(err => {
              logging.error('Update `server`.`registration`: ' + err.message);
              response.send({ok: false});
            });
        }
      }
    })
    .catch(err => {
      logging.error('Select from `server`.`registration`: ' + err.message);
      response.send({ok: false});
    });
});

app.post("/login", (request, response) => {
  if (!request.body.hasOwnProperty('nickname') || !request.body.hasOwnProperty('password')) {
    response.send({ok: false});
    return;
  }

  connection.query("SELECT * FROM `server`.`user` WHERE `user`.`password_hash` = ? AND `user`.`nickname` = ?",
    [Common.getHash(request.body.password), request.body.nickname])
    .then(results => {
      if (results[0].length === 1) {
        let sessionCode = Common.getHash(request.headers["user-agent"] + request.ip + request.body.nickname + Common.timeNow());
        let user = {email: results[0][0]['e-mail'], nickname: results[0][0].nickname};
        let userId = results[0][0].id;
        connection.query("SELECT * FROM `server`.`description` WHERE `description`.`user_id` = ?", [userId])
          .then(results => {
            user.firstName = results[0][0].first_name;
            user.secondName = results[0][0].second_name;
            connection.query("INSERT INTO `server`.`session` (`user_id`, `hash`, `time`) VALUES (?, ?, ?)",
              [userId, sessionCode, Common.timeNow()])
              .then(() => {
                response.cookie('sessionCode', sessionCode, {maxAge: 1000 * config.Server.SessionTimeLimit});
                response.send({ok: true, user: user});
              })
              .catch(err => {
                logging.error('Insert into `server`.`session`: ' + err.message);
                response.send({ok: false});
              });
          })
          .catch(err => {
            logging.error('Select form `server`.`description`: ' + err.message);
            response.send({ok: false});
          });
      } else {
        response.send({ok: false});
      }
    })
    .catch(err => {
      logging.error('Select form `server`.`user`: ' + err.message);
      response.send({ok: false});
    });
});

function sessionValidCheck(sessionCode, callbackPositive, callbackNegative) {
  connection.query("SELECT * FROM `server`.`session` WHERE `session`.`hash` = ?", [sessionCode])
    .then(results => {
      if (results[0].length > 0) {
        if (results[0][0].time + config.Server.SessionTimeLimit > Common.timeNow()) {
          callbackPositive(results[0][0].user_id);
        } else {
          callbackNegative();
        }
      } else {
        callbackNegative();
      }
    })
    .catch(err => {
      logging.error('Select form `server`.`session`: ' + err.message);
      callbackNegative();
    });
}

app.get("/session_valid", (request, response) => {
  if (request.cookies.sessionCode === undefined) {
    response.send({ok: false});
    return;
  }

  sessionValidCheck(request.cookies.sessionCode,
    () => {response.send({ok: true});},
    () => {response.send({ok: false});});
});

app.get("/logout", (request, response) => {
  if (request.cookies.sessionCode === undefined) {
    response.send('');
    return;
  }

  connection.query("UPDATE `server`.`session` SET `session`.`time`=0 WHERE `session`.`hash` = ?",
    [request.cookies.sessionCode])
    .then(request => {
      response.cookie('sessionCode', '', {maxAge: 0});
      response.send('');
    })
    .catch(err => {
      logging.error('Update `server`.`session`: ' + err.message);
      response.send('');
    });
});

let urls = [[
  "/view_list_template_test_task", "/upload_template_test_task", "/update_template_test_task",
  "/download_template_test_task", "/remove_template_test_task", "/generate_test_task"
], [
  "/view_list_template_test", "/upload_template_test", "/update_template_test", "/download_template_test",
  "/remove_template_test", "/generate_test"
], [
  "/view_list_template_task", "/upload_template_task", "/update_template_task", "/download_template_task",
  "/remove_template_task", "/generate_task"
], [
  "/view_list_template_group_task", "/upload_template_group_task", "/update_template_group_task",
  "/download_template_group_task", "/remove_template_group_task", "/generate_group_task"
]];
let typeByIndex = [templateAction.templateTypes.testTask, templateAction.templateTypes.test,
  templateAction.templateTypes.task, templateAction.templateTypes.groupTask];
let checkTemplateByIndex = [
  (template) => {
    try {
      generator.checkTemplateTestTask(template);
    } catch (err) {
      return false;
    }
    return true;
  }, (template) => {
    return generator.checkTemplateTest(template);
  }, (template) => {
    try {
      generator.checkTemplateTask(template);
    } catch (err) {
      return false;
    }
    return true;
  }, (template) => {
    return generator.checkTemplateGroupTask(template);
  }
];
let generateContentByIndex = [
  (template) => {
    return generator.translateTestTaskToGIFT(generator.generateTestTaskFromTemplateTestTask(template));
  }, (template) => {
    return generator.translateTestToGIFT(generator.generateTestFormTemplateTest(template));
  }, (template) => {
    return generator.translateTaskToTXT(generator.generateTaskFromTemplateTask(template));
  }, (template) => {
    return generator.translateGroupTaskToTXT(generator.generateGroupTaskFromTemplateGroupTask(template));
  }
];

for (let indexTypeTemplate=0;indexTypeTemplate<urls.length;++indexTypeTemplate) {
  app.post(urls[indexTypeTemplate][0], (request, response) => {
    if (request.cookies.sessionCode === undefined || !request.body.hasOwnProperty('pageId')
      || isNaN(+request.body.pageId) || request.body.pageId < 0) {
      response.send({ok: false});
      return;
    }

    sessionValidCheck(request.cookies.sessionCode,
      userId => {
        templateAction.viewList(userId, request.body.pageId, typeByIndex[indexTypeTemplate], results => {
          let list = [];
          for (let i = 0; i < results[0].length; ++i) {
            let template = JSON.parse(Common.uncompressString(results[0][i].template));
            list.push({title: template.title, id: results[0][i].id});
          }
          response.send({ok: true, list: list});
        }, () => {
          response.send({ok: false});
        });
      },
      () => {
        response.send({ok: false});
      });
  });

  app.post(urls[indexTypeTemplate][1], (request, response) => {
    if (request.cookies.sessionCode === undefined || !request.body.hasOwnProperty('template')) {
      response.send({ok: false});
      return;
    }

    try {
      if (!checkTemplateByIndex[indexTypeTemplate](JSON.parse(request.body.template))) {
        response.send({ok: false});
        return;
      }
    } catch (err) {
      response.send({ok: false});
      return;
    }

    sessionValidCheck(request.cookies.sessionCode,
      userId => {
        templateAction.upload(userId, typeByIndex[indexTypeTemplate], request.body.template,
          results => {
            response.send({ok: true, templateId: results[0].insertId});
          }, () => {
            response.send({ok: false});
          });
      },
      () => {
        response.send({ok: false});
      });
  });

  app.post(urls[indexTypeTemplate][2], (request, response) => {
    if (request.cookies.sessionCode === undefined || !request.body.hasOwnProperty('templateId')
      || isNaN(+request.body.templateId) || request.body.templateId < 0
      || !request.body.hasOwnProperty('template')) {
      response.send({ok: false});
      return;
    }

    try {
      if (!checkTemplateByIndex[indexTypeTemplate](JSON.parse(request.body.template))) {
        response.send({ok: false});
        return;
      }
    } catch (err) {
      response.send({ok: false});
      return;
    }

    sessionValidCheck(request.cookies.sessionCode,
      userId => {
        templateAction.update(userId, request.body.templateId, request.body.template, typeByIndex[indexTypeTemplate], () => {
          response.send({ok: true});
        }, () => {
          response.send({ok: false});
        });
      },
      () => {
        response.send({ok: false});
      });
  });

  app.post(urls[indexTypeTemplate][3], (request, response) => {
    if (request.cookies.sessionCode === undefined || !request.body.hasOwnProperty('templateId')
      || isNaN(+request.body.templateId) || request.body.templateId < 0) {
      response.send({ok: false});
      return;
    }

    sessionValidCheck(request.cookies.sessionCode,
      userId => {
        templateAction.download(userId, request.body.templateId, typeByIndex[indexTypeTemplate], results => {
          if (results[0].length === 1) {
            response.send({ok: true, template: JSON.parse(Common.uncompressString(results[0][0].template))});
          } else {
            response.send({ok: false});
          }
        }, () => {
          response.send({ok: false});
        });
      },
      () => {
        response.send({ok: false});
      });
  });

  app.post(urls[indexTypeTemplate][4], (request, response) => {
    if (request.cookies.sessionCode === undefined || !request.body.hasOwnProperty('templateId')
      || isNaN(+request.body.templateId) || request.body.templateId < 0) {
      response.send({ok: false});
      return;
    }

    sessionValidCheck(request.cookies.sessionCode,
      userId => {
        templateAction.remove(userId, request.body.templateId, typeByIndex[indexTypeTemplate], () => {
          response.send({ok: true});
        }, () => {
          response.send({ok: false});
        });
      },
      () => {
        response.send({ok: false});
      });
  });

  app.use(urls[indexTypeTemplate][5], (request, response) => {
    if (request.cookies.sessionCode === undefined || !request.query.hasOwnProperty('templateId') ||
      !request.query.hasOwnProperty('number') || isNaN(+request.query.number) || +request.query.number <= 0
      || +request.query.number > MAX_GENERATION_NUMBER || isNaN(+request.query.templateId) || +request.query.templateId < 0) {
      response.send({ok: false});
      return;
    }

    let number = +request.query.number;
    let templateId = +request.query.templateId;

    sessionValidCheck(request.cookies.sessionCode,
      userId => {
        templateAction.generate(userId, templateId, typeByIndex[indexTypeTemplate], number,
          generateContentByIndex[indexTypeTemplate], (content) => {
            const archive = archiver('zip');
            response.attachment('content.zip');
            archive.pipe(response);
            for (let i = 0; i < content.length; ++i) {
              archive.append(content[i][1], {name: content[i][0]});
            }
            archive.finalize();
          }, message => {
            response.send('Ошибка в скрипте обратной связи: ' + message);
          });
      },
      () => {
        response.send('Упс, что-то пошло не так...');
      });
  });
}

app.listen(config.Server.ListenPort);
