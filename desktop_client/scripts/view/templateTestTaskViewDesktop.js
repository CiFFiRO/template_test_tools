class TemplateTestTaskDesktop {
  constructor() {
    this.fileName = null;
    this.tagId = '';
    this.templateTestView = new TemplateTestTaskView();
    this.templateTestView.setCallbackDebug(DEBUG);

    const { dialog } = require('electron').remote;
    this.saveSyntaxError = () => {
      return dialog.showMessageBox({
        type: 'error',
        title: 'Ошибка',
        message: 'Вы не можете сохранить ШТЗ с синтаксическими ошибками!',
        buttons: ['Продолжить']
      });
    };
  }

  loadTTT() {
    let data = READ_SINGLE_FILE();
    if (data === undefined) {
      return;
    }

    let ttt = JSON.parse(data.data);
    this.templateTestView.load(ttt);
    this.fileName = data.name;
  }

  saveTTT(fileName) {
    if (!this.templateTestView.isCurrectTTT) {
      this.saveSyntaxError();
      return;
    }

    if (this.fileName === null && fileName === undefined) {
      const { dialog } = require('electron').remote;
      fileName = dialog.showSaveDialog({
        filters: [
          { name: 'ШТЗ', extensions: ['json'] }
        ]
      });

      if (fileName === undefined) {
        return;
      }
    } else if (fileName === undefined) {
      fileName = this.fileName;
    }

    const fs = require('fs');
    fs.writeFileSync(fileName, this.templateTestView.internal.toJson());
    this.fileName = fileName;
  }

  initialize(tagId) {
    this.tagId = tagId;
    this.templateTestView.initialize(tagId);
  }
}
