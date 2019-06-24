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
    const { dialog } = require('electron').remote;
    const fs = require('fs');
    let fileName = dialog.showOpenDialog({
      filters: [
        { name: 'ШТЗ', extensions: ['json'] }
      ]
    });

    if (fileName === undefined || fileName.length !== 1) {
      return;
    }

    let ttt = JSON.parse(fs.readFileSync(fileName[0]));
    this.templateTestView.load(ttt);
    this.fileName = fileName[0];
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
