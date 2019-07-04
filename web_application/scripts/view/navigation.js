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
    this.panel.append('<div class="panel panel-default center-position-30-18" align="center">' +
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
    this.panel.append('<div class="panel panel-default center-position-30-33" align="center">' +
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
         panel.empty();
         if (answer.ok) {
           let codeInputId = 'codeInputId';
           let confirmCodeButtonId = 'confirmCodeButtonId';
           this.panel.append('<div class="panel panel-default center-position-40-17" align="center">' +
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
                   this.panel.append('<div class="panel panel-default center-position-25-7" align="center">' +
                     '<div class="panel-body">' +
                     '<h3 class="form-signin-heading" align="center">Регистрация завершена.</h3>' +
                     '</div>');
                   setTimeout(() => {
                     this.panel.empty();
                     this.initializeMenu();
                   }, 2000);
                 } else {
                   let windowId = 'windowId';
                   this.panel.append('<div class="panel panel-default center-position-30-7" align="center" id="' + windowId + '">' +
                     '<div class="panel-body">' +
                     '<h3 class="form-signin-heading" align="center">Не верный код. Повторите ввод.</h3>' +
                     '</div></div>');
                   setTimeout(()=>{$('#'+windowId).remove();}, 2000);
                 }
               })
               .fail(answer => {
                 this.panel.empty();
                 this.panel.append('<div class="panel panel-default center-position-25-7" align="center">' +
                   '<div class="panel-body">' +
                   '<h3 class="form-signin-heading" align="center">Сервер не доступен.</h3>' +
                   '</div>');
               });
           });
         } else {
           this.panel.append('<div class="panel panel-default center-position-35-9" align="center">' +
             '<div class="panel-body">' +
             '<h3 class="form-signin-heading" align="center">Была отправлена неправильная форма.<br>Регистрация прервана.</h3>' +
             '</div>');
         }
       })
       .fail(() => {
         this.panel.empty();
         this.panel.append('<div class="panel panel-default center-position-25-7" align="center">' +
           '<div class="panel-body">' +
           '<h3 class="form-signin-heading" align="center">Сервер не доступен.</h3>' +
           '</div>');
       });
    });
  }

  login() {
    let loginInputId = 'loginInputId';
    let passwordInputId = 'passwordInputId';
    let signInButtonId = 'signInButtonId';
    this.panel.append('<div class="panel panel-default center-position-24-18" align="center">' +
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
            let windowId = 'windowId';
            this.panel.append('<div class="panel panel-default center-position-30-9" align="center" id="' + windowId + '">' +
              '<div class="panel-body">' +
              '<h3 class="form-signin-heading" align="center">Неверные данные. Повторите ввод.</h3>' +
              '</div></div>');
            setTimeout(()=>{$('#'+windowId).remove();}, 2000);
          }
        })
        .fail(() => {
          this.panel.empty();
          this.panel.append('<div class="panel panel-default center-position-25-7" align="center">' +
            '<div class="panel-body">' +
            '<h3 class="form-signin-heading" align="center">Сервер не доступен.</h3>' +
            '</div>');
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
      let createTTTButtonId = 'createTTTButtonId';
      let uploadTTTButtonId = 'uploadTTTButtonId';
      workspace.append('<div class="btn-group-horizontal btn-group-lg top-buffer-20" role="group" align="center">' +
        '<button type="button" class="btn btn-success" id="' + createTTTButtonId + '">Создать</button>' +
        '<button type="button" class="btn btn-primary left-buffer-20" id="' + uploadTTTButtonId + '">Загрузить</button>' +
        '</div>');
    });
    $('#'+editTemplateTestsButtonId).on('click', () => {
      workspace.empty();
      workspace.append('<h3 class="form-signin-heading" align="center">Раздел в разработке.</h3>');
    });
  }

  viewTemplateTestTasks() {

  }

  viewTemplateTests() {

  }

  editTemplateTestTask() {

  }

  editTemplateTest() {

  }

  deleteTemplateTestTask() {

  }

  deleteTemplateTest() {

  }

  uploadTemplateTestTasks() {

  }

  uploadTemplateTests() {

  }
}