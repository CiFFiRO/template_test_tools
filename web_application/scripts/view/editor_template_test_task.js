class EditorTemplateTestTask {
  constructor() {
    this.header = '';
    this.type = -1;
    this.grammar = '';
    this.textTask = '';
    this.feedbackScript = '';
    this.panelId = -1;

    this.headerId = 'EditorTemplateTestTask_headerId';
    this.typeId = 'EditorTemplateTestTask_typeId';
    this.grammarId = 'EditorTemplateTestTask_grammarId';
    this.textTaskId = 'EditorTemplateTestTask_textTaskId';
    this.feedbackScriptId = 'EditorTemplateTestTask_feedbackScriptId';
    this.infoButtonId = 'EditorTemplateTestTask_infoButtonId';
  }

  initialize(tagId, panelId) {
    this.tag = $(`#${tagId}`);
    this.panelId = panelId;
    this.tag.append(`<div class="row"><button type="button" class="btn btn-default" id="${this.infoButtonId}"><img src="icons/ok.png" width="32" height="32"></button> </div>`);
    this.tag.append(`<div class="row">
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
    this.tag.append(`<div class="row">
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
    this.tag.append(`<div class="row">
    <div class="col-md-6">
    <h3>Скрипт обратной связи</h3>
    <div class="input-group">
    <textarea class="form-control" rows="5" cols="50" id="${this.feedbackScriptId}"></textarea>
    </div></div></div>`);
    $('.selectpicker').selectpicker();

    let updateStatusButtonImg = () => {
      console.log(this.type);
      if (this.check() === null) {
        $(`#${this.infoButtonId}`).children().attr('src', "icons/ok.png");
      } else {
        $(`#${this.infoButtonId}`).children().attr('src', "icons/error.png");
      }
    };

    this.type = $(`#${this.typeId}`).value;
    updateStatusButtonImg();
    $(`#${this.headerId}`).on('input change', () => {
      this.header = $(`#${this.headerId}`).val();
      updateStatusButtonImg();
    });
    $(`#${this.typeId}`).on('input change', () => {
      this.type = $(`#${this.typeId}`).val();
      updateStatusButtonImg();
    });
    $(`#${this.grammarId}`).on('input change', () => {
      this.grammar = $(`#${this.grammarId}`).val();
      updateStatusButtonImg();
    });
    $(`#${this.textTaskId}`).on('input change', () => {
      this.textTask = $(`#${this.textTaskId}`).val();
      updateStatusButtonImg();
    });
    $(`#${this.feedbackScriptId}`).on('input change', () => {
      this.feedbackScript = $(`#${this.feedbackScriptId}`).val();
      updateStatusButtonImg();
    });
    $(`#${this.infoButtonId}`).on('click', () => {
      let errorMessage = this.check();
      if (errorMessage === null) {
        errorMessage = 'Шаблон составлен правильно';
      } else {
        errorMessage = 'Шаблон содержит ошибки:\n'+errorMessage;
      }
      USER_MESSAGE(this.panelId, errorMessage, 50, 15);
    });
  }

  load(template) {
    this.header = template.header;
    this.type = template.type;
    this.grammar = template.grammar;
    this.textTask = template.textTask;
    this.feedbackScript = template.feedbackScript;

    $(`#${this.headerId}`).val(template.header);
    $(`#${this.typeId}`).val(template.type);
    $(`#${this.grammarId}`).val(template.grammar);
    $(`#${this.textTaskId}`).val(template.textTask);
    $(`#${this.feedbackScriptId}`).val(template.feedbackScript);
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