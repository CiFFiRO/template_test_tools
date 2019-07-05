const express = require("express");
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const validator = require('./validator')
const mysql = require("mysql2");
const CryptoJS = require('crypto-js');
const nodemailer = require('nodemailer');
const translator = require('../tools/translator/translator');
const zlib = require('zlib');
const log = require('./log');
const process = require('process');


const SERVER_LISTEN_PORT = 4001;
const REGISTRATION_CONFIRM_TIME_LIMIT = 24*60*60;
const SESSION_TIME_LIMIT = 24*60*60;
const LOG_FILE_NAME = path.join(__dirname, "./log.txt");
const TEMPLATES_PER_PAGE = 10;
const MAIL_HOST = "smtp.mail.ru";
const MAIL_PORT = 465;
const MAIL_SECURE = true;
const MAIL_USER = "templatetestportal@mail.ru";
const MAIL_USER_PASS = "nl5BRW8xCIYNDZU59hIYh9Ys6hf4klkw";
const MYSQL_HOST = "localhost";
const MYSQL_USER = "main";
const MYSQL_DATABASE_NAME = "server";
const MYSQL_USER_PASS = "mainpassword";

function getHash(string) {
  return CryptoJS.SHA256(string).toString(CryptoJS.enc.Hex);
}

function timeNow() {
  return Math.floor(Date.now()/1000);
}

function compressString(data) {
  let input = Buffer.from(data, 'utf8');
  return zlib.deflateSync(input);
}

function uncompressString(data) {
  return zlib.inflateSync(Buffer.from(data, 'base64')).toString();
}

let logining = new log(LOG_FILE_NAME);

logining.log('Server start');

let signals = 'SIGTERM SIGPIPE SIGBUS SIGFPE SIGSEGV SIGILL SIGINT SIGHUP SIGBREAK'.split(' ');
for (let i=0;i<signals.length;++i) {
  process.on(signals[i], (signal) => {
    logining.fatal(`Server stop by receive ${signal} signal`);
    process.exit(0);
  });
}


const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PORT,
  secure: MAIL_SECURE,
  auth: {
    user: MAIL_USER,
    pass: MAIL_USER_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    logining.fatal("Mail connection - " + error.message);
    process.exit(1);
  } else {
    logining.log('Mail connect success');
  }
});

const connection = mysql.createConnection({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  database: MYSQL_DATABASE_NAME,
  password: MYSQL_USER_PASS
}).promise();

connection.connect()
  .then(() => {logining.log('MySQL connect success');})
  .catch(error => {
  logining.fatal("MySQL connection - " + error.message);
  process.exit(1);
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/tools', express.static(path.join(__dirname, "../tools")));
app.use(express.static(path.join(__dirname, "../web_application")));

app.post("/registration", (request, response) => {
  if (!validator.registrationForm(request.body)) {
    response.send({ok: false});
    return;
  }

  connection.query("SELECT * FROM `server`.`user` WHERE `user`.`e-mail` = ? OR `user`.`nickname` = ?",
    [request.body.email, request.body.nickname])
    .then(results => {
      if (results[0].length === 0) {
        connection.query("INSERT INTO `server`.`form` (`e-mail`, `nickname`, `password_hash`, `first_name`, `second_name`) VALUES (?, ?, ?, ?, ?)",
          [request.body.email, request.body.nickname, getHash(request.body.password),
            request.body.firstName, request.body.secondName])
          .then(results => {
            let insertId = results[0].insertId;
            let time = timeNow();
            let confirmCode = getHash(request.body.email+request.body.nickname+time);
            connection.query('INSERT INTO `server`.`registration` (`time`, `confirm_hash`, `complete`, `form_id`) VALUES (?, ?, ?, ?)',
              [time, confirmCode, 0, insertId])
              .then(() => {
                let mailOptions = {
                  from: 'templatetestportal@mail.ru',
                  to: 'new_mail_conf@protonmail.com',
                  subject: 'Регистрация на портале TemplateTest',
                  text: 'Здравствуйте!\nВаш код подтверждения регистрации - ' +  confirmCode + '.\nДействителен сутки.' +
                  '\n\n\nПисьмо отправленно автоматически, пожалуйста, не отвечайте на него.'
                };
                transporter.sendMail(mailOptions, function(error, info){
                  if (error) {
                    response.send({ok: false});
                    logining.error('Can\'t send mail - ' + error.message);
                  } else {
                    response.send({ok: true});
                  }
                });
              })
              .catch(err => {
                logining.error('Insert into `server`.`registration`: ' + err.message);
                response.send({ok: false});
              });
          })
          .catch(err => {
            logining.error('Insert into `server`.`form`: ' + err.message);
            response.send({ok: false});
          });
      } else {
        logining.error('Try register not unique form(=' + request.body + ')');
        response.send({ok: false});
      }
    })
    .catch(err => {
      logining.error('Select `server`.`user`: ' + err.message);
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
        if (data.time + REGISTRATION_CONFIRM_TIME_LIMIT < timeNow() || data.complete === 1) {
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
                          logining.error('Insert into `server`.`description`: ' + err.message);
                          response.send({ok: false});
                        });
                    })
                    .catch(err => {
                      logining.error('Insert into `server`.`user`: ' + err.message);
                      response.send({ok: false});
                    });
                })
                .catch(err => {
                  logining.error('Select from `server`.`form`: ' + err.message);
                  response.send({ok: false});
                });
            })
            .catch(err => {
              logining.error('Update `server`.`registration`: ' + err.message);
              response.send({ok: false});
            });
        }
      }
    })
    .catch(err => {
      logining.error('Select from `server`.`registration`: ' + err.message);
      response.send({ok: false});
    });
});

app.post("/login", (request, response) => {
  if (!request.body.hasOwnProperty('nickname') || !request.body.hasOwnProperty('password')) {
    response.send({ok: false});
    return;
  }

  connection.query("SELECT * FROM `server`.`user` WHERE `user`.`password_hash` = ? AND `user`.`nickname` = ?",
    [getHash(request.body.password), request.body.nickname])
    .then(results => {
      if (results[0].length === 1) {
        let sessionCode = getHash(request.headers["user-agent"] + request.ip + request.body.nickname + timeNow());
        let user = {email: results[0][0]['e-mail'], nickname: results[0][0].nickname};
        let userId = results[0][0].id;
        connection.query("SELECT * FROM `server`.`description` WHERE `description`.`user_id` = ?", [userId])
          .then(results => {
            user.firstName = results[0][0].first_name;
            user.secondName = results[0][0].second_name;
            connection.query("INSERT INTO `server`.`session` (`user_id`, `hash`, `time`) VALUES (?, ?, ?)",
              [userId, sessionCode, timeNow()])
              .then(() => {
                response.cookie('sessionCode', sessionCode, {maxAge: 1000 * SESSION_TIME_LIMIT});
                response.send({ok: true, user: user});
              })
              .catch(err => {
                logining.error('Insert into `server`.`session`: ' + err.message);
                response.send({ok: false});
              });
          })
          .catch(err => {
            logining.error('Select form `server`.`description`: ' + err.message);
            response.send({ok: false});
          });
      } else {
        response.send({ok: false});
      }
    })
    .catch(err => {
      logining.error('Select form `server`.`user`: ' + err.message);
      response.send({ok: false});
    });
});

function sessionValidCheck(sessionCode, callbackPositive, callbackNegative) {
  connection.query("SELECT * FROM `server`.`session` WHERE `session`.`hash` = ?", [sessionCode])
    .then(results => {
      if (results[0].length > 0) {
        if (results[0][0].time + SESSION_TIME_LIMIT > timeNow()) {
          callbackPositive(results[0][0].user_id);
        } else {
          callbackNegative();
        }
      } else {
        callbackNegative();
      }
    })
    .catch(err => {
      logining.error('Select form `server`.`session`: ' + err.message);
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
      logining.error('Update `server`.`session`: ' + err.message);
      response.send('');
    });
});

app.post("/upload_ttt", (request, response) => {
  if (request.cookies.sessionCode === undefined || !request.body.hasOwnProperty('templateTestTask')) {
    response.send({ok: false});
    return;
  }
  try {
    translator.checkTTT(JSON.parse(request.body.templateTestTask));
  } catch (err) {
    response.send({ok: false});
    return;
  }

  sessionValidCheck(request.cookies.sessionCode,
    (userId) => {
      connection.query("INSERT INTO `server`.`template_test_task` SET ?",
        {user_id: userId, template: compressString(request.body.templateTestTask)})
        .then(results => {response.send({ok: true, templateId: results[0].insertId});})
        .catch(err => {
          logining.error('Insert into `server`.`template_test_task`: ' + err.message);
          response.send({ok: false});
        });
    },
    () => {response.send({ok: false});});
});

app.post("/view_list_ttt", (request, response) => {
  if (request.cookies.sessionCode === undefined || !request.body.hasOwnProperty('pageId')
    || isNaN(+request.body.pageId) || request.body.pageId < 0) {
    response.send({ok: false});
    return;
  }

  let offset = request.body.pageId * TEMPLATES_PER_PAGE;

  sessionValidCheck(request.cookies.sessionCode,
    (userId) => {
      connection.query("SELECT * FROM `server`.`template_test_task` WHERE `template_test_task`.`user_id`=? LIMIT " +
        TEMPLATES_PER_PAGE + " OFFSET " + offset, [userId])
        .then(results => {
          let list = [];
          for (let i=0;i<results[0].length;++i) {
            let ttt = JSON.parse(uncompressString(results[0][i].template));
            list.push({title: ttt.title, id: results[0][i].id});
          }
          response.send({ok: true, list: list});
        })
        .catch((err) => {
          logining.error('Select from `server`.`template_test_task`: ' + err.message);
          response.send({ok: false});
        });
    },
    () => {response.send({ok: false});});
});

app.post("/download_ttt", (request, response) => {
  if (request.cookies.sessionCode === undefined || !request.body.hasOwnProperty('templateId')
    || isNaN(+request.body.templateId) || request.body.templateId < 0) {
    response.send({ok: false});
    return;
  }

  sessionValidCheck(request.cookies.sessionCode,
    (userId) => {
      connection.query("SELECT * FROM `server`.`template_test_task` WHERE `template_test_task`.`id`=? AND `template_test_task`.`user_id`=?",
        [request.body.templateId, userId])
        .then(results => {
          if (results[0].length === 1) {
            response.send({ok: true, templateTestTask: JSON.parse(uncompressString(results[0][0].template))});
          } else {
            response.send({ok: false});
          }
        })
        .catch((err) => {
          logining.error('Select from `server`.`template_test_task`: ' + err.message);
          response.send({ok: false});
        });
    },
    () => {response.send({ok: false});});
});

app.post("/remove_ttt", (request, response) => {
  if (request.cookies.sessionCode === undefined || !request.body.hasOwnProperty('templateId')
    || isNaN(+request.body.templateId) || request.body.templateId < 0) {
    response.send({ok: false});
    return;
  }

  sessionValidCheck(request.cookies.sessionCode,
    (userId) => {
      connection.query("SELECT * FROM `server`.`template_test_task` WHERE `template_test_task`.`id`=? AND `template_test_task`.`user_id`=?",
        [request.body.templateId, userId])
        .then(results => {
          if (results[0].length === 1) {
            connection.query("DELETE FROM `server`.`template_test_task` WHERE `template_test_task`.`id`=? AND `template_test_task`.`user_id`=?",
              [request.body.templateId, userId])
              .then(() => {
                response.send({ok: true});
              })
              .catch((err) => {
                logining.error('Delete from `server`.`template_test_task`: ' + err.message);
                response.send({ok: false});
              });
          } else {
            response.send({ok: false});
          }
        })
        .catch((err) => {
          logining.error('Select from `server`.`template_test_task`: ' + err.message);
          response.send({ok: false});
        });
    },
    () => {response.send({ok: false});});
});

app.post("/update_ttt", (request, response) => {
  if (request.cookies.sessionCode === undefined || !request.body.hasOwnProperty('templateId')
    || isNaN(+request.body.templateId) || request.body.templateId < 0
    || !request.body.hasOwnProperty('templateTestTask')) {
    response.send({ok: false});
    return;
  }

  try {
    translator.checkTTT(JSON.parse(request.body.templateTestTask));
  } catch (err) {
    response.send({ok: false});
    return;
  }

  sessionValidCheck(request.cookies.sessionCode,
    (userId) => {
      connection.query("SELECT * FROM `server`.`template_test_task` WHERE `template_test_task`.`id`=? AND `template_test_task`.`user_id`=?",
        [request.body.templateId, userId])
        .then(results => {
          if (results[0].length === 1) {
            connection.query("UPDATE `server`.`template_test_task` SET `template_test_task`.`template`=? WHERE `template_test_task`.`id`=? AND `template_test_task`.`user_id`=?",
              [compressString(request.body.templateTestTask), request.body.templateId, userId])
              .then(() => {
                response.send({ok: true});
              })
              .catch((err) => {
                logining.error('Update `server`.`template_test_task`: ' + err.message);
                response.send({ok: false});
              });
          } else {
            response.send({ok: false});
          }
        })
        .catch((err) => {
          logining.error('Select from `server`.`template_test_task`: ' + err.message);
          response.send({ok: false});
        });
    },
    () => {response.send({ok: false});});
});


app.listen(SERVER_LISTEN_PORT);
