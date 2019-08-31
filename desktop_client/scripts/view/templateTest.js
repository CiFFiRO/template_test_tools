class TemplateTestView {
  constructor() {
    this.internal = new TemplateTestInternal();
    this.fileName = null;
    this.TTTPrefixId = 'TTTPrefixId_';
    this.uniqueNumber = 0;
    this.listTTTId = 'editListTTT';
    this.titleId = 'inputTitle';
    this.selectOrderTypeId = 'selectOrderTypeId';
    this.buttonAddTTTId = 'addTTT';

    $('#' + this.titleId).on('input change', () => {
      this.internal.setTitle($('#' + this.titleId).val());
    });
    $('select').selectpicker();
    $('#' + this.selectOrderTypeId).on('input change', () => {
      this.internal.setOrderType(+$('#' + this.selectOrderTypeId).val());
    });
    $('#'+this.buttonAddTTTId).on('click', () => {
      this.addTTTs();
    });
  }

  initializeTitle(data) {
    let tag = $('#' + this.titleId);

    if (data !== undefined) {
      tag.val(data['title']);
      tag.change();
    }
  }

  initializeOrderType(data) {
    let tag = $('#' + this.selectOrderTypeId);
    tag.val("0");

    if (data !== undefined) {
      tag.val(''+data['orderType']);
    }

    tag.change();
  }

  initializeListTTT(data) {
    if (data !== undefined) {
      this.addTTTs(data.arrayTTT);
    }
  }

  addTTTs(tttElements) {
    let data = [];
    if (tttElements === undefined) {
      data = READ_MULTIPLE_FILES();
      if (data.length === 0) {
        return;
      }

      for (let i = 0; i < data.length; ++i) {
        data[i] = JSON.parse(data[i].data);
      }
    } else {
      data = tttElements;
    }

    for (let i = 0; i < data.length; ++i) {
      try {
        this.internal.addTTT(data[i]);
      } catch (error) {
        DEBUG(error);
      }
    }

    let updateListTemplates = () => {
      let list = $('#' + this.listTTTId);
      list.empty();
      for (let i = 0; i < this.internal.arrayTTT.length; ++i) {
        let sectionId = this.TTTPrefixId + i;
        let buttonRemoveId = 'buttonRemoveId_' + i;
        let buttonUpId = 'buttonUpId_' + i;
        let buttonDownId = 'buttonDownId_' + i;

        list.append('<div class="row" id="' + sectionId + '">' +
          '<div class="col-md-8"><h3 class="form-signin-heading" align="left"><span class="left-buffer-20 label label-default">' + this.internal.arrayTTT[i].title + '</span></h3></div>' +
          '<div class="col-md-4">' +
          '<button id="' + buttonUpId + '" type="button" class="btn btn-default top-buffer-20"><span class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span></button>' +
          '<button id="' + buttonDownId + '" type="button" class="btn btn-default left-buffer-30 top-buffer-20"><span class="glyphicon glyphicon-arrow-down" aria-hidden="true"></span></button>' +
          '<button id="' + buttonRemoveId + '" type="button" class="btn btn-danger left-buffer-45 top-buffer-20"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>' +
          '</div>' +
          '</div><hr class="divider">');
        $('#' + buttonUpId).on('click', () => {
          if (i === 0 || this.internal.arrayTTT.length === 1) {
            return;
          }
          [this.internal.arrayTTT[i - 1], this.internal.arrayTTT[i]] = [this.internal.arrayTTT[i], this.internal.arrayTTT[i - 1]];
          updateListTemplates();
        });
        $('#' + buttonDownId).on('click', () => {
          if (i === this.internal.arrayTTT.length - 1 || this.internal.arrayTTT.length === 1) {
            return;
          }
          [this.internal.arrayTTT[i], this.internal.arrayTTT[i + 1]] = [this.internal.arrayTTT[i + 1], this.internal.arrayTTT[i]];
          updateListTemplates();
        });
        $('#' + buttonRemoveId).on('click', () => {
          this.internal.arrayTTT.splice(i, 1);
          updateListTemplates();
        });
      }
    };

    updateListTemplates();
  }

  initialize(data) {
    this.initializeTitle(data);
    this.initializeOrderType(data);
    this.initializeListTTT(data);
  }

  load() {
    let content = READ_SINGLE_FILE();

    if (content === undefined) {
      return;
    }

    let tt = JSON.parse(content.data);
    this.fileName = content.name;
    $('#'+this.listTTTId).empty();
    this.internal = new TemplateTestInternal();
    this.initialize(tt);
  }

  save(fileName) {
    if (this.fileName === null && fileName === undefined) {
      const { dialog } = require('electron').remote;
      fileName = dialog.showSaveDialogSync({
        filters: [
          { name: 'ШТ', extensions: ['json'] }
        ]
      });

      if (fileName === undefined) {
        return;
      }
    } else if (fileName === undefined) {
      fileName = this.fileName;
    }

    const fs = require('fs');
    fs.writeFileSync(fileName, this.internal.toJson());
    this.fileName = fileName;
  }

  generateGIFT(directoryName, prefixName, number) {
    const fs = require('fs');
    const path = require('path');
    for (let i = 0; i < number; ++i) {
      fs.writeFileSync(path.join(directoryName[0],  prefixName + i + '.gift'), this.internal.generateGIFT());
    }
  }
}