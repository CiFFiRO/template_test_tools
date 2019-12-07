class NavigationView {
  constructor() {
    this.panelId = 'panelId';
    this.panel = $('#'+this.panelId);
    this.user = {nickname: '', firstName: '', secondName: '', email: ''};
    this.maxGenerationNumber = 50;
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
    let editTemplateTasksButtonId = 'editTemplateTasksButtonId';
    let editTemplateGroupTasksButtonId = 'editTemplateGroupTasksButtonId';
    let logoutButtonId = 'logoutButtonId';
    let workspaceId = 'workspaceId';
    this.panel.append(
      '<div class="btn-group-horizontal btn-group-lg top-buffer-20 user-menu-position" role="group" align="center">' +
      '<button type="button" class="btn btn-default" id="' + viewDocumentationId + '">Документация</button>' +
      '<button type="button" class="btn btn-default left-buffer-20" id="' + editTemplateTestTasksButtonId + '">Список ШТЗ</button>' +
      '<button type="button" class="btn btn-default left-buffer-20" id="' + editTemplateTestsButtonId + '">Список ШТ</button>' +
      '<button type="button" class="btn btn-default left-buffer-20" id="' + editTemplateTasksButtonId + '">Список ШЗ</button>' +
      '<button type="button" class="btn btn-default left-buffer-20" id="' + editTemplateGroupTasksButtonId + '">Список ШГЗ</button>' +
      '<button type="button" class="btn btn-default left-buffer-20" id="' + logoutButtonId + '"><span class="glyphicon glyphicon-log-out" aria-hidden="true"></span></button>' +
      '</div><div id="' + workspaceId + '" class="workspace-position container-fluid"></div>');
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
    $('#'+editTemplateTasksButtonId).on('click', () => {
      workspace.empty();
      this.actionsTemplateTasks(workspace);
    });
    $('#'+editTemplateGroupTasksButtonId).on('click', () => {
      workspace.empty();
      this.actionsTemplateGroupTasks(workspace);
    });
  }

  actions(workspace, createCallback, editCallback, urlViewList, urlUpload, urlDownload, urlRemove, urlGenerate) {
    let createTemplateButtonId = 'createTemplateButtonId';
    let uploadTemplateButtonId = 'uploadTemplateButtonId';
    let listSpaceId = 'listSpaceId';
    workspace.append(`<div class="container-fluid" ><div class="row">
      <div class="btn-group-horizontal btn-group-lg top-buffer-20" role="group" align="center">
      <button type="button" class="btn btn-success" id="${createTemplateButtonId}"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Создать</button>
      <button type="button" class="btn btn-primary left-buffer-20" id="${uploadTemplateButtonId}"><span class="glyphicon glyphicon-upload" aria-hidden="true"></span> Загрузить</button>
      </div><div class="row top-buffer-20"><div class="container-fluid" id="${listSpaceId}"></div></div></div></div>`);

    let loadListPage, fillList;

    fillList = (listSpace, list, pageId) => {
      listSpace.empty();
      listSpace.append(`<div class="row ">
        <div class="col-md-8 border"><p class="top-buffer-7" align="center">Заголовок шаблона</p></div>
        <div class="col-md-4 border"><p class="top-buffer-7" align="center">Действия</p></div>
        </div>`);
      for (let i=0;i<list.length;++i) {
        let buttonEditId = 'buttonEditId_' + i;
        let buttonDownloadId = 'buttonDownloadId_' + i;
        let buttonRemoveId = 'buttonRemoveId_' + i;
        let buttonGenerate = 'buttonGenerate_'+i;
        listSpace.append(`<div class="row  border">
          <div class="col-md-8"><p class="top-buffer-7">${list[i].title}</p></div>
          <div class="col-md-4" align="center">
          <button id="${buttonGenerate}" type="button" class="btn btn-black "><span class="glyphicon glyphicon-cog" aria-hidden="true"></span></button>
          <button id="${buttonEditId}" type="button" class="btn btn-warning left-buffer-30 "><span class="glyphicon glyphicon-edit" aria-hidden="true"></span></button>
          <button id="${buttonDownloadId}" type="button" class="btn btn-info left-buffer-30 "><span class="glyphicon glyphicon-download" aria-hidden="true"></span></button>
          <button id="${buttonRemoveId}" type="button" class="btn btn-danger left-buffer-30 "><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
          </div></div>`);
        $('#'+buttonEditId).on('click', () => {
          editCallback({templateId: list[i].id});
        });
        $('#'+buttonDownloadId).on('click', () => {
          $.post('/'+urlDownload, {templateId: list[i].id})
            .done(answer => {
              if (answer.ok) {
                SAVE_FILE(JSON.stringify(answer.template), 'Template.json');
              } else {
                OOOPS_MESSAGE(this.panelId);
              }
            })
            .fail(() => {SERVER_DOWN_MESSAGE(this.panelId);});
        });
        $('#'+buttonRemoveId).on('click', () => {
          SHOW_DIALOG(this.panelId, 'Вы действительно хотите удалить выбранный шаблон?', 35, 13, () => {
            $.post('/' + urlRemove, {templateId: list[i].id})
              .done(answer => {
                if (answer.ok) {
                  loadListPage(0);
                } else {
                  OOOPS_MESSAGE(this.panelId);
                }
              })
              .fail(() => {SERVER_DOWN_MESSAGE(this.panelId);});
          });
        });
        $('#'+buttonGenerate).on('click', () => {
          let windowId = 'windowInnerId';
          let okButtonId = 'okButtonInnerId';
          let cancelButtonId = 'cancelButtonInnerId';
          let inputDataId = 'inputDataId';
          this.panel.append(
            '<div class="panel panel-default" align="center" id="' + windowId + '" style="' + CENTER_POSITION_STYLE(25, 15) + '">' +
            '<div class="panel-body">' +
            '<h3 class="form-signin-heading" align="center">Введите число тестов</h3>' +
            '<div class="input-group"><input id="' + inputDataId + '" type="number" class="form-control" placeholder="(1-50)"></div>' +
            '<div class="btn-group-horizontal btn-group-lg top-buffer-20" role="group" align="center">' +
            '<button type="button" class="btn btn-default" id="' + okButtonId + '">Да</button>' +
            '<button type="button" class="btn btn-default left-buffer-20" id="' + cancelButtonId + '">Отмена</button>' +
            '</div></div></div>');
          let input = $('#'+inputDataId);
          $('#'+okButtonId).on('click', () => {
            if (isNaN(+input.val()) || +input.val() > this.maxGenerationNumber || +input.val() < 1) {
              USER_MESSAGE(this.panelId, 'Некорректное число вариантов.', 30, 7);
              return;
            }
            $('#'+windowId).remove();
            window.open(`/${urlGenerate}?number=${input.val()}&templateId=${list[i].id}`, '_blank');
          });
          $('#'+cancelButtonId).on('click', () => {$('#'+windowId).remove();});
        });
      }
      let nextButtonId = 'nextButtonId';
      let prevButtonId = 'prevButtonId';
      listSpace.append('<div class="row" align="center">' +
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
      $.post('/'+urlViewList, {pageId:pageId})
        .done(answer => {
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
        })
        .fail(() => {
          SERVER_DOWN_MESSAGE(this.panelId);
        });
    };

    loadListPage(0);
    $('#'+uploadTemplateButtonId).on('click', () => {
      LOAD_FILES(template => {
        $.post('/'+urlUpload, {template: template})
          .done(answer => {
            if (answer.ok) {
              loadListPage(0);
            } else {
              USER_MESSAGE(this.panelId, 'Шаблон синтаксически не корректен.', 30, 7);
            }
          })
          .fail(() => {
            SERVER_DOWN_MESSAGE(this.panelId);
          });
      });
    });
    $('#'+createTemplateButtonId).on('click', () => {
      createCallback();
    });
  }

  actionsTemplateTestTasks(workspace) {
    this.actions(workspace, () => {
      workspace.empty();
      let editor = new EditorTemplateTestTask();
      editor.initialize(workspace.attr('id'), this.panelId);
    },data => {
      $.post('/download_template_test_task', data)
        .done(answer => {
          if (answer.ok) {
            workspace.empty();
            let editor = new EditorTemplateTestTask();
            editor.initialize(workspace.attr('id'), this.panelId);
            editor.load(answer.template, data.templateId);
          } else {
            OOOPS_MESSAGE(this.panelId);
          }
        })
        .fail(() => {SERVER_DOWN_MESSAGE(this.panelId);});
    },'view_list_template_test_task',  'upload_template_test_task',
      'download_template_test_task', 'remove_template_test_task', 'generate_test_task');
  }

  actionsTemplateTests(workspace) {
    this.actions(workspace, () => {
      workspace.empty();
      let editor = new EditorTemplateTest();
      editor.initialize(workspace.attr('id'), this.panelId);
    },data => {
      $.post('/download_template_test', data)
        .done(answer => {
          if (answer.ok) {
            workspace.empty();
            let editor = new EditorTemplateTest();
            editor.initialize(workspace.attr('id'), this.panelId, answer.template, data.templateId);
          } else {
            OOOPS_MESSAGE(this.panelId);
          }
        })
        .fail(() => {SERVER_DOWN_MESSAGE(this.panelId);});
    },'view_list_template_test',  'upload_template_test',
      'download_template_test', 'remove_template_test', 'generate_test');
  }

  actionsTemplateTasks(workspace) {
    this.actions(workspace, () => {
        workspace.empty();
        let editor = new EditorTemplateTask();
        editor.initialize(workspace.attr('id'), this.panelId);
      },data => {
        $.post('/download_template_task', data)
          .done(answer => {
            if (answer.ok) {
              workspace.empty();
              let editor = new EditorTemplateTask();
              editor.initialize(workspace.attr('id'), this.panelId);
              editor.load(answer.template, data.templateId);
            } else {
              OOOPS_MESSAGE(this.panelId);
            }
          })
          .fail(() => {SERVER_DOWN_MESSAGE(this.panelId);});
      },'view_list_template_task',  'upload_template_task',
      'download_template_task', 'remove_template_task', 'generate_task');
  }

  actionsTemplateGroupTasks(workspace) {
    this.actions(workspace, () => {
        workspace.empty();
        let editor = new EditorTemplateGroupTask();
        editor.initialize(workspace.attr('id'), this.panelId);
      },data => {
        $.post('/download_template_group_task', data)
          .done(answer => {
            if (answer.ok) {
              workspace.empty();
              let editor = new EditorTemplateGroupTask();
              editor.initialize(workspace.attr('id'), this.panelId, answer.template, data.templateId);
            } else {
              OOOPS_MESSAGE(this.panelId);
            }
          })
          .fail(() => {SERVER_DOWN_MESSAGE(this.panelId);});
      },'view_list_template_group_task',  'upload_template_group_task',
      'download_template_group_task', 'remove_template_group_task', 'generate_group_task');
  }

}