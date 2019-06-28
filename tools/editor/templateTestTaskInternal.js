const INPUT_TASK_TYPE = 0;
const SINGLE_CHOOSE_TYPE = 1;
const MULTI_CHOOSE_TYPE = 2;

class TemplateTestTaskInternal {
  constructor() {
    this.type = -1;
    this.rulesToProductions = {};
    this.testText = '';
    this.answerScript = '';
    this.title = '';
  }

  setTitle(title) {
    if (typeof title === 'string') {
      this.title = title;
    } else {
      throw new Error('TemplateTestInternal:setTitle argument is not a string');
    }
  }

  setType(typeCode) {
    if (typeCode !== INPUT_TASK_TYPE && typeCode !== SINGLE_CHOOSE_TYPE && typeCode !== MULTI_CHOOSE_TYPE) {
      throw new Error('TemplateTestTaskInternal:setType incorrect type code.');
    }

    this.type = typeCode;
  }

  addRule(ruleName) {
    if (!/^[0-9a-zA-Z]+$/.test(ruleName)) {
      throw new Error('TemplateTestTaskInternal:addRule incorrect rule name.');
    }
    if (ruleName in this.rulesToProductions) {
      throw new Error('TemplateTestTaskInternal:addRule rule name already use.');
    }

    this.rulesToProductions[ruleName] = [];
  }

  renameRule(oldRuleName, newRuleName) {
    if (oldRuleName === newRuleName) {
      return;
    }
    if (!/^[0-9a-zA-Z]+$/.test(newRuleName)) {
      throw new Error('TemplateTestTaskInternal:renameRule incorrect new rule name.');
    }
    if (newRuleName in this.rulesToProductions) {
      throw new Error('TemplateTestTaskInternal:renameRule new rule name already use.');
    }
    if (!(oldRuleName in this.rulesToProductions)) {
      throw new Error('TemplateTestTaskInternal:addRule old rule name not found.');
    }

    this.rulesToProductions[newRuleName] = this.rulesToProductions[oldRuleName];
    delete this.rulesToProductions[oldRuleName];
  }

  removeRule(ruleName) {
    if (!(ruleName in this.rulesToProductions)) {
      throw new Error('TemplateTestTaskInternal:removeRule rule name not found.');
    }

    delete this.rulesToProductions[ruleName];
  }

  addProductionRule(ruleName, production) {
    if (!(ruleName in this.rulesToProductions)) {
      throw new Error('TemplateTestTaskInternal:addProductionRule rule name not found.');
    }
    if (!/^([^$]|\$\$|\$[a-zA-Z]+)*$/.test(production)) {
      throw new Error('TemplateTestTaskInternal:addProductionRule production has syntax error.');
    }

    this.rulesToProductions[ruleName].push(production);

    return this.rulesToProductions[ruleName].length;
  }

  changeProductionRule(ruleName, production, productionIndex) {
    if (!(ruleName in this.rulesToProductions)) {
      throw new Error('TemplateTestTaskInternal:changeProductionRule rule name not found.');
    }
    if (!/^([^$]|\$\$|\$[a-zA-Z]+)*$/.test(production)) {
      throw new Error('TemplateTestTaskInternal:changeProductionRule production has syntax error.');
    }
    if (productionIndex < 0 || productionIndex >= this.rulesToProductions[ruleName].length) {
      throw new Error('TemplateTestTaskInternal:changeProductionRule bad index.')
    }

    this.rulesToProductions[ruleName][productionIndex] = production;
  }

  removeProductionRule(ruleName, productionIndex) {
    if (!(ruleName in this.rulesToProductions)) {
      throw new Error('TemplateTestTaskInternal:removeProductionRule rule name not found.');
    }
    if (productionIndex < 0 || productionIndex >= this.rulesToProductions[ruleName].length) {
      throw new Error('TemplateTestTaskInternal:removeProductionRule bad index.')
    }

    this.rulesToProductions[ruleName].splice(productionIndex, 1);
  }

  setTestText(testText) {
    let ruleNames = '';
    for (let rule in this.rulesToProductions) {
      ruleNames += rule + '|'
    }
    ruleNames = ruleNames.substr(0, ruleNames.length - 1);

    let checkRegExpPattern = '^([^$]|\\$\\$|\\$\\{\\s*(' + ruleNames + ')\\s*\\}+)*$';
    let checkRegExp = new RegExp(checkRegExpPattern);
    if (!checkRegExp.test(testText)) {
      throw new Error('TemplateTestTaskInternal:setTestText test text has syntax error.')
    }

    this.testText = testText;
  }

  setAnswerScript(answerScript) {
    this.answerScript = answerScript;
  }

  toJson() {
    let json = {};
    json['title'] = this.title;
    json['type'] = this.type;
    json['rules'] = this.rulesToProductions;
    json['testText'] = this.testText;
    json['answerScript'] = this.answerScript;

    return JSON.stringify(json);
  }
}
