class EditorTemplateTask {
  constructor() {
    this.header = '';
    this.grammar = '';
    this.textTask = '';

    this.templateId = null;

    this.headerId = 'EditorTemplateTask_headerId';
    this.grammarId = 'EditorTemplateTask_grammarId';
    this.textTaskId = 'EditorTemplateTask_textTaskId';
    this.infoButtonId = 'EditorTemplateTask_infoButtonId';
    this.downloadButtonId = 'EditorTemplateTask_downloadButtonId';
    this.uploadButtonId = 'EditorTemplateTask_uploadButtonId';
    this.buttonsRowId = 'EditorTemplateTask_buttonsRowId';

    this.viewMode = false;

    this.panel = null;
  }

  initializeButtons() {
    let tag = $(`#${this.buttonsRowId}`);
    tag.append(`<div class="col-md-6">
    <button type="button" class="btn btn-default" id="${this.infoButtonId}"><img src="icons/ok.png" width="32" height="32"></button> 
    <button type="button" id="${this.downloadButtonId}" class="btn btn-info left-buffer-30""><span class="glyphicon glyphicon-download" aria-hidden="true"></span> Скачать</button>
    <button type="button" id="${this.uploadButtonId}" class="btn btn-primary left-buffer-30"><span class="glyphicon glyphicon-upload" aria-hidden="true"></span> Загрузить</button>
    </div>`);

    $(`#${this.infoButtonId}`).on('click', () => {
      let errorMessage = this.check();
      if (errorMessage === null) {
        errorMessage = 'Шаблон составлен правильно';
      } else {
        errorMessage = 'Шаблон содержит ошибки:\n'+errorMessage;
      }
      USER_MESSAGE(this.panel.attr('id'), errorMessage, 50, 15);
    });
    $(`#${this.downloadButtonId}`).on('click', () => {
      if (this.check() === null) {
        let template = templateTaskFormToTemplate(this.header, this.grammar, this.textTask);
        SAVE_FILE(JSON.stringify(template), 'Template.json');
      } else {
        USER_MESSAGE(this.panel.attr('id'), 'Шаблон содержит ошибку', 50, 7);
      }
    });
    $(`#${this.uploadButtonId}`).on('click', () => {
      if (this.check() === null) {
        let template = templateTaskFormToTemplate(this.header, this.grammar, this.textTask);
        if (this.templateId === null) {
          $.post('/upload_template_task', {template: JSON.stringify(template)})
            .done(answer => {
              if (answer.ok) {
                this.templateId = answer.templateId;
                USER_MESSAGE(this.panel.attr('id'), 'Шаблон загружен.', 20, 7);
              } else {
                USER_MESSAGE(this.panel.attr('id'), 'Шаблон синтаксически не корректен.', 30, 7);
              }
            })
            .fail(() => {
              SERVER_DOWN_MESSAGE(this.panel.attr('id'));
            });
        } else {
          $.post('/update_template_task', {template: JSON.stringify(template), templateId: this.templateId})
            .done(answer => {
              if (!answer.ok) {
                USER_MESSAGE(this.panel.attr('id'), 'Шаблон синтаксически не корректен.', 30, 7);
              } else {
                USER_MESSAGE(this.panel.attr('id'), 'Шаблон обновлен.', 20, 7);
              }
            })
            .fail(() => {
              SERVER_DOWN_MESSAGE(this.panel.attr('id'));
            });
        }
      } else {
        USER_MESSAGE(this.panel.attr('id'), 'Шаблон содержит ошибку', 50, 7);
      }
    });
  }

  removeButtons() {
    let tag = $(`#${this.buttonsRowId}`);
    tag.empty();
  }
  
  initialize(tagId, panelId) {
    let tag = $(`#${tagId}`);
    this.panel = $(`#${panelId}`);
    tag.append(`<div class="row" id="${this.buttonsRowId}"></div>`);
    this.initializeButtons();
    tag.append(`<div class="row">
    <div class="col-md-6">
    <h3>Заголовок шаблона</h3>
    <div class="input-group"><input id="${this.headerId}" type="text" class="form-control" size="55"></div>    
    </div></div>`);
    tag.append(`<div class="row">
    <div class="col-md-6">
    <h3>Грамматика</h3>
    <div class="input-group">
    <textarea class="form-control" rows="5" cols="65" id="${this.grammarId}"></textarea>
    </div></div>
    <div class="col-md-6">
    <h3>Текст тестового задания</h3>
    <div class="input-group">
    <textarea class="form-control" rows="5" cols="65" id="${this.textTaskId}"></textarea>
    </div></div></div>
    `);

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

    updateStatus();
    $(`#${this.headerId}`).on('input change', () => {
      this.header = $(`#${this.headerId}`).val();
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
  }

  load(template, templateId) {
    this.header = template.title;
    this.grammar = template.grammar;
    this.textTask = template.textTask;

    this.templateId = templateId;

    $(`#${this.headerId}`).val(template.title);
    $(`#${this.grammarId}`).val(template.grammar);
    $(`#${this.textTaskId}`).val(template.textTask);
  }

  check() {
    try {
      let template = templateTaskFormToTemplate(this.header, this.grammar, this.textTask);
      checkTemplateTask(template);
    } catch (exception) {
      return exception.message;
    }

    return null;
  }

  viewModeOn() {
    if (this.viewMode) {
      return;
    }

    this.viewMode = true;
    this.removeButtons();
    this.changeMode();
  }

  viewModeOff() {
    if (!this.viewMode) {
      return;
    }

    this.viewMode = false;
    this.initializeButtons();
    this.changeMode();
  }

  changeMode() {
    $(`#${this.headerId}`).attr('readonly', this.viewMode);
    $(`#${this.grammarId}`).attr('readonly', this.viewMode);
    $(`#${this.textTaskId}`).attr('readonly', this.viewMode);
  }
}