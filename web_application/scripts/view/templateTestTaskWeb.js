class TemplateTestTaskWeb {
  constructor() {
    this.sendButtonId = 'sendTTTButton';
    this.loadButtonId = 'loadTTTButton';
    this.tagId = '';

    this.templateTestView = new TemplateTestTaskView();
    this.templateTestView.setCallbackDebug(DEBUG);
  }

  loadTTT() {
    LOAD_FILE(function (ttt) {
      this.templateTestView.load(JSON.parse(ttt));
      this.initializeButtonsTTT(this.tagId);
    }.bind(this));
  }

  saveTTT() {
    let a = document.createElement("a");
    let file = this.templateTestView.save();
    a.href = URL.createObjectURL(file);
    a.download = 'TTT.json';
    a.click();
  }

  initializeButtonsTTT(tagId) {
    $('#' + tagId).append('<div class="btn-group" role="group" aria-label="...">' +
      '<button disabled type="button" id="' + this.sendButtonId + '" class="btn btn-primary"><span class="glyphicon glyphicon-save" aria-hidden="true"></span> Скачать</button>' +
      '<button type="button" id="' + this.loadButtonId + '" class="btn btn-primary"><span class="glyphicon glyphicon-upload" aria-hidden="true"></span> Загрузить</button>' +
      '</div>');
    $('#'+this.sendButtonId).on('click', function () {
      this.saveTTT();
    }.bind(this));
    $('#'+this.loadButtonId).on('click', function () {
      this.loadTTT();
    }.bind(this));

    this.templateTestView.setCallbackUpdate(function (state) {
      $('#'+this.sendButtonId).prop('disabled', !state);
    }.bind(this));
    this.templateTestView.update();
  }

  initialize(tagId) {
    this.tagId = tagId;
    this.templateTestView.initialize(tagId);
    this.initializeButtonsTTT(tagId);
  }
}
