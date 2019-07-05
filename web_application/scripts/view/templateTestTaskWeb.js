class TemplateTestTaskWeb {
  constructor() {
    this.downloadButtonId = 'downloadTTTButton';
    this.uploadButtonId = 'uploadTTTButton';
    this.cloudTemplateId = null;
    this.tagId = '';
    this.panelId = '';

    this.templateTestView = new TemplateTestTaskView();
    this.templateTestView.setCallbackDebug(DEBUG);
  }

  uploadTTT() {
    let templateTestTask = this.templateTestView.internal.toJson();
    if (this.cloudTemplateId === null) {
      $.post('/upload_ttt', {templateTestTask: templateTestTask})
        .done(answer => {
          if (answer.ok) {
            this.cloudTemplateId = answer.templateId;
          } else {
            USER_MESSAGE(this.panelId, 'ШТЗ синтаксически не корректен.', 30, 9);
          }
        })
        .fail(() => {
          SERVER_DOWN_MESSAGE(this.panelId);
        });
    } else {
      $.post('/update_ttt', {templateTestTask: templateTestTask, templateId: this.cloudTemplateId})
        .done(answer => {
          if (!answer.ok) {
            USER_MESSAGE(this.panelId, 'ШТЗ синтаксически не корректен.', 30, 9);
          } else {
            USER_MESSAGE(this.panelId, 'ШТЗ обновлен.', 20, 7);
          }
        })
        .fail(() => {
          SERVER_DOWN_MESSAGE(this.panelId);
        });
    }
  }

  saveTTT() {
    SAVE_FILE(this.templateTestView.save(), 'TTT.json');
  }

  initializeButtonsTTT(tagId) {
    $('#' + tagId).append('<div class="btn-group-horizontal top-buffer-20 bottom-buffer btn-group-lg" role="group" align="center">' +
      '<button disabled type="button" id="' + this.downloadButtonId + '" class="btn btn-info"><span class="glyphicon glyphicon-download" aria-hidden="true"></span> Скачать</button>' +
      '<button disabled type="button" id="' + this.uploadButtonId + '" class="btn btn-primary left-buffer-30"><span class="glyphicon glyphicon-upload" aria-hidden="true"></span> Загрузить</button>' +
      '</div>');
    $('#'+this.downloadButtonId).on('click', function () {
      this.saveTTT();
    }.bind(this));
    $('#'+this.uploadButtonId).on('click', function () {
      this.uploadTTT();
    }.bind(this));

    this.templateTestView.setCallbackUpdate(function (state) {
      $('#'+this.downloadButtonId).prop('disabled', !state);
      $('#'+this.uploadButtonId).prop('disabled', !state);
    }.bind(this));
    this.templateTestView.update();
  }

  initialize(tagId, panelId) {
    this.tagId = tagId;
    this.panelId = panelId;
    this.templateTestView.initialize(this.tagId);
    this.initializeButtonsTTT(this.tagId);
  }

  load(tagId, panelId, data, cloudId) {
    this.cloudTemplateId = cloudId;
    this.tagId = tagId;
    this.panelId = panelId;

    this.templateTestView.load(data, this.tagId);
    this.initializeButtonsTTT(this.tagId);
  }
}
