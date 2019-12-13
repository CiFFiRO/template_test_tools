class EditorTemplate {
  static templateTypes() {
    return {testTask: 0, task: 1};
  }

  constructor(templateType, uploadUrl, updateUrl, checkCallback,
              templateFromFormCallback, templateToFormCallback, markGrammarCallback) {
    this.templateType = templateType;

    this.uploadUrl = uploadUrl;
    this.updateUrl = updateUrl;

    this.checkCallback = checkCallback;
    this.templateFromFormCallback = templateFromFormCallback;
    this.templateToFormCallback = templateToFormCallback;
    this.markGrammarCallback = markGrammarCallback;

    this.header = '';
    this.type = -1;
    this.grammar = '';
    this.textTask = '';
    this.feedbackScript = '';

    this.marksForGrammar = [];
    this.grammarCM = null;
    this.marksForTextTaskCM = [];
    this.textTaskCM = null;
    this.feedbackScriptCM = null;

    this.templateId = null;

    this.headerId = 'EditorTemplate_headerId';
    this.typeId = 'EditorTemplate_typeId';
    this.grammarId = 'EditorTemplate_grammarId';
    this.textTaskId = 'EditorTemplate_textTaskId';
    this.feedbackScriptId = 'EditorTemplate_feedbackScriptId';
    this.infoButtonId = 'EditorTemplate_infoButtonId';
    this.downloadButtonId = 'EditorTemplate_downloadButtonId';
    this.uploadButtonId = 'EditorTemplate_uploadButtonId';
    this.buttonsRowId = 'EditorTemplate_buttonsRowId';

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
        let template = this.templateFromFormCallback(this.header, +this.type, this.grammar, this.textTask, this.feedbackScript);
        SAVE_FILE(JSON.stringify(template), 'template.json');
      } else {
        USER_MESSAGE(this.panel.attr('id'), 'Шаблон содержит ошибку', 50, 7);
      }
    });
    $(`#${this.uploadButtonId}`).on('click', () => {
      if (this.check() === null) {
        let template = this.templateFromFormCallback(this.header, +this.type, this.grammar, this.textTask, this.feedbackScript);
        if (this.templateId === null) {
          $.post(this.uploadUrl, {template: JSON.stringify(template)})
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
          $.post(this.updateUrl, {template: JSON.stringify(template), templateId: this.templateId})
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

    let secondRow = `<div class="row">
    <div class="col-md-6">
    <h3>Заголовок шаблона</h3>
    <div class="input-group"><input id="${this.headerId}" type="text" class="form-control" size="55"></div>    
    </div>`;

    if (this.templateType === EditorTemplate.templateTypes().testTask) {
      secondRow += `<div class="col-md-6">
      <h3>Тип тестового задания</h3>
      <select class="selectpicker" id="${this.typeId}">
      <option value="0" selected>Short answer</option>
      <option value="1">Single choose</option>
      <option value="2">Multiple choose</option>
      </select></div>`;
    }

    secondRow += `</div>`;
    tag.append(secondRow);

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

    if (this.templateType === EditorTemplate.templateTypes().testTask) {
      tag.append(`<div class="row">
      <div class="col-md-6">
      <h3>Скрипт обратной связи</h3>
      <div class="input-group">
      <textarea class="form-control" rows="5" cols="50" id="${this.feedbackScriptId}"></textarea>
      </div></div></div>`);

      $('.selectpicker').selectpicker();
      this.type = $(`#${this.typeId}`).val();
      $(`#${this.typeId}`).on('input change', () => {
        this.type = +$(`#${this.typeId}`).val();
        updateStatus();
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

    updateStatus();
    $(`#${this.headerId}`).on('input change', () => {
      this.header = $(`#${this.headerId}`).val();
      updateStatus();
    });

    this.grammarCM = CodeMirror.fromTextArea($(`#${this.grammarId}`)[0], {
      mode: "text",
      theme: "darcula",
      tabSize: 2,
      lineWrapping: true
    });
    this.grammarCM.setSize(500, 300);
    this.grammarCM.on('change', (cm, change) => {
      this.grammar = this.grammarCM.getValue();
      updateStatus();

      let lightingCoordinates = this.markGrammarCallback(this.grammar);
      this.marksForGrammar.forEach(mark => mark.clear());
      this.marksForGrammar = [];
      lightingCoordinates.forEach(mark => {
        this.marksForGrammar.push(this.grammarCM.markText(mark[0], mark[1], {css: 'color: ' + mark[2]}));
      });
    });

    this.textTaskCM = CodeMirror.fromTextArea($(`#${this.textTaskId}`)[0], {
      mode: "text",
      theme: "darcula",
      tabSize: 2,
      lineWrapping: true
    });
    this.textTaskCM.setSize(500, 300);
    this.textTaskCM.on('change', (cm, change) => {
      this.textTask = this.textTaskCM.getValue();
      updateStatus();

      let coordinatesLightingForTextTask = (text) => {
        if (text.length < 3) {
          return [];
        }

        let result = [];
        let line = 0, character = 0;
        let index = 0;
        let colors = {
          ignoreSpecial: '#499c54',
          link: '#cb602d',
          noTerminal: '#ffc66d'
        };
        while (index < text.length) {
          if (text[index] === '\n') {
            ++line;
            character = 0;
            ++index;
            continue;
          }

          if (text[index] === '{' && text[index - 1] === '$' && text[index - 2] !== '$') {
            let begin = {line: line, ch: character - 1};
            while (index < text.length && text[index] !== '}') {
              if (text[index] === '\n') {
                ++line;
                character = 0;
                ++index;
                continue;
              }
              ++character;
              ++index;
            }

            if (index !== text.length) {
              let end = {line: line, ch: character + 1};
              result.push([begin, {line: begin.line, ch: begin.ch + 2}, colors.link]);
              result.push([{line: begin.line, ch: begin.ch + 2}, {line: end.line, ch: end.ch - 1}, colors.noTerminal]);
              result.push([{line: end.line, ch: end.ch - 1}, end, colors.link]);
            }
          } else if (text[index] === '$' && text[index + 1] === '$') {
            result.push([{line: line, ch: character}, {line: line, ch: character + 2}, colors.ignoreSpecial]);
            character += 2;
            index += 2;
          } else {
            ++character;
            ++index;
          }
        }

        return result;
      };

      let lightingCoordinates = coordinatesLightingForTextTask(this.textTask);
      this.marksForTextTaskCM.forEach(mark => mark.clear());
      this.marksForTextTaskCM = [];
      lightingCoordinates.forEach(mark => {
        this.marksForTextTaskCM.push(this.textTaskCM.markText(mark[0], mark[1], {css: 'color: ' + mark[2]}));
      });
    });
  }


  load(template, templateId) {

    let form = this.templateToFormCallback(template);

    this.header = form.header;
    this.grammar = form.grammar;
    this.textTask = form.testText;
    if (this.templateType === EditorTemplate.templateTypes().testTask) {
      this.type = form.type;
      this.feedbackScript = form.feedbackScript;
    }
    this.templateId = templateId;

    $(`#${this.headerId}`).val(form.header);
    if (this.templateType === EditorTemplate.templateTypes().testTask) {
      $(`#${this.typeId}`).val(form.type);
      $(`#${this.typeId}`).change();
      this.feedbackScriptCM.setValue(form.feedbackScript);
    }
    this.grammarCM.setValue(form.grammar);
    this.textTaskCM.setValue(form.testText);
  }

  check() {
    return this.checkCallback(this.header, +this.type, this.grammar, this.textTask, this.feedbackScript);
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
    this.grammarCM.setOption('readOnly', this.viewMode);
    this.textTaskCM.setOption('readOnly', this.viewMode);
    if (this.templateType === EditorTemplate.templateTypes().testTask) {
      $(`#${this.typeId}`).attr('disabled', this.viewMode);
      this.feedbackScriptCM.setOption('readOnly', this.viewMode);
    }
  }
}