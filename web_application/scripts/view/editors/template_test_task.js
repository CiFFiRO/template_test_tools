class EditorTemplateTestTask {
  constructor() {
    this.header = '';
    this.type = -1;
    this.grammar = '';
    this.textTask = '';
    this.feedbackScript = '';

    this.marksForTextTaskCM = [];
    this.textTaskCM = null;
    this.feedbackScriptCM = null;

    this.templateId = null;

    this.headerId = 'EditorTemplateTestTask_headerId';
    this.typeId = 'EditorTemplateTestTask_typeId';
    this.grammarId = 'EditorTemplateTestTask_grammarId';
    this.textTaskId = 'EditorTemplateTestTask_textTaskId';
    this.feedbackScriptId = 'EditorTemplateTestTask_feedbackScriptId';
    this.infoButtonId = 'EditorTemplateTestTask_infoButtonId';
    this.downloadButtonId = 'EditorTemplateTestTask_downloadButtonId';
    this.uploadButtonId = 'EditorTemplateTestTask_uploadButtonId';
    this.buttonsRowId = 'EditorTemplateTestTask_buttonsRowId';

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
        let template = templateTestTaskFormToTemplate(this.header, +this.type, this.grammar, this.textTask, this.feedbackScript);
        SAVE_FILE(JSON.stringify(template), 'templateTestTask.json');
      } else {
        USER_MESSAGE(this.panel.attr('id'), 'Шаблон содержит ошибку', 50, 7);
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
                USER_MESSAGE(this.panel.attr('id'), 'Шаблон загружен.', 20, 7);
              } else {
                USER_MESSAGE(this.panel.attr('id'), 'Шаблон синтаксически не корректен.', 30, 7);
              }
            })
            .fail(() => {
              SERVER_DOWN_MESSAGE(this.panel.attr('id'));
            });
        } else {
          $.post('/update_template_test_task', {template: JSON.stringify(template), templateId: this.templateId})
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
    <textarea class="form-control" rows="5" cols="65" id="${this.grammarId}"></textarea>
    </div></div>
    <div class="col-md-6">
    <h3>Текст тестового задания</h3>
    <div class="input-group">
    <textarea class="form-control" rows="5" cols="65" id="${this.textTaskId}"></textarea>
    </div></div></div>
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
    this.textTaskCM = CodeMirror.fromTextArea($(`#${this.textTaskId}`)[0], {
      mode: "text",
      theme: "darcula",
      tabSize: 2
    });
    this.textTaskCM.setSize(500, 300);
    this.textTaskCM.on('change', (cm, change) => {
      this.textTask = this.textTaskCM.getValue();
      updateStatus();

      let coordinatesLightingForTextTask = () => {
        if (this.textTask < 3) {
          return [];
        }

        let result = [];
        let line = 0, character = 0;
        let index = 0;
        while (index<this.textTask.length) {
          if (this.textTask[index] === '\n') {
            ++line;
            character = 0;
            ++index;
            continue;
          }

          if (this.textTask[index] === '{' && this.textTask[index-1] === '$' && this.textTask[index-2] !== '$') {
            let begin = {line: line, ch: character-1};
            while (index < this.textTask.length && this.textTask[index] !== '}') {
              if (this.textTask[index] === '\n') {
                ++line;
                character = 0;
                ++index;
                continue;
              }
              ++character;
              ++index;
            }

            if (index !== this.textTask.length) {
              let end = {line: line, ch: character+1};
              result.push([[begin, {line: begin.line, ch: begin.ch+2}],
                [{line: begin.line, ch: begin.ch+2}, {line: end.line, ch: end.ch-1}],
                [{line: end.line, ch: end.ch-1}, end]]);
            }
          } else {
            ++character;
            ++index;
          }
        }

        return result;
      };

      let lightingCoordinates = coordinatesLightingForTextTask();
      this.marksForTextTaskCM.forEach(mark => mark.clear());
      this.marksForTextTaskCM = [];
      lightingCoordinates.forEach(mark => {
        this.marksForTextTaskCM.push(this.textTaskCM.markText(mark[0][0], mark[0][1], {css: 'color: #cb602d'}));
        this.marksForTextTaskCM.push(this.textTaskCM.markText(mark[1][0], mark[1][1], {css: 'color: #ffc66d'}));
        this.marksForTextTaskCM.push(this.textTaskCM.markText(mark[2][0], mark[2][1], {css: 'color: #cb602d'}));
      });
    });

    this.feedbackScriptCM = CodeMirror.fromTextArea($(`#${this.feedbackScriptId}`)[0], {
      lineNumbers: true,
      matchBrackets: true,
      mode: "javascript",
      theme: "darcula",
      tabSize: 2
    });
    this.feedbackScriptCM.setSize(750, 300);
    this.feedbackScriptCM.on('change', (cm, change) => {
      this.feedbackScript = this.feedbackScriptCM.getValue();
      updateStatus();
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
    $(`#${this.typeId}`).change();
    $(`#${this.grammarId}`).val(form.grammar);
    this.textTaskCM.setValue(form.testText);
    this.feedbackScriptCM.setValue(form.feedbackScript);
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
    this.textTaskCM.setOption('readOnly', this.viewMode);
    this.feedbackScriptCM.setOption('readOnly', this.viewMode);
    $(`#${this.typeId}`).attr('disabled', this.viewMode);
  }
}