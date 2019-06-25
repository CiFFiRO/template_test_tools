class TemplateTestView {
  constructor() {
    this.internal = new TemplateTestInternal();
    this.fileName = null;
    this.TTTPrefixId = 'TTTPrefixId_';
    this.TTTDeletePrefixId = 'TTTDeletePrefixId_';
    this.uniqueNumber = 0;
    this.sectionTTTIdToIndex = {};
    this.listTTTId = 'editListTTT';
    this.titleId = 'inputTitle';
    this.selectOrderTypeId = 'selectOrderTypeId';
    this.buttonAddTTTId = 'addTTT';

    $('#' + this.titleId).on('input change', function() {
      this.internal.setTitle($('#' + this.titleId).val());
    }.bind(this));
    $('select').selectpicker();
    $('#' + this.selectOrderTypeId).on('input change', function() {
      this.internal.setOrderType(+$('#' + this.selectOrderTypeId).val());
    }.bind(this));
    $('#'+this.buttonAddTTTId).on('click', function() {
      this.addTTTs();
    }.bind(this));
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

      for (let i=0;i<data.length;++i) {
        function cutPrefix(name) {
          return name.substring(name.lastIndexOf('\\')+1);
        }

        data[i] = {'ttt': JSON.parse(data[i].data), 'title': cutPrefix(data[i].name)};
      }
    } else {
      data = tttElements;
    }

    for (let i=0;i<data.length;++i) {
      try {
        this.internal.addTTT(data[i]['ttt'], data[i]['title']);
      } catch (error) {
        DEBUG(error);
        continue;
      }

      let sectionId = this.TTTPrefixId + this.uniqueNumber;
      let buttonId = this.TTTDeletePrefixId + this.uniqueNumber;
      ++this.uniqueNumber;

      this.sectionTTTIdToIndex[sectionId] = this.internal.arrayTTT.length - 1;

      $('#' + this.listTTTId).append('<div id="' + sectionId + '" class="row"><div class="col-md-12">' +
        '<ul class="list-inline"><li><h3 class="form-signin-heading"><span class="left-buffer label label-default">' + data[i]['title'] + '</span></h3></li>' +
        '<li><div class="col-md-1"><button id="' + buttonId + '" type="button" class="btn btn-danger"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></li>' +
        '</ul></div></div>');
      $('#'+buttonId).on('click', function() {
        $('#' + sectionId).remove();
        this.internal.removeTTT(this.sectionTTTIdToIndex[sectionId]);
        let index = this.sectionTTTIdToIndex[sectionId];
        delete this.sectionTTTIdToIndex[sectionId];
        for (let key in this.sectionTTTIdToIndex) {
          if (this.sectionTTTIdToIndex.hasOwnProperty(key)) {
            if (this.sectionTTTIdToIndex[key] > index) {
              --this.sectionTTTIdToIndex[key];
            }
          }
        }
      }.bind(this));
    }
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
      fileName = dialog.showSaveDialog({
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
    for (let i = 0; i < number; ++i) {
      fs.writeFileSync(directoryName + '\\' + prefixName + i + '.gift', this.internal.generateGIFT());
    }
  }
}