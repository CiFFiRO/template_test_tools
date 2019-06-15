class TemplateTestTaskView {
  constructor() {
    this.internal = new TemplateTestTaskInternal();
    this.testTypeId = 'testTypeSelect';
    this.ruleHeadId = 'ruleHead';
    this.ruleIdPrefix = 'ruleId_';
    this.ruleInputIdPrefix = 'ruleInputId_';
    this.productionAddIdPrefix = 'buttonProductionAdd_';
    this.productionIdPrefix = 'productionId_';
    this.productionInputIdPrefix = 'productionInputId_';
    this.testTextId = 'testTextId';
    this.answerScriptId = 'answerScriptId';
    this.uniqueNumber = 0;
    this.lastSuccessRuleNameByRuleId = {};
    this.productionIdToIndexByRuleId = {};
    this.sendButtonId = 'sendTTTButton';
    this.loadButtonId = 'loadTTTButton';
    this.tagContainId = null;
    this.codeMirror = null;
  }

  initializeTestType(tagId, data) {
    $('#'+tagId).append('<div>' +
      '<h1 class="form-signin-heading" align="left">Тип шаблона тестового задания</h1>' +
      '<select title="Тип ШТЗ" class="selectpicker" onchange="window.templateTestView.changeTestType()" id="'+ this.testTypeId + '">' +
      '<option value="0">Самостоятельный ввод ответа</option>' +
      '<option value="1">Единственный выбор</option>' +
      '<option value="2">Множество выборов</option>' +
      '</select></div>');
    $('select').selectpicker();
    let typeSelect = $('#' + this.testTypeId);
    typeSelect.on('input change', function() {
      window.templateTestView.changeTestType();
    });
    if (data !== undefined) {
      typeSelect.val(data['type']);
      typeSelect.change();
    }
  }

  changeTestType() {
    try {
      this.internal.setType(+$('#' + this.testTypeId).val());
    } catch (error) {
      DEBUG(error);
    }
    this.changeTestText();
  }

  initializeRules(tagId, data) {
    let tag = $('#'+tagId);
    tag.append('<div id="' + this.ruleHeadId + '"><ul class="list-inline">' +
      '<li><h1 class="form-signin-heading" align="center">Правила и продукции</h1></li>' +
      '<li><button type="button" class="btn btn-success" onclick="window.templateTestView.addRule();"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button></li></ul></div>');

    if (data !== undefined) {
      for (let ruleName in data['rules']) {
        if (data['rules'].hasOwnProperty(ruleName)) {
          this.addRuleComplete(ruleName, data['rules'][ruleName]);
        }
      }
    }
  }

  addRule() {
    let ruleId = this.ruleIdPrefix + this.uniqueNumber;
    let ruleInputId = this.ruleInputIdPrefix + this.uniqueNumber;
    ++this.uniqueNumber;

    this.lastSuccessRuleNameByRuleId[ruleId] = null;
    this.productionIdToIndexByRuleId[ruleId] = {};

    $('#' + this.ruleHeadId).append('<div id="' + ruleId + '">' +
      '<ul class="list-inline">' +
      '<li><div class="input-group"><input id="' + ruleInputId + '" type="text" class="form-control" placeholder="Имя правила"></div></li>' +
      '<li><button id="' + this.productionAddIdPrefix + ruleId + '" type="button" class="btn btn-success" disabled onclick="window.templateTestView.addProduction(\'' + ruleId + '\');"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button></li>' +
      '<li><button type="button" class="btn btn-danger" onclick="window.templateTestView.removeRule(\'' + ruleId + '\');"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></li>' +
      '</ul></div>');
    $('#' + ruleInputId).on('input change', function() {
      window.templateTestView.renameRule(ruleId, ruleInputId);
    });

    return [ruleId, ruleInputId];
  }

  renameRule(id, inputId) {
    try {
      let input = $('#'+inputId);
      let newRuleName = input.val();
      if (this.lastSuccessRuleNameByRuleId[id] === null) {
        this.internal.addRule(newRuleName);
      } else {
        this.internal.renameRule(this.lastSuccessRuleNameByRuleId[id], newRuleName);
      }
      this.lastSuccessRuleNameByRuleId[id] = newRuleName;
      input.parent().removeClass('has-error');
      $('#' + this.productionAddIdPrefix + id).prop('disabled', false);
    } catch (error) {
      DEBUG(error);
      $('#'+inputId).parent().addClass('has-error');
    }
    this.changeTestText();
  }

  removeRule(id) {
    try {
      if (this.lastSuccessRuleNameByRuleId[id] !== null) {
        this.internal.removeRule(this.lastSuccessRuleNameByRuleId[id]);
      }
      $('#'+id).remove();
      delete this.lastSuccessRuleNameByRuleId[id];
      delete this.productionIdToIndexByRuleId[id];
    } catch (error) {
      DEBUG(error);
    }
    this.changeTestText();
  }

  addProduction(ruleId) {
    let productionId = this.productionIdPrefix + this.uniqueNumber;
    let productionInputId = this.productionInputIdPrefix + this.uniqueNumber;
    ++this.uniqueNumber;

    this.productionIdToIndexByRuleId[ruleId][productionId] = this.internal.addProductionRule(this.lastSuccessRuleNameByRuleId[ruleId], '') - 1;

    $('#' + ruleId).append('<div id="' + productionId + '">' +
      '<ul class="list-inline">' +
      '<li><div class="input-group"><textarea id="' + productionInputId + '" cols="40" rows="3" class="form-control" placeholder="Текст продукции"></textarea></div></li>' +
      '<li><button type="button" class="btn btn-danger" onclick="window.templateTestView.removeProduction(\'' + ruleId + '\', \'' + productionId + '\');"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></li>' +
      '</ul></div>');
    $('#'+productionInputId).on('input change', function () {
      window.templateTestView.changeProduction(ruleId, productionInputId, productionId);
    });

    return [productionId, productionInputId];
  }

  changeProduction(ruleId, inputId, id) {
    try {
      let input = $('#'+inputId);
      this.internal.changeProductionRule(this.lastSuccessRuleNameByRuleId[ruleId], input.val(), this.productionIdToIndexByRuleId[ruleId][id]);
      input.parent().removeClass('has-error');
    } catch (error) {
      DEBUG(error);
      $('#'+inputId).parent().addClass('has-error');
    }
    this.changeTestText();
  }

  removeProduction(ruleId, id) {
    try {
      let deletedIndex = this.productionIdToIndexByRuleId[ruleId][id];
      this.internal.removeProductionRule(this.lastSuccessRuleNameByRuleId[ruleId], deletedIndex);
      for (let productionId in this.productionIdToIndexByRuleId[ruleId]) {
        if (this.productionIdToIndexByRuleId[ruleId].hasOwnProperty(productionId)) {
          if (this.productionIdToIndexByRuleId[ruleId][productionId] > deletedIndex) {
            --this.productionIdToIndexByRuleId[ruleId][productionId];
          }
        }
      }
      delete this.productionIdToIndexByRuleId[ruleId][id];
      $('#'+id).remove();
    } catch (error) {
      DEBUG(error);
    }
  }

  addRuleComplete(ruleName, productions) {
    let ruleData = this.addRule();
    let input = $('#'+ruleData[1]);
    input.val(ruleName);
    input.change();
    for (let i=0;i<productions.length;++i) {
      let productionData = this.addProduction(ruleData[0]);
      input = $('#' + productionData[1]);
      input.val(productions[i]);
      input.change();
    }
  }

  initializeTestText(tagId, data) {
    let tag = $('#'+tagId);
    tag.append('<div>' +
      '<h1 class="form-signin-heading" align="left">Текст тестового задания</h1>' +
      '<div class="input-group"><textarea id="' + this.testTextId + '" cols="100" rows="10" class="form-control" placeholder="Текст тестового задания"></textarea></div>' +
      '</div>');
    let textTag = $('#' + this.testTextId);
    textTag.on('input change', function () {
      window.templateTestView.changeTestText();
    });

    if (data !== undefined) {
      textTag.val(data['testText']);
      textTag.change();
    }
  }

  changeTestText() {
    try {
      let tag = $('#'+this.testTextId);
      this.internal.setTestText(tag.val());
      tag.parent().removeClass('has-error');
    } catch (error) {
      DEBUG(error);
      $('#'+this.testTextId).parent().addClass('has-error');
    }
    this.updateSaveButton();
  }

  initializeAnswerScript(tagId, data) {
    let tag = $('#'+tagId);
    tag.append('<div>' +
      '<h1 class="form-signin-heading" align="left">Скрипт вычисления ответа</h1>' +
      '<div class="input-group"><textarea id="' + this.answerScriptId + '" cols="100" rows="10" class="form-control" placeholder="Скрипт вычисления ответа"></textarea></div>' +
      '</div>');
    let scriptTag = $('#' + this.answerScriptId);
    this.codeMirror = CodeMirror.fromTextArea(scriptTag[0], {
      lineNumbers: true,
      styleActiveLine: true,
      matchBrackets: true,
      theme: 'darcula'
    });
    this.codeMirror.setSize(750, 300);
    this.codeMirror.on('change', function (cm, change) {
      window.templateTestView.internal.setAnswerScript(cm.getValue());
    });

    if (data !== undefined) {
      this.codeMirror.setValue(data['answerScript']);
    }
  }


  initializeButtonsTTT(tagId) {
    $('#' + tagId).append('<div class="btn-group" role="group" aria-label="...">' +
      '<button disabled type="button" id="' + this.sendButtonId + '" class="btn btn-primary" onclick="window.templateTestView.saveTTT()"><span class="glyphicon glyphicon-save" aria-hidden="true"></span> Скачать</button>' +
      '<button type="button" id="' + this.loadButtonId + '" class="btn btn-primary" onclick="window.templateTestView.loadTTT()"><span class="glyphicon glyphicon-upload" aria-hidden="true"></span> Загрузить</button>' +
      '</div>');

  }

  saveTTT() {
    let a = document.createElement("a");
    let file = new Blob([this.internal.toJson()], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = 'TTT.json';
    a.click();
  }

  updateSaveButton() {
    if ($('.has-error').length > 0 || $('#' + this.testTypeId).val() === '') {
      $('#'+this.sendButtonId).prop('disabled', true);
    } else {
      $('#'+this.sendButtonId).prop('disabled', false);
    }
  }

  loadTTT() {
    LOAD_FILE(function (ttt) {
      window.templateTestView.load(JSON.parse(ttt));
    });
  }

  load(ttt, tagId) {
    if (this.tagContainId !== null) {
      $('#' + this.tagContainId).empty();
      this.internal = new TemplateTestTaskInternal();
    }

    if (tagId !== undefined) {
      this.tagContainId = tagId;
    }

    this.initialize(this.tagContainId, ttt);
    this.updateSaveButton();
  }

  initialize(tagId, data) {
    this.tagContainId = tagId;
    this.initializeTestType(tagId, data);
    this.initializeRules(tagId, data);
    this.initializeTestText(tagId, data);
    this.initializeAnswerScript(tagId, data);
    this.initializeButtonsTTT(tagId, data);
  }

}
