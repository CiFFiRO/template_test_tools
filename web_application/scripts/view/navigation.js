class NavigationView {
  constructor() {
    this.panelId = 'panelId';
    this.panel = $('#'+this.panelId);
    this.user = {nickname: '', firstName: '', secondName: '', email: ''};
  }

  isSessionValid() {
    let valid = false;

    $.ajax({
      method: "GET",
      url: "/session_valid",
      async: false
    }).done((answer) => {
      valid = answer.ok;
    }).fail(() => {});

    return valid;
  }

  test() {

  }

  initializeMenu() {
    if (this.isSessionValid()) {
      this.userMenu();
    } else {
      this.guestMenu();
    }
  }

  guestMenu() {
    let registrationButtonId = 'registrationButtonId';
    let loginButtonId = 'loginButtonId';
    this.panel.append('<div class="panel panel-default" align="center" style="' + CENTER_POSITION_STYLE(30, 18) + '">' +
      '<div class="panel-body">' +
      '<h3 class="form-signin-heading" align="center">Добро пожаловать на портал, гость!</h3>' +
      '<div class="btn-group-vertical btn-group-lg top-buffer-20" role="group" >' +
      '<button type="button" class="btn btn-default" id="' + loginButtonId + '">Вход</button>' +
      '<button type="button" class="btn btn-default" id="' + registrationButtonId + '">Регистрация</button>' +
      '</div></div></div>');
    $('#' + loginButtonId).on('click', () => {
      this.panel.empty();
      this.login();
    });
    $('#' + registrationButtonId).on('click', () => {
      this.panel.empty();
      this.registration();
    });
  }

  registration() {
    let emailInputId = 'emailInputId';
    let nicknameInputId = 'nicknameInputId';
    let passwordInputId = 'passwordInputId';
    let passwordRetryInputId = 'passwordRetryInputId';
    let firstNameInputId = 'firstNameInputId';
    let secondNameInputId = 'secondNameInputId';
    let registrationButtonId = 'registrationButtonId';
    let form = {email: '', nickname: '', password: '', firstName: '', secondName: ''};
    let passwordRetryOk = false;
    this.panel.append('<div class="panel panel-default" align="center" style="' + CENTER_POSITION_STYLE(30, 33) + '">' +
      '<div class="panel-body">' +
      '<h3 class="form-signin-heading" align="center">Заполните форму ниже для регистрации.</h3>' +
      '<div class="input-group top-buffer-20"><input id="' + emailInputId + '" type="email" class="form-control" placeholder="E-mail"></div>' +
      '<div class="input-group top-buffer-15"><input id="' + nicknameInputId + '" type="text" class="form-control" placeholder="Псевдоним"></div>' +
      '<div class="input-group top-buffer-15"><input id="' + passwordInputId + '" type="password" class="form-control" placeholder="Пароль"></div>' +
      '<div class="input-group top-buffer-15"><input id="' + passwordRetryInputId + '" type="password" class="form-control" placeholder="Повторите пароль"></div>' +
      '<div class="input-group top-buffer-15"><input id="' + firstNameInputId + '" type="text" class="form-control" placeholder="Имя"></div>' +
      '<div class="input-group top-buffer-15"><input id="' + secondNameInputId + '" type="text" class="form-control" placeholder="Фамилия"></div>' +
      '</div>' +
      '<div class="btn-group btn-group-lg" role="group" >' +
      '<button type="button" class="btn btn-default" id="' + registrationButtonId + '">Зарегистрироваться</button>' +
      '</div>' +
      '</div>');
    function updateButtonState() {
      $('#'+registrationButtonId).prop('disabled', !Validator.registrationForm(form) || !passwordRetryOk);
    }
    updateButtonState();
    $('#' + emailInputId).on('input change', function () {
      form.email = this.value;
      if (Validator.email(form.email)) {
        $(this).parent().removeClass('has-error');
      } else {
        $(this).parent().addClass('has-error');
      }
      updateButtonState();
    });
    $('#' + nicknameInputId).on('input change', function () {
      form.nickname = this.value;
      if (Validator.nickname(form.nickname)) {
        $(this).parent().removeClass('has-error');
      } else {
        $(this).parent().addClass('has-error');
      }
      updateButtonState();
    });
    $('#' + passwordInputId).on('input change', function () {
      form.password = this.value;
      if (Validator.password(form.password)) {
        $(this).parent().removeClass('has-error');
      } else {
        $(this).parent().addClass('has-error');
      }
      updateButtonState();
    });
    $('#' + passwordRetryInputId).on('input change', function () {
      passwordRetryOk = (this.value === form.password);
      if (passwordRetryOk) {
        $(this).parent().removeClass('has-error');
      } else {
        $(this).parent().addClass('has-error');
      }
      updateButtonState();
    });
    $('#' + firstNameInputId).on('input change', function () {
      form.firstName = this.value;
      if (Validator.name(form.firstName)) {
        $(this).parent().removeClass('has-error');
      } else {
        $(this).parent().addClass('has-error');
      }
      updateButtonState();
    });
    $('#' + secondNameInputId).on('input change', function () {
      form.secondName = this.value;
      if (Validator.name(form.secondName)) {
        $(this).parent().removeClass('has-error');
      } else {
        $(this).parent().addClass('has-error');
      }
      updateButtonState();
    });
    $('#' + registrationButtonId).on('click', () => {
      $.post( "/registration", form)
       .done(answer => {
         this.panel.empty();
         if (answer.ok) {
           let codeInputId = 'codeInputId';
           let confirmCodeButtonId = 'confirmCodeButtonId';
           this.panel.append('<div class="panel panel-default" align="center" style="' + CENTER_POSITION_STYLE(40, 17) + '">' +
             '<div class="panel-body">' +
             '<h3 class="form-signin-heading" align="center">Введите код подтверждения регистрации, отправленный на Ваш Email.</h3>' +
             '<div class="input-group top-buffer-20"><input id="' + codeInputId + '" type="text" class="form-control" placeholder="Код"></div>' +
             '<div class="btn-group btn-group-lg top-buffer-20" role="group" >' +
             '<button type="button" class="btn btn-default" id="' + confirmCodeButtonId + '">Подтвердить</button>' +
             '</div></div>');
           $('#' + confirmCodeButtonId).on('click', () => {
             $.post('/registration_confirm', {code: $('#'+codeInputId).val()})
               .done(answer => {
                 if (answer.ok) {
                   this.panel.empty();
                   USER_MESSAGE(this.panelId, 'Регистрация завершена.', 25, 7, () => {
                     this.panel.empty();
                     this.initializeMenu();
                   });
                 } else {
                   USER_MESSAGE(this.panelId, 'Неверный код. Повторите ввод.', 30, 7);
                 }
               })
               .fail(answer => {
                 SERVER_DOWN_MESSAGE(this.panelId);
               });
           });
         } else {
           this.panel.append('<div class="panel panel-default" align="center" style="' + CENTER_POSITION_STYLE(35, 9) + '">' +
             '<div class="panel-body">' +
             '<h3 class="form-signin-heading" align="center">Была отправлена неправильная форма.<br>Регистрация прервана.</h3>' +
             '</div>');
         }
       })
       .fail(() => {
         SERVER_DOWN_MESSAGE(this.panelId);
       });
    });
  }

  login() {
    let loginInputId = 'loginInputId';
    let passwordInputId = 'passwordInputId';
    let signInButtonId = 'signInButtonId';
    this.panel.append('<div class="panel panel-default" align="center" style="' + CENTER_POSITION_STYLE(24, 18) + '">' +
      '<div class="panel-body">' +
      '<h3 class="form-signin-heading" align="center">Введите данные.</h3>' +
      '<div class="input-group top-buffer-20"><input id="' + loginInputId + '" type="text" class="form-control" placeholder="Псевдоним"></div>' +
      '<div class="input-group top-buffer-15"><input id="' + passwordInputId + '" type="password" class="form-control" placeholder="Пароль"></div>' +
      '<div class="btn-group btn-group-lg top-buffer-20" role="group" >' +
      '<button type="button" class="btn btn-default" id="' + signInButtonId + '"><span class="glyphicon glyphicon-log-in" aria-hidden="true"></span></button>' +
      '</div></div></div>');
    $('#' + signInButtonId).on('click', () => {
      $.post('/login', {nickname: $('#'+loginInputId).val(), password: $('#'+passwordInputId).val()})
        .done(answer => {
          if (answer.ok) {
            this.user = answer.user;
            this.panel.empty();
            this.initializeMenu();
          } else {
            USER_MESSAGE(this.panelId, 'Неверные данные. Повторите ввод.', 30, 9);
          }
        })
        .fail(() => {
          SERVER_DOWN_MESSAGE(this.panelId);
        });
    });

  }

  logout() {
    $.ajax({
      method: "GET",
      url: "/logout",
      async: false
    }).done(() => {}).
    fail(() => {});

    this.panel.empty();
    this.initializeMenu();
  }

  userMenu() {
    let viewDocumentationId = 'viewDocumentationId';
    let editTemplateTestTasksButtonId = 'editTemplateTestTasksButtonId';
    let editTemplateTestsButtonId = 'editTemplateTestsButtonId';
    let logoutButtonId = 'logoutButtonId';
    let workspaceId = 'workspaceId';
    this.panel.append(
      '<div class="btn-group-horizontal btn-group-lg top-buffer-20 user-menu-position" role="group" align="center">' +
      '<button type="button" class="btn btn-default" id="' + viewDocumentationId + '">Документация</button>' +
      '<button type="button" class="btn btn-default left-buffer-20" id="' + editTemplateTestTasksButtonId + '">Список ШТЗ</button>' +
      '<button type="button" class="btn btn-default left-buffer-20" id="' + editTemplateTestsButtonId + '">Список ШТ</button>' +
      '<button type="button" class="btn btn-default left-buffer-20" id="' + logoutButtonId + '"><span class="glyphicon glyphicon-log-out" aria-hidden="true"></span></button>' +
      '</div><div id="' + workspaceId + '" class="workspace-position"></div>');
    let workspace = $('#'+workspaceId);

    $('#'+logoutButtonId).on('click', () => {
      this.logout();
    });
    $('#'+viewDocumentationId).on('click', () => {
      workspace.empty();
      workspace.append('<h3 class="form-signin-heading" align="center">Раздел в разработке.</h3>');
    });
    $('#'+editTemplateTestTasksButtonId).on('click', () => {
      workspace.empty();
      this.actionsTemplateTestTasks(workspace);
    });
    $('#'+editTemplateTestsButtonId).on('click', () => {
      workspace.empty();
      this.actionsTemplateTests(workspace);
    });
  }

  actions(workspace, getListCallback, createCallback, uploadCallback, editCallback, downloadCallback, removeCallback,
          generateGIFTCallback) {
    let createTTTButtonId = 'createTTTButtonId';
    let uploadTTTButtonId = 'uploadTTTButtonId';
    let listSpaceId = 'listSpaceId';
    workspace.append('<div class="btn-group-horizontal btn-group-lg top-buffer-20" role="group" align="center">' +
      '<button type="button" class="btn btn-success" id="' + createTTTButtonId + '"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Создать</button>' +
      '<button type="button" class="btn btn-primary left-buffer-20" id="' + uploadTTTButtonId + '"><span class="glyphicon glyphicon-upload" aria-hidden="true"></span> Загрузить</button>' +
      '<div class="container-fluid" id="' + listSpaceId + '"></div></div>');

    let loadListPage, fillList;

    fillList = (listSpace, list, pageId) => {
      listSpace.empty();
      for (let i=0;i<list.length;++i) {
        let buttonEditId = 'buttonEditId_' + i;
        let buttonDownloadId = 'buttonDownloadId_' + i;
        let buttonRemoveId = 'buttonRemoveId_' + i;
        let buttonGenerateGIFT = 'buttonGenerateGIFT_'+i;
        let buttonsText = '';
        if (generateGIFTCallback) {
          buttonsText += '<button id="' + buttonGenerateGIFT + '" type="button" class="btn btn-black top-buffer-20 right-buffer-30">GIFT</button>';
        }
        buttonsText += '<button id="' + buttonEditId + '" type="button" class="btn btn-warning top-buffer-20"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span></button>' +
          '<button id="' + buttonDownloadId + '" type="button" class="btn btn-info left-buffer-30 top-buffer-20"><span class="glyphicon glyphicon-download" aria-hidden="true"></span></button>' +
          '<button id="' + buttonRemoveId + '" type="button" class="btn btn-danger left-buffer-30 top-buffer-20"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>';
        listSpace.append('<div class="row">' +
          '<div class="col-md-8"><h3 class="form-signin-heading" align="left"><span class="left-buffer-20 label label-default">' + list[i].title + '</span></h3></div>' +
          '<div class="col-md-4">' +
          buttonsText +
          '</div>' +
          '</div><hr class="divider">');
        $('#'+buttonEditId).on('click', () => {
          editCallback({templateId: list[i].id});
        });
        $('#'+buttonDownloadId).on('click', () => {
          downloadCallback({templateId: list[i].id});
        });
        $('#'+buttonRemoveId).on('click', () => {
          removeCallback({templateId: list[i].id}, () => {
            loadListPage(0);
          });
        });
        if (generateGIFTCallback) {
          $('#'+buttonGenerateGIFT).on('click', () => {
            generateGIFTCallback({templateId: list[i].id});
          });
        }
      }
      let nextButtonId = 'nextButtonId';
      let prevButtonId = 'prevButtonId';
      listSpace.append('<div class="row">' +
        '<div class="btn-group-horizontal top-buffer-20 bottom-buffer" role="group" >' +
        '<button type="button" class="btn btn-default" id="' + prevButtonId + '"><span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span></button>' +
        '<button type="button" class="btn btn-default left-buffer-20" id="' + nextButtonId + '"><span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span></button>' +
        '</div></div>');
      $('#'+prevButtonId).on('click', () => {
        if (pageId === 0) {
          USER_MESSAGE(this.panelId, 'Это первая страница.', 25, 7);
          return;
        }
        loadListPage(pageId - 1);
      });
      $('#'+nextButtonId).on('click', () => {
        loadListPage(pageId + 1);
      });
    };
    loadListPage = (pageId) => {
      let list = $('#'+listSpaceId);
      getListCallback(pageId, answer => {
        if (answer.ok) {
          if (answer.list.length !== 0) {
            fillList(list, answer.list, pageId);
          } else {
            if (pageId === 0) {
              list.empty();
              list.append('<h3 class="form-signin-heading" align="center">У Вас нет загруженных шаблонов.</h3>');
            } else {
              USER_MESSAGE(this.panelId, 'Это последняя страница.', 25, 7);
            }
          }
        } else {
          OOOPS_MESSAGE(this.panelId);
        }
      });
    };

    loadListPage(0);
    $('#'+uploadTTTButtonId).on('click', () => {
      uploadCallback(() => {
        loadListPage(0);
      });
    });
    $('#'+createTTTButtonId).on('click', () => {
      createCallback();
    });
  }

  actionsTemplateTestTasks(workspace) {
    this.actions(workspace, (pageId, callback) => {
      $.post('/view_list_ttt', {pageId:pageId})
        .done(answer => {
          callback(answer);
        })
        .fail(() => {
          SERVER_DOWN_MESSAGE(this.panelId);
        });
    }, () => {
      workspace.empty();
      let editor = new TemplateTestTaskWeb();
      editor.initialize(workspace.attr('id'), this.panelId);
    }, callback => {
      LOAD_FILES(templateTestTask => {
        $.post('/upload_ttt', {templateTestTask: templateTestTask})
          .done(answer => {
            if (answer.ok) {
              callback();
            } else {
              USER_MESSAGE(this.panelId, 'ШТЗ синтаксически не корректен.', 30, 7);
            }
          })
          .fail(() => {
            SERVER_DOWN_MESSAGE(this.panelId);
          });
      });
    }, data => {
      $.post('/download_ttt', data)
        .done(answer => {
          if (answer.ok) {
            workspace.empty();
            let editor = new TemplateTestTaskWeb();
            editor.load(workspace.attr('id'), this.panelId, answer.templateTestTask, data.templateId);
          } else {
            OOOPS_MESSAGE(this.panelId);
          }
        })
        .fail(() => {SERVER_DOWN_MESSAGE(this.panelId);});
    }, data => {
      $.post('/download_ttt', data)
        .done(answer => {
          if (answer.ok) {
            SAVE_FILE(JSON.stringify(answer.templateTestTask), 'TTT.json');
          } else {
            OOOPS_MESSAGE(this.panelId);
          }
        })
        .fail(() => {SERVER_DOWN_MESSAGE(this.panelId);});
    }, (data, callback) => {
      SHOW_DIALOG(this.panelId, 'Вы действительно хотите удалить выбранный ШТЗ?', 35, 13, () => {
        $.post('/remove_ttt', data)
          .done(answer => {
            if (answer.ok) {
              callback();
            } else {
              OOOPS_MESSAGE(this.panelId);
            }
          })
          .fail(() => {SERVER_DOWN_MESSAGE(this.panelId);});
      });
    });
  }

  actionsTemplateTests(workspace) {
    this.actions(workspace, (pageId, callback) => {
      $.post('/view_list_template_test', {pageId:pageId})
        .done(answer => {
          callback(answer);
        })
        .fail(() => {
          SERVER_DOWN_MESSAGE(this.panelId);
        });
    }, () => {
      workspace.empty();
      this.templateTestEditor(workspace);
    }, callback => {
      LOAD_FILES(templateTest => {
        $.post('/upload_template_test', {templateTest: templateTest})
          .done(answer => {
            if (answer.ok) {
              callback();
            } else {
              USER_MESSAGE(this.panelId, 'ШТ синтаксически не корректен.', 30, 7);
            }
          })
          .fail(() => {
            SERVER_DOWN_MESSAGE(this.panelId);
          });
      });
    }, data => {
      $.post('/download_template_test', data)
        .done(answer => {
          if (answer.ok) {
            workspace.empty();
            this.templateTestEditor(workspace, answer.templateTest, data.templateId);
          } else {
            OOOPS_MESSAGE(this.panelId);
          }
        })
        .fail(() => {SERVER_DOWN_MESSAGE(this.panelId);});
    }, data => {
      $.post('/download_template_test', data)
        .done(answer => {
          if (answer.ok) {
            SAVE_FILE(JSON.stringify(answer.templateTest), 'templateTest.json');
          } else {
            OOOPS_MESSAGE(this.panelId);
          }
        })
        .fail(() => {SERVER_DOWN_MESSAGE(this.panelId);});
    }, (data, callback) => {
      SHOW_DIALOG(this.panelId, 'Вы действительно хотите удалить выбранный ШТ?', 35, 13, () => {
        $.post('/remove_template_test', data)
          .done(answer => {
            if (answer.ok) {
              callback();
            } else {
              OOOPS_MESSAGE(this.panelId);
            }
          })
          .fail(() => {SERVER_DOWN_MESSAGE(this.panelId);});
      });
    }, data => {
      let windowId = 'windowInnerId';
      let okButtonId = 'okButtonInnerId';
      let cancelButtonId = 'cancelButtonInnerId';
      let inputDataId = 'inputDataId';
      this.panel.append(
        '<div class="panel panel-default" align="center" id="' + windowId + '" style="' + CENTER_POSITION_STYLE(25, 15) + '">' +
        '<div class="panel-body">' +
        '<h3 class="form-signin-heading" align="center">Введите число тестов</h3>' +
        '<div class="input-group"><input id="' + inputDataId + '" type="number" class="form-control" placeholder="(1-100)"></div>' +
        '<div class="btn-group-horizontal btn-group-lg top-buffer-20" role="group" align="center">' +
        '<button type="button" class="btn btn-default" id="' + okButtonId + '">Да</button>' +
        '<button type="button" class="btn btn-default left-buffer-20" id="' + cancelButtonId + '">Отмена</button>' +
        '</div></div></div>');
      let input = $('#'+inputDataId);
      $('#'+okButtonId).on('click', () => {
        if (isNaN(+input.val()) || +input.val() > 100 || +input.val() < 1) {
          USER_MESSAGE(this.panelId, 'Некорректное число тестов.', 30, 7);
          return;
        }
        $('#'+windowId).remove();
        window.open('/generate_gift?numberTest='+input.val()+'&templateId='+data.templateId, '_blank');
      });
      $('#'+cancelButtonId).on('click', () => {$('#'+windowId).remove();});
    });
  }

  templateTestEditor(workspace, data, templateId) {
    let templateTest = (data === undefined) ? {title: '', orderType: 0, arrayTTT: []} : data;
    let cloudTemplateId = (templateId === undefined) ? null : templateId;
    let inputTitleId = 'inputTitleId';
    let selectOrderTypeId = 'selectOrderTypeId';
    let addTTTButtonId = 'addTTTButtonId';
    let editListTTTId = 'editListTTTId';
    let downloadButtonId = 'downloadButtonId';
    let uploadButtonId = 'uploadButtonId';
    let listTemplatesId = 'listTemplatesId';
    workspace.append('<div class="container-fluid">' +
      '<div class="row">' +
      '<div class="col-md-12">' +
      '<h3 class="form-signin-heading" align="left">Тема тестового шаблона</h3>' +
      '<div class="input-group"><input id="' + inputTitleId + '" type="text" class="form-control" placeholder="Тема ШТ"></div>' +
      '</div></div><div class="row">' +
      '<div class="col-md-12">' +
      '<h3 class="form-signin-heading" align="left">Порядок тестовых заданий</h3>' +
      '<select title="Порядок" class="selectpicker" id="' + selectOrderTypeId + '" >' +
      '<option value="0">Строго последовательный</option>' +
      '<option value="1">Случайный</option>' +
      '</select></div></div>' +
      '<div class="row">' +
      '<div class="col-md-12">' +
      '<h3>Последовательность ШТЗ</h3>' +
      '<div id="' + listTemplatesId + '" class="container-fluid"></div>' +
      '<button id="' + addTTTButtonId + '" type="button" class="btn btn-success">Добавить ШТЗ</button>' +
      '</div></div>' +
      '<div class="row" id="' + editListTTTId + '">' +
      '</div>' +
      '<div class="btn-group-horizontal top-buffer-20 bottom-buffer btn-group-lg" role="group" align="center">' +
      '<button type="button" id="' + downloadButtonId + '" class="btn btn-info"><span class="glyphicon glyphicon-download" aria-hidden="true"></span> Скачать</button>' +
      '<button type="button" id="' + uploadButtonId + '" class="btn btn-primary left-buffer-30"><span class="glyphicon glyphicon-upload" aria-hidden="true"></span> Загрузить</button>' +
      '</div>' +
      '</div>');
    $('select').selectpicker();
    let inputTitle = $('#'+inputTitleId);
    inputTitle.on('input change', () => {
      templateTest.title = inputTitle.val();
    });
    let selectTag = $('#'+selectOrderTypeId);
    selectTag.on('input change', () => {
      templateTest.orderType = +selectTag.val();
    });
    let listTemplates = $('#'+listTemplatesId);
    let updateListTemplates = () => {
      listTemplates.empty();
      for (let i=0;i<templateTest.arrayTTT.length;++i) {
        let sectionId = 'sectionId_'+i;
        let buttonRemoveId = 'buttonRemoveId_'+i;
        let buttonUpId = 'buttonUpId_'+i;
        let buttonDownId = 'buttonDownId_'+i;
        listTemplates.append('<div class="row" id="' + sectionId + '">' +
          '<div class="col-md-8"><h3 class="form-signin-heading" align="left"><span class="left-buffer-20 label label-default">' + templateTest.arrayTTT[i].title + '</span></h3></div>' +
          '<div class="col-md-4">' +
          '<button id="' + buttonUpId + '" type="button" class="btn btn-default top-buffer-20"><span class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span></button>' +
          '<button id="' + buttonDownId + '" type="button" class="btn btn-default left-buffer-30 top-buffer-20"><span class="glyphicon glyphicon-arrow-down" aria-hidden="true"></span></button>' +
          '<button id="' + buttonRemoveId + '" type="button" class="btn btn-danger left-buffer-45 top-buffer-20"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>' +
          '</div>' +
          '</div><hr class="divider">');
        $('#'+buttonUpId).on('click', () => {
          if (i === 0 || templateTest.arrayTTT.length === 1) {
            return;
          }
          [templateTest.arrayTTT[i-1], templateTest.arrayTTT[i]] = [templateTest.arrayTTT[i], templateTest.arrayTTT[i-1]];
          updateListTemplates();
        });
        $('#'+buttonDownId).on('click', () => {
          if (i === templateTest.arrayTTT.length - 1 || templateTest.arrayTTT.length === 1) {
            return;
          }
          [templateTest.arrayTTT[i], templateTest.arrayTTT[i+1]] = [templateTest.arrayTTT[i+1], templateTest.arrayTTT[i]];
          updateListTemplates();
        });
        $('#'+buttonRemoveId).on('click', () => {
          templateTest.arrayTTT.splice(i, 1);
          updateListTemplates();
        });
      }
    };
    $('#'+addTTTButtonId).on('click', () => {
      let listChoiceId = 'listChoiceId';
      let windowChoiceId = 'windowChoiceId';
      let prevButtonId = 'prevButtonId';
      let closeButtonId = 'closeButtonId';
      let nextButtonId = 'nextButtonId';
      this.panel.append('<div class="panel panel-default" align="center" style="' + CENTER_POSITION_STYLE(60, 30) + 'overflow:auto;" id="' + windowChoiceId + '">' +
        '<div class="container-fluid" id="' + listChoiceId + '">' +
        '</div>'+
        '<div class="btn-group-horizontal top-buffer-20 bottom-buffer" role="group" >' +
        '<button type="button" class="btn btn-default" id="' + prevButtonId + '"><span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span></button>' +
        '<button type="button" class="btn btn-default left-buffer-20" id="' + closeButtonId + '">Закрыть</button>' +
        '<button type="button" class="btn btn-default left-buffer-20" id="' + nextButtonId + '"><span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span></button>' +
        '</div></div>');
      let list = $('#'+listChoiceId);
      let pageId = 0;
      let updatePageList = (answer) => {
        list.empty();
        for (let i=0;i<answer.list.length;++i) {
          let buttonAddId = 'buttonAddId_'+i;
          list.append('<div class="row">' +
            '<div class="col-md-8"><h3 class="form-signin-heading" align="left"><span class="left-buffer-20 label label-default">' + answer.list[i].title + '</span></h3></div>' +
            '<div class="col-md-4">' +
            '<button id="' + buttonAddId + '" type="button" class="btn btn-success top-buffer-20"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button>' +
            '</div>' +
            '</div><hr class="divider">');
          $('#'+buttonAddId).on('click', () => {
            $.post('/download_ttt', {templateId: answer.list[i].id})
              .done(answer => {
                if (answer.ok) {
                  templateTest.arrayTTT.push(answer.templateTestTask);
                  updateListTemplates();
                } else {
                  OOOPS_MESSAGE(this.panelId);
                }
              })
              .fail(() => {SERVER_DOWN_MESSAGE(this.panelId);});
          });
        }
      };
      let viewList = () => {
        $.post('/view_list_ttt', {pageId:pageId})
          .done(answer => {
            if (answer.ok) {
              if (answer.list.length !== 0) {
                updatePageList(answer);
              } else {
                if (pageId === 0) {
                  list.empty();
                  list.append('<h3 class="form-signin-heading" align="center">У Вас нет загруженных ШТЗ.</h3>');
                } else {
                  --pageId;
                  USER_MESSAGE(this.panelId, 'Это последняя страница.', 25, 7);
                }
              }
            } else {
              OOOPS_MESSAGE(this.panelId);
            }
          })
          .fail(() => {
            SERVER_DOWN_MESSAGE(this.panelId);
          });
      };

      viewList();

      $('#'+prevButtonId).on('click', () => {
        if (pageId === 0) {
          USER_MESSAGE(this.panelId, 'Это первая страница.', 25, 7);
          return;
        }
        --pageId;
        viewList();
      });
      $('#'+closeButtonId).on('click', () => {
        $('#'+windowChoiceId).remove();
      });
      $('#'+nextButtonId).on('click', () => {
        ++pageId;
        viewList();
      });
    });
    $('#'+downloadButtonId).on('click', () => {
      SAVE_FILE(JSON.stringify(templateTest), 'templateTest.json');
    });
    $('#'+uploadButtonId).on('click', () => {
      if (cloudTemplateId === null) {
        $.post('/upload_template_test', {templateTest: JSON.stringify(templateTest)})
          .done(answer => {
            if (answer.ok) {
              cloudTemplateId = answer.templateId;
            } else {
              USER_MESSAGE(this.panelId, 'ШТ синтаксически не корректен.', 30, 7);
            }
          })
          .fail(() => {
            SERVER_DOWN_MESSAGE(this.panelId);
          });
      } else {
        $.post('/update_template_test', {templateTest: JSON.stringify(templateTest), templateId: cloudTemplateId})
          .done(answer => {
            if (!answer.ok) {
              USER_MESSAGE(this.panelId, 'ШТ синтаксически не корректен.', 30, 7);
            } else {
              USER_MESSAGE(this.panelId, 'ШТ обновлен.', 20, 7);
            }
          })
          .fail(() => {
            SERVER_DOWN_MESSAGE(this.panelId);
          });
      }
    });

    if (data === undefined) {
      selectTag.val("0");
    } else {
      selectTag.val(''+templateTest.orderType);
      inputTitle.val(templateTest.title);
    }
    inputTitle.change();
    selectTag.change();
    updateListTemplates();
  }
}