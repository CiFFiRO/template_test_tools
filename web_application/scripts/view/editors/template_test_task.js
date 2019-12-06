class EditorTemplateTestTask {
  constructor() {
    this.header = '';
    this.type = -1;
    this.grammar = '';
    this.textTask = '';
    this.feedbackScript = '';

    this.templateId = null;

    this.headerId = 'EditorTemplateTestTask_headerId';
    this.typeId = 'EditorTemplateTestTask_typeId';
    this.grammarId = 'EditorTemplateTestTask_grammarId';
    this.textTaskId = 'EditorTemplateTestTask_textTaskId';
    this.feedbackScriptId = 'EditorTemplateTestTask_feedbackScriptId';
    this.infoButtonId = 'EditorTemplateTestTask_infoButtonId';
    this.downloadButtonId = 'EditorTemplateTestTask_downloadButtonId';
    this.uploadButtonId = 'EditorTemplateTestTask_uploadButtonId';
  }

  initialize(tagId, panelId) {
    let tag = $(`#${tagId}`);
    tag.append(`<div class="row">
    <div class="col-md-6">
    <button type="button" class="btn btn-default" id="${this.infoButtonId}"><img src="icons/ok.png" width="32" height="32"></button> 
    <button type="button" id="${this.downloadButtonId}" class="btn btn-info left-buffer-30""><span class="glyphicon glyphicon-download" aria-hidden="true"></span> Скачать</button>
    <button type="button" id="${this.uploadButtonId}" class="btn btn-primary left-buffer-30"><span class="glyphicon glyphicon-upload" aria-hidden="true"></span> Загрузить</button>
    </div></div>`);
    tag.append(`<div class="row">
    <div class="col-md-6">
    <h3>Заголовок шаблона</h3>
    <div class="input-group"><input id="${this.headerId}" type="text" class="form-control" size="55"></div>    
    </div>
    <div class="col-md-6">
    <h3>Тип тестового задания</h3>
    <select class="selectpicker" id="${this.typeId}">
    <option value="0" selected>Short answer</option>
    <option value="1">Single choose</option>
    <option value="2">Multiple choose</option>
    </select>
    </div></div>`);
    tag.append(`<div class="row">
    <div class="col-md-6">
    <h3>Грамматика</h3>
    <div class="input-group">
    <textarea class="form-control" rows="5" cols="50" id="${this.grammarId}"></textarea>
    </div></div>
    <div class="col-md-6">
    <h3>Текст тестового задания</h3>
    <div class="input-group">
    <textarea class="form-control" rows="5" cols="50" id="${this.textTaskId}"></textarea>
    </div></div>
    `);
    tag.append(`<div class="row">
    <div class="col-md-6">
    <h3>Скрипт обратной связи</h3>
    <div class="input-group">
    <textarea class="form-control" rows="5" cols="50" id="${this.feedbackScriptId}"></textarea>
    </div></div></div>`);
    $('.selectpicker').selectpicker();

    let updateStatus = () => {
      if (this.check() === null) {
        $(`#${this.infoButtonId}`).children().attr('src', "icons/ok.png");
        $(`#${this.uploadButtonId}`).attr('disabled', false);
        $(`#${this.downloadButtonId}`).attr('disabled', false);
      } else {
        $(`#${this.infoButtonId}`).children().attr('src', "icons/error.png");
        $(`#${this.uploadButtonId}`).attr('disabled', true);
        $(`#${this.downloadButtonId}`).attr('disabled', true);
      }
    };

    this.type = $(`#${this.typeId}`).val();
    updateStatus();
    $(`#${this.headerId}`).on('input change', () => {
      this.header = $(`#${this.headerId}`).val();
      updateStatus();
    });
    $(`#${this.typeId}`).on('input change', () => {
      this.type = +$(`#${this.typeId}`).val();
      updateStatus();
    });
    $(`#${this.grammarId}`).on('input change', () => {
      this.grammar = $(`#${this.grammarId}`).val();
      updateStatus();
    });
    $(`#${this.textTaskId}`).on('input change', () => {
      this.textTask = $(`#${this.textTaskId}`).val();
      updateStatus();
    });
    this.codeMirror = CodeMirror.fromTextArea($(`#${this.feedbackScriptId}`)[0], {
      lineNumbers: true,
      matchBrackets: true,
      mode: "javascript",
      theme: "darcula",
      tabSize: 2
    });
    this.codeMirror.setSize(750, 300);
    this.codeMirror.on('change', (cm, change) => {
      this.feedbackScript = this.codeMirror.getValue();
      updateStatus();
    });
    $(`#${this.infoButtonId}`).on('click', () => {
      let errorMessage = this.check();
      if (errorMessage === null) {
        errorMessage = 'Шаблон составлен правильно';
      } else {
        errorMessage = 'Шаблон содержит ошибки:\n'+errorMessage;
      }
      USER_MESSAGE(panelId, errorMessage, 50, 15);
    });
    $(`#${this.downloadButtonId}`).on('click', () => {
      if (this.check() === null) {
        let template = templateTestTaskFormToTemplate(this.header, +this.type, this.grammar, this.textTask, this.feedbackScript);
        SAVE_FILE(JSON.stringify(template), 'templateTestTask.json');
      } else {
        USER_MESSAGE(panelId, 'Шаблон содержит ошибку', 50, 7);
      }
    });
    $(`#${this.uploadButtonId}`).on('click', () => {
      if (this.check() === null) {
        let template = templateTestTaskFormToTemplate(this.header, +this.type, this.grammar, this.textTask, this.feedbackScript);
        if (this.templateId === null) {
          $.post('/upload_template_test_task', {template: JSON.stringify(template)})
            .done(answer => {
              if (answer.ok) {
                this.templateId = answer.templateId;
                USER_MESSAGE(panelId, 'Шаблон загружен.', 20, 7);
              } else {
                USER_MESSAGE(panelId, 'Шаблон синтаксически не корректен.', 30, 7);
              }
            })
            .fail(() => {
              SERVER_DOWN_MESSAGE(panelId);
            });
        } else {
          $.post('/update_template_test_task', {template: JSON.stringify(template), templateId: this.templateId})
            .done(answer => {
              if (!answer.ok) {
                USER_MESSAGE(panelId, 'Шаблон синтаксически не корректен.', 30, 7);
              } else {
                USER_MESSAGE(panelId, 'Шаблон обновлен.', 20, 7);
              }
            })
            .fail(() => {
              SERVER_DOWN_MESSAGE(panelId);
            });
        }
      } else {
        USER_MESSAGE(panelId, 'Шаблон содержит ошибку', 50, 7);
      }
    });
  }

  load(template, templateId) {
    let form = translateTemplateTestTaskToForm(template);

    this.header = form.header;
    this.type = form.type;
    this.grammar = form.grammar;
    this.textTask = form.testText;
    this.feedbackScript = form.feedbackScript;

    this.templateId = templateId;

    $(`#${this.headerId}`).val(form.header);
    $(`#${this.typeId}`).val(form.type);
    $(`#${this.grammarId}`).val(form.grammar);
    $(`#${this.textTaskId}`).val(form.testText);
    this.codeMirror.setValue(form.feedbackScript);
  }

  check() {
    try {
      let template = templateTestTaskFormToTemplate(this.header, +this.type, this.grammar, this.textTask, this.feedbackScript);
      checkTemplateTestTask(template);
    } catch (exception) {
      return exception.message;
    }

    return null;
  }

}