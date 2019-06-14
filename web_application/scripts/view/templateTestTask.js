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
  }

  initializeTestType(tagId, data) {
    $('#'+tagId).append('<div>' +
      '<h1 class="form-signin-heading" align="left">Тип шаблона тестового задания</h1>' +
      '<select title="Тип ШТЗ" class="selectpicker" onchange="window.templateTestView.changeTestType()" id=\''+ this.testTypeId + '\'>' +
      '<option value="0">Самостоятельный ввод ответа</option>' +
      '<option value="1">Единственный выбор</option>' +
      '<option value="2">Множество выборов</option>' +
      '</select></div>');
    $('select').selectpicker();
    if (data !== undefined) {
      $('#'+this.testTypeId + ' :nth-child(' + data + ')').attr("selected", "selected");
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
      for (let ruleName in data) {
        if (data.hasOwnProperty(ruleName)) {
          this.addRuleComplete(ruleName, data[ruleName]);
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
    $('#' + ruleInputId).on('input', function() {
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
    $('#'+productionInputId).on('input', function () {
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
    $('#'+ruleData[1]).val(ruleName);
    for (let i=0;i<productions.length;++i) {
      let productionData = this.addProduction(ruleData[0]);
      $('#' + productionData[1]).val();
    }
  }

  initializeTestText(tagId, data) {
    let tag = $('#'+tagId);
    tag.append('<div>' +
      '<h1 class="form-signin-heading" align="left">Текст тестового задания</h1>' +
      '<div class="input-group"><textarea id="' + this.testTextId + '" cols="100" rows="10" class="form-control" placeholder="Текст тестового задания"></textarea></div>' +
      '</div>');
    let textTag = $('#' + this.testTextId);
    textTag.on('input', function () {
      window.templateTestView.changeTestText();
    });

    if (data !== undefined) {
      textTag.val(data);
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
    this.updateSendButton();
  }

  initializeAnswerScript(tagId, data) {
    let tag = $('#'+tagId);
    tag.append('<div>' +
      '<h1 class="form-signin-heading" align="left">Скрипт вычисления ответа</h1>' +
      '<div class="input-group"><textarea id="' + this.answerScriptId + '" cols="100" rows="10" class="form-control" placeholder="Скрипт вычисления ответа"></textarea></div>' +
      '</div>');
    let scriptTag = $('#' + this.answerScriptId);
    scriptTag.on('input', function () {
      window.templateTestView.internal.setAnswerScript($(this).val());
    });

    if (data !== undefined) {
      scriptTag.val(data);
    }
  }

  initializeSendTemplate(tagId) {
    $('#' + tagId).append('<div align="center"><button disabled type="button" id="' + this.sendButtonId + '" class="btn btn-primary" onclick="window.templateTestView.sendTemplateTestTask()"><span class="glyphicon glyphicon-send" aria-hidden="true"></span> Сохранить</button></div>');
  }

  sendTemplateTestTask() {
    let a = document.createElement("a");
    let file = new Blob([this.internal.toJson()], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = 'TTT.json';
    a.click();
  }

  updateSendButton() {
    if ($('.has-error').length > 0 || $('#' + this.testTypeId).val() === '') {
      $('#'+this.sendButtonId).prop('disabled', true);
    } else {
      $('#'+this.sendButtonId).prop('disabled', false);
    }
  }

  initialize(tagId) {
    this.initializeTestType(tagId);
    this.initializeRules(tagId);
    this.initializeTestText(tagId);
    this.initializeAnswerScript(tagId);
    this.initializeSendTemplate(tagId);
  }

}
