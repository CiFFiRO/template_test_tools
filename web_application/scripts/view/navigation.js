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
      `<div class="container-fluid">
      <div class="row">
      <div class="col-md-11">
      <ul class="nav nav-tabs  top-buffer-20" align="center">
      <li role="presentation"  id="${viewDocumentationId}"><a href="#">Документация</a></li>
      <li role="presentation" id="${editTemplateTestTasksButtonId}"><a href="#">Шаблоны тестовых заданий</a></li>
      <li role="presentation" id="${editTemplateTestsButtonId}"><a href="#">Шаблоны тестов</a></li>
      <li role="presentation"  id="${editTemplateTasksButtonId}"><a href="#">Шаблоны заданий</a></li>
      <li role="presentation"  id="${editTemplateGroupTasksButtonId}"><a href="#">Шаблоны групп заданий</a></li>
      </ul></div>
      <div class="col-md-1">
      <button type="button" class="btn btn-default top-buffer-20" id="${logoutButtonId}"><span class="glyphicon glyphicon-log-out" aria-hidden="true"></span></button>
      </div>
      </div><div class="row"><div id="${workspaceId}" class="container-fluid top-buffer-7"></div></div></div>`);
    let workspace = $('#'+workspaceId);
    let clearActive = () => {
      $(`#${viewDocumentationId}, #${editTemplateTestTasksButtonId}, #${editTemplateTestsButtonId}, #${editTemplateTasksButtonId}, #${editTemplateGroupTasksButtonId}`).removeClass("active");
    };

    $('#'+logoutButtonId).on('click', () => {
      this.logout();
    });
    $('#'+viewDocumentationId).on('click', () => {
      workspace.empty();
      clearActive();
      $(`#${viewDocumentationId}`).addClass("active");
      this.openHelp(workspace);
    });
    $('#'+editTemplateTestTasksButtonId).on('click', () => {
      workspace.empty();
      clearActive();
      $(`#${editTemplateTestTasksButtonId}`).addClass("active");
      this.actionsTemplateTestTasks(workspace);
    });
    $('#'+editTemplateTestsButtonId).on('click', () => {
      workspace.empty();
      clearActive();
      $(`#${editTemplateTestsButtonId}`).addClass("active");
      this.actionsTemplateTests(workspace);
    });
    $('#'+editTemplateTasksButtonId).on('click', () => {
      workspace.empty();
      clearActive();
      $(`#${editTemplateTasksButtonId}`).addClass("active");
      this.actionsTemplateTasks(workspace);
    });
    $('#'+editTemplateGroupTasksButtonId).on('click', () => {
      workspace.empty();
      clearActive();
      $(`#${editTemplateGroupTasksButtonId}`).addClass("active");
      this.actionsTemplateGroupTasks(workspace);
    });

    $('#'+viewDocumentationId).click();
  }

  openHelp(workspace) {
    workspace.append(`<h1>Синтаксис грамматики шаблонов тестовых заданий</h1>
    <p>NoTerminal=[alt_0|alt_1|...|alt_n].</p>
    <p>
        NoTerminal - нетерминальный символ, состоящий из латинских букв и цифр (должен начинаться с буквы),
        alt_i - i-ая альтернатива нетерминалу,
        | - конструкция выбор используется как разделитель альтернатив,
        [] - конструкция условия используется для задания пустой альтернативы (ей присваивается n+1 индекс),
        . - конец определения нетерминала.
    </p>
    <h4>Замечания</h4>
    <p>1. Для включения объявленного ранее нетерминала в текст альтернативы необходимо написать \${"нетерминальный_символ"}.</p>
    <p>2. Для включения символов $, | и . в текст альтернативы необходимо написать $$, $| и .. соответственно.</p>
    <h1>Синтаксис грамматики шаблонов заданий</h1>
    <p>
        NoTerminal - нетерминальный символ, состоящий из латинских букв и цифр (должен начинаться с буквы),
        | - конструкция выбор используется как разделитель альтернатив,
        [] - конструкция условия используется для задания пустой альтернативы,
        () - скобки используются для группировки альтернатив,
        . - конец определения нетерминала.
    </p>
    <h4>Замечания</h4>
    <p>1. Для включения объявленного ранее нетерминала в текст альтернативы необходимо написать \${"нетерминальный_символ"}.</p>
    <p>2. Для включения символов $, |, (, ), [, ], = и . в текст альтернативы необходимо написать передними $.</p>
    <h1>Функции:</h1>
    <p>1. rInteger(min, max) - заменяется на случайное целое число из отрезка [min;max]</p>
    <p>2. rFloat(min, max, length) - заменяется на случайное вещественное число из отрезка [min;max] с length знаками после запятой</p>
    <h4>Примеры использования функций в шаблонах</h4>
    <p>1. тестовых заданий $rInteger(3, 5)</p>
    <p>2. заданий $rFloat$(1$.2, 3$.14$)</p>
    <h1>Скрипты обратной связи</h1>
    <p>Пользователь пишет лишь часть этого скрипта, используя предекларированные константы и функции:</p>
    <h4>Константы:</h4>
    <p>
        $"нетерминал"_"индекс альтернативы" - Натуральное число соответствующие номеру альтернативы указанного нетерминала.
        Альтернативы нумеруются, начиная с нуля.
    </p>
    <p>$"нетерминал"_value - Строка, соответствующая сгенерированной альтернативы для указанного нетерминала.</p>
    <p>$"нетерминал" - Натуральное число соответствующие номеру выбранной генератором альтернативы для указанного нетерминала.</p>
    <h4>Функции:</h4>
    <p>$$rSubArray(array, length) - Генерирует подмассив длины length состоящий из случайных элеметов исходного массива array.</p>
    <p>
        $$AnswerIs(array), $$AnswerIs(string) - Задает множество верных вариантов ответа.
    </p>
    <p>
        $$FalseOptionsIs(array) - Задает неправильные варианты ответов.
    </p>
    <p>В скрипте обратной связи должно обязательно задаваться ответ(ы) и, если необходимо, неверные варианты ответа.</p>`);
  }

  actions(workspace, createCallback, editCallback, urlViewList, urlUpload, urlDownload, urlRemove, urlGenerate) {
    let createTemplateButtonId = 'createTemplateButtonId';
    let uploadTemplateButtonId = 'uploadTemplateButtonId';
    let listSpaceId = 'listSpaceId';
    workspace.append(`<div class="container-fluid " ><div class="row">
      <div class="col-md-12">
      <div class="btn-group-horizontal btn-group-sm" role="group" align="left">
      <button type="button" class="btn btn-default" id="${createTemplateButtonId}"><span class="glyphicon glyphicon-plus text-success" aria-hidden="true"></span> Создать</button>
      <button type="button" class="btn btn-default left-buffer-20" id="${uploadTemplateButtonId}"><span class="glyphicon glyphicon-upload text-primary" aria-hidden="true"></span> Загрузить</button>
      </div></div><div class="row"><div class="col-md-12"><div class="container-fluid top-buffer-7" id="${listSpaceId}"></div></div></div></div></div>`);

    let loadListPage, fillList;

    fillList = (listSpace, list, pageId) => {
      listSpace.empty();
      for (let i=0;i<list.length;++i) {
        let buttonEditId = 'buttonEditId_' + i;
        let buttonDownloadId = 'buttonDownloadId_' + i;
        let buttonRemoveId = 'buttonRemoveId_' + i;
        let buttonGenerate = 'buttonGenerate_'+i;
        listSpace.append(`<div class="row  border">
          <div class="col-md-8"><p class="top-buffer-7">${list[i].title}</p></div>
          <div class="col-md-4" align="center">
          <button id="${buttonGenerate}" type="button" class="btn btn-default "><span class="glyphicon glyphicon-cog text-black" aria-hidden="true"></span></button>
          <button id="${buttonEditId}" type="button" class="btn btn-default left-buffer-30 "><span class="glyphicon glyphicon-edit text-warning" aria-hidden="true"></span></button>
          <button id="${buttonDownloadId}" type="button" class="btn btn-default left-buffer-30 "><span class="glyphicon glyphicon-download text-info" aria-hidden="true"></span></button>
          <button id="${buttonRemoveId}" type="button" class="btn btn-default left-buffer-30 "><span class="glyphicon glyphicon-remove text-danger" aria-hidden="true"></span></button>
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