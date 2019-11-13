const IS_CHAKRA_INTERPRETER = false;
const FUNCTIONS_RE = 'rInteger\\(\\s*[+-]?[0-9]+\\s*,\\s*[+-]?[0-9]+\\s*\\)|' +
  'rFloat\\(\\s*[-+]?(?:\\d*\\.?\\d+|\\d+\\.?\\d*)(?:[eE][-+]?\\d+)?\\s*,' +
  '\\s*[-+]?(?:\\d*\\.?\\d+|\\d+\\.?\\d*)(?:[eE][-+]?\\d+)?\\s*,\\s*[+]?[1-9]+[0-9]*\\s*\\)|' +
  'rElement\\(\\s*(\\s*[a-zA-Z0-9]+\\s*,)*\\s*[a-zA-Z0-9]+\\s*\\)';
const PREGENERATED_ANSWER_SCRIPT_PART = '' +
  'let __FALSE_OPTIONS = [];' +
  'let __ANSWER = -1;' +
  '' +
  'function $$rSubArray(array, length) {\n' +
  '  if (isNaN(+length)) {\n' +
  '    throw Error(\'$$rSubArray: length is not a number\');\n' +
  '  }\n' +
  '  if (length < 0) {\n' +
  '    throw Error(\'$$rSubArray: length is bad\');\n' +
  '  }\n' +
  '  \n' +
  '  function getRandomInt(min, max) {\n' +
  '    return Math.floor(Math.random() * (max - min)) + min;\n' +
  '  }\n' +
  '  \n' +
  '  let result = [];\n' +
  '  let copy = array.slice(0);\n' +
  '  for (let _ = 0;_ < length;++_) {\n' +
  '    if (copy.length === 0) {\n' +
  '      break;\n' +
  '    }\n' +
  '    let i = getRandomInt(0, copy.length);\n' +
  '    result.push(copy[i]);\n' +
  '    copy.splice(i, 1);\n' +
  '  }\n' +
  '  \n' +
  '  return result;\n' +
  '}' +
  '' +
  'function $$FalseOptionsIs(falseOptions) {\n' +
  '  __FALSE_OPTIONS = falseOptions;\n' +
  '}\n' +
  '' +
  '  function $$AnswerIs(answer) {\n' +
  '    if (typeof answer !== \'object\') {\n' +
  '      __ANSWER = [answer];\n' +
  '    } else {\n' +
  '      __ANSWER = answer;\n' +
  '    }\n' +
  '  }\n' +
  '' +
  'function __END_SCRIPT() {\n' +
  '  return [__ANSWER, __FALSE_OPTIONS];\n' +
  '}';
const SHORT_ANSWER_TYPE = 0;
const SINGLE_CHOOSE_TYPE = 1;
const MULTIPLE_CHOOSE_TYPE = 2;

const STRONG_ORDER_TYPE = 0;
const RANDOM_ORDER_TYPE = 1;


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function rInteger(min, max) {
  return getRandomInt(min, max+1);
}

function rFloat(min, max, length) {
  let value = Math.random() * (max - min) + min;
  return value.toFixed(length);
}

function rElement(elements) {
  return elements[getRandomInt(0, elements.length)];
}

function rSubArray(array, length) {
  let result = [];
  let copy = array.slice(0);
  for (let _ = 0;_ < length;++_) {
    if (copy.length === 0) {
      break;
    }
    let i = getRandomInt(0, copy.length);
    result.push(copy[i]);
    copy.splice(i, 1);
  }
  return result;
}

function isDigit(aChar) {
  let myCharCode = aChar.charCodeAt(0);

  if (myCharCode > 47 && myCharCode < 58) {
    return true;
  }

  return false;
}

function isAlpha(aChar) {
  let myCharCode = aChar.charCodeAt(0);

  if((myCharCode > 64 && myCharCode < 91) || (myCharCode > 96 && myCharCode < 123)) {
    return true;
  }

  return false;
}

function isSpace(aChar) {
  let myCharCode = aChar.charCodeAt(0);

  if ((myCharCode > 8 && myCharCode < 14) || myCharCode === 32){
    return true;
  }

  return false;
}

function CheckTemplateTestTaskGrammar(grammar) {
  let alternativeRegExp = `([^$|.]|\\.\\.|\\$\\||\\$\\$|\\$(${FUNCTIONS_RE})|\\$\\{\\s*[0-9a-zA-Z]+\\s*\\})+`;
  let grammarRegExp = new RegExp(`^\\s*([0-9a-zA-Z]+=((${alternativeRegExp}(\\|${alternativeRegExp})*)|(\\[${alternativeRegExp}(\\|${alternativeRegExp})*\\]))\\.\\s*)*$`);
  return grammarRegExp.test(grammar);
}

function templateTestTaskFormToTemplate(header, type, grammar, textTask, feedbackScript) {
  if (typeof header !== 'string' || typeof grammar !== 'string' ||
    typeof textTask !== 'string' || typeof feedbackScript !== 'string' || typeof type !== 'number') {
    throw Error('Argument(s) type not a string');
  }
  if (type < SHORT_ANSWER_TYPE || type > MULTIPLE_CHOOSE_TYPE) {
    throw Error('Type test task is not current');
  }
  if (!CheckTemplateTestTaskGrammar(grammar)) {
    throw Error('Grammar has syntax error');
  }

  let rules = {};
  for (let i=0;i<grammar.length;) {
    let beginNonTerminal=-1;
    while(i < grammar.length && isSpace(grammar[i])) ++i;
    if (i === grammar.length) {
      break;
    }
    beginNonTerminal = i;
    while(grammar[i] !== '=') ++i;
    let nonTerminal = grammar.substring(beginNonTerminal, i);
    if (nonTerminal in rules) {
      throw Error(`Redefine non terminal ${nonTerminal}`);
    }
    rules[nonTerminal] = [];
    ++i;
    let condition = false;
    if (grammar[i] === '[') {
      condition = true;
      ++i;
    }
    let beginAlternative = i;
    while (i < grammar.length) {
      if (grammar[i] === '.') {
        if (i+1 === grammar.length || grammar[i+1] !== '.') {
          let endAlternative = i;
          if (condition && grammar[i-1] === ']') {
            --endAlternative;
          } else if (condition) {
            rules[nonTerminal][0] = '[' + rules[nonTerminal][0];
            condition = false;
          }

          if (beginAlternative === endAlternative) {
            throw Error(`Non terminal ${nonTerminal} has empty alternative with condition construction`);
          }

          let alternative = grammar.substring(beginAlternative, endAlternative);
          alternative = alternative.replace(/\$\|/g, '|');
          alternative = alternative.replace(/\.\./g, '.');
          rules[nonTerminal].push(alternative);
          ++i;
          break;
        } else {
          i += 2;
        }
      }
      else if (grammar[i] === '|') {
        let alternative = grammar.substring(beginAlternative, i);
        alternative = alternative.replace(/\$\|/g, '|');
        alternative = alternative.replace(/\.\./g, '.');
        rules[nonTerminal].push(alternative);
        ++i;
        beginAlternative = i;
      }
      else if (grammar[i] === '$') {
        if (grammar[i+1] === '$') {
          i += 2;
        } else if (grammar[i+1] === '{') {
          i += 2;
          while(isSpace(grammar[i])) ++i;
          let beginNonTerminalName = i;
          while(!isSpace(grammar[i]) && grammar[i] !== '}') ++i;
          let nonTerminalName = grammar.substring(beginNonTerminalName, i);
          ++i;
          if (!(nonTerminalName in rules) || nonTerminalName === nonTerminal) {
            throw Error(`Use not previously defined non terminal ${nonTerminalName} in the definition ${nonTerminal}`);
          }
        } else if (grammar[i+1] === '|') {
          i += 2;
        } else {
          while (grammar[i] !== '(') ++i;
          ++i;
          while (grammar[i] !== ')') ++i;
          ++i;
        }
      }
      else {
        ++i;
      }
    }

    if (condition) {
      rules[nonTerminal].push('');
    }
  }

  let result = {title:header, type:type, rules:rules, testText: textTask, feedbackScript:feedbackScript};
  if (IS_CHAKRA_INTERPRETER) {
    return JSON.stringify(result);
  }
  return result;
}

function checkTemplateTestTask(templateTestTask) {
  if (IS_CHAKRA_INTERPRETER) {
    templateTestTask = JSON.parse(templateTestTask);
  }

  if (!templateTestTask.hasOwnProperty('title') || !templateTestTask.hasOwnProperty('type') || !templateTestTask.hasOwnProperty('rules')
    || !templateTestTask.hasOwnProperty('testText') || !templateTestTask.hasOwnProperty('feedbackScript')) {
    throw Error('Bad json data');
  }
  if (typeof templateTestTask['type'] !== 'number' ||
    templateTestTask['type'] < SHORT_ANSWER_TYPE || templateTestTask['type'] > MULTIPLE_CHOOSE_TYPE) {
    throw Error('Bad template test task type');
  }
  let nonTerminals = new Set();
  let nonTerminalsNamesRegExp = '';
  for (let nonTerminal in templateTestTask['rules']) {
    if (templateTestTask['rules'].hasOwnProperty(nonTerminal)) {
      if (!/^[0-9a-zA-Z]+$/.test(nonTerminal)) {
        throw Error(`Non terminal name has syntax error - ${nonTerminal}`);
      }
      if (nonTerminals.has(nonTerminal)) {
        throw Error(`Duplicate non terminal name - ${nonTerminal}`);
      }
      nonTerminals.add(nonTerminal);
      if (nonTerminalsNamesRegExp.length > 0) {
        nonTerminalsNamesRegExp += '|' + nonTerminal;
      }
      let regexp = new RegExp(`^([^$]|\\$\\$|\\$(${FUNCTIONS_RE})|\\$\\{\\s*(${nonTerminalsNamesRegExp})\\s*\\})*$`);
      for (let i = 0; i < templateTestTask['rules'][nonTerminal].length; ++i) {
        if (!regexp.test(templateTestTask['rules'][nonTerminal][i])) {
          throw Error(`Non terminal ${nonTerminal} alternative has syntax error`);
        }
      }
    }
  }

  let nonTerminalNames = '';
  for (let name of nonTerminals) {
    nonTerminalNames += name + '|';
  }
  nonTerminalNames = nonTerminalNames.substr(0, nonTerminalNames.length - 1);

  let checkRegExpPattern = '^([^$]|\\$\\$|\\$\\{\\s*(' + nonTerminalNames + ')\\s*\\}+)*$';
  let checkRegExp = new RegExp(checkRegExpPattern);
  if (!checkRegExp.test(templateTestTask['testText'])) {
    throw new Error('Test text has syntax error')
  }
}

function generateTestTaskFromTemplateTestTask(templateTestTask) {
  if (IS_CHAKRA_INTERPRETER) {
    templateTestTask = JSON.parse(templateTestTask);
  }

  let result = {};
  result['type'] = templateTestTask['type'];

  function replaceFunctions(production) {
    function nextFunction(production) {
      let i = 0;
      while (i < production.length) {
        if (i + 1 < production.length && production[i] === '$' && production[i + 1] !== '$') {
          let startIndex = i;
          let name = '';
          ++i;
          while (isAlpha(production[i]) || isDigit(production[i])) {
            name += production[i];
            ++i;
          }

          let arguments = [];
          while (i < production.length && production[i] !== ')') {
            if (production[i] !== '(' && production[i] !== ')' && production[i] !== ',' && !isSpace(production[i])) {
              let argument = '';
              while (production[i] !== ')' && production[i] !== ',' && !isSpace(production[i])) {
                argument += production[i];
                ++i;
              }
              arguments.push(argument);
            } else {
              ++i;
            }
          }

          return [startIndex, i, name, arguments];
        } else {
          ++i;
        }
      }

      return null;
    }

    let result = production;
    while (true) {
      let info = nextFunction(result);
      if (info === null) {
        break;
      }

      let name = info[2];
      let arguments = info[3];

      if (name === 'rInteger') {
        let min = +arguments[0];
        let max = +arguments[1];
        if (min > max) {
          throw Error('rInteger: interval is not exist');
        }

        let value = rInteger(min, max);
        result = result.substring(0, info[0]) + value + result.substring(info[1]+1);
      } else if (name === 'rFloat') {
        let min = +arguments[0];
        let max = +arguments[1];
        let length = +arguments[2];
        if (min > max) {
          throw Error('rFloat: interval is not exist');
        }

        let value = rFloat(min, max, length);
        result = result.substring(0, info[0]) + value + result.substring(info[1]+1);
      } else if (name === 'rElement') {
        // TODO: протестить на работо способность
        if (arguments.length === 0) {
          throw Error('rElement: does not have arguments');
        }

        let value = arguments[getRandomInt(0, arguments.length)];
        result = result.substring(0, info[0]) + value + result.substring(info[1]+1);
      } else {
        throw Error('Function ' + name + ' is not exist');
      }
    }

    return result;
  }

  let alternativeIndexForNonTerminals = {};
  let alternativeForNonTerminals = {};
  function replaceNonTerminals(text) {
    let result = text;
    for (let nonTerminal in templateTestTask['rules']) {
      if (templateTestTask['rules'].hasOwnProperty(nonTerminal)) {
        let regexpScheme = '\\$\\{\\s*' + nonTerminal + '\\s*\\}';
        let regexp = new RegExp(regexpScheme, 'g');
        result = result.replace(regexp, alternativeForNonTerminals[nonTerminal]);
      }
    }

    result = result.replace(/\$\$/g, '$');

    return result;
  }

  for (let nonTerminal in templateTestTask['rules']) {
    if (templateTestTask['rules'].hasOwnProperty(nonTerminal)) {
      alternativeIndexForNonTerminals[nonTerminal] = getRandomInt(0, templateTestTask['rules'][nonTerminal].length);
      alternativeForNonTerminals[nonTerminal] = replaceFunctions(replaceNonTerminals(templateTestTask['rules'][nonTerminal][alternativeIndexForNonTerminals[nonTerminal]]));
    }
  }

  function removeEmptyStrings(text) {
    let lines = text.split('\n');
    let result = '';

    for (let lineIndex = 0; lineIndex < lines.length; ++lineIndex) {
      if (lines[lineIndex].length > 0) {
        result += lines[lineIndex] + '\n';
      }
    }

    return result;
  }

  function replaceSpecialSymbolsGIFT(text) {
    let result = text;
    let specialCharacters = ['~', '=', '#', '{', '}', ':'];
    for (let i=0;i<specialCharacters.length;++i) {
      let regexp = new RegExp(specialCharacters[i], 'g');
      result = result.replace(regexp, '\\'+specialCharacters[i]);
    }

    return result;
  }

  let testText = replaceSpecialSymbolsGIFT(removeEmptyStrings(replaceNonTerminals(templateTestTask['testText'])));
  if (testText.length === 0) {
    throw Error('Test task text is empty');
  }

  result['testText'] = testText;

  let generatedFeedbackScriptPart = 'let __TYPE_TEST_TASK = ' + templateTestTask['type'] + ';\n';
  for (let rule in templateTestTask['rules']) {
    if (templateTestTask['rules'].hasOwnProperty(rule)) {
      generatedFeedbackScriptPart += 'let $' + rule + ' = ' + alternativeIndexForNonTerminals[rule] + ';\n';
      generatedFeedbackScriptPart += 'let $' + rule + '_value = "' + alternativeForNonTerminals[rule].replace(/\n/g, '\\n') + '";\n';
      for (let i=0;i<templateTestTask['rules'][rule].length;++i) {
        generatedFeedbackScriptPart += 'let $' + rule + '_' + i + ' = ' + i + ';\n';
      }
    }
  }

  let script = generatedFeedbackScriptPart + PREGENERATED_ANSWER_SCRIPT_PART + templateTestTask['feedbackScript'] + ';\n__END_SCRIPT();';
  let value = null;
  try {
    value = eval(script);
  } catch (error) {
    throw Error('Answer script error: ' + error.message);
  }

  let answer = value[0];
  let falseOptions = value[1];

  if (typeof answer !== 'object') {
    throw Error('Answer does not initialized');
  }
  if (answer.length < 1) {
    throw Error('Wrong true answers number');
  }

  answer.forEach(function (elem) {
    let type = typeof elem;
    if (type !== 'string' && type !== 'number') {
      throw Error('Wrong true option type');
    }
  });
  falseOptions.forEach(function (elem) {
    let type = typeof elem;
    if (type !== 'string' && type !== 'number') {
      throw Error('Wrong false option type');
    }
  });

  if (templateTestTask['type'] === SINGLE_CHOOSE_TYPE && answer.length > 1) {
    throw Error('Multiple answer options');
  }

  if (templateTestTask['type'] === SHORT_ANSWER_TYPE) {
    result['answers'] = answer;
  } else {
    result['trueOptions'] = answer;

    for (let i=0;i<answer.length;++i) {
      if (falseOptions.indexOf(answer[i]) !== -1) {
        throw Error('False options contain true option');
      }
    }

    result['falseOptions'] = falseOptions;
  }

  if (IS_CHAKRA_INTERPRETER) {
    return JSON.stringify(result);
  }
  return result;
}

function translateTestTaskToGIFT(testTask) {
  if (IS_CHAKRA_INTERPRETER) {
    testTask = JSON.parse(testTask);
  }

  function getOptions(trueOptions, falseOptions) {
    let result = [];
    for (let i=0;i<trueOptions.length;++i) {
      result.push([true, trueOptions[i]]);
    }
    for (let i=0;i<falseOptions.length;++i) {
      result.push([false, falseOptions[i]]);
    }

    return rSubArray(result, result.length);
  }

  let result = testTask['testText'] + '{\n';
  if (testTask['type'] === SHORT_ANSWER_TYPE) {
    for (let optionIndex = 0; optionIndex < testTask['answers'].length; ++optionIndex) {
      result += '=' + testTask['answers'][optionIndex] + '\n';
    }
  } else {
    let options = getOptions(testTask['trueOptions'], testTask['falseOptions']);
    for (let optionIndex = 0; optionIndex < options.length; ++optionIndex) {
      if (options[optionIndex][0]) {
        result += '=';
      } else {
        result += '~';
      }
      result += options[optionIndex][1] + '\n';
    }
  }
  result += '}\n';

  return result;
}

function translateTemplateTestTaskToForm(template) {
  if (IS_CHAKRA_INTERPRETER) {
    template = JSON.parse(template);
  }

  let result = {header:template['title'], type:template['type'], grammar:'',
    testText:template['testText'], feedbackScript:template['feedbackScript']};

  function replaceDots(alternative) {
    let result = '';
    let beginIndex = 0;
    for (let i=0;i < alternative.length;++i) {
      if (alternative[i] === '$' && i+1 < alternative.length) {
        if (alternative[i+1] === '$') {
          ++i;
        } else if (alternative[i+1] !== '{' && alternative[i+1] !== '$') {
          ++i;
          while (alternative[i] !== ')') ++i;
        }
      } else if (alternative[i] === '.') {
        result += alternative.substring(beginIndex, i+1) + '.';
        beginIndex = i+1;
      }
    }
    if (beginIndex < alternative.length) {
      result += alternative.substring(beginIndex);
    }

    return result;
  }

  for (let nonTerminal in template['rules']) {
    if (template['rules'].hasOwnProperty(nonTerminal)) {
      let expression = nonTerminal+'=';
      let condition = false;
      if (template['rules'][nonTerminal][template['rules'][nonTerminal].length-1].length === 0) {
        condition = true;
        expression += '[';
      }

      for (let i=0;i<template['rules'][nonTerminal].length;++i) {
        if (condition && i+1===template['rules'][nonTerminal].length) {
          break;
        }
        let alternative = template['rules'][nonTerminal][i];
        alternative = replaceDots(alternative);
        alternative = alternative.replace(/\|/g, '$|');
        expression += alternative;
        if ((condition && i+1<template['rules'][nonTerminal].length-1) ||
          (!condition && i+1<template['rules'][nonTerminal].length)) {
          expression += '|';
        }
      }

      if (condition) {
        expression += ']';
      }
      expression += '.';
      result['grammar'] += expression + '\n';
    }
  }

  if (IS_CHAKRA_INTERPRETER) {
    return JSON.stringify(result);
  }
  return result;
}

module.exports = {
  templateTestTaskFormToTemplate: templateTestTaskFormToTemplate,
  translateTemplateTestTaskToForm: translateTemplateTestTaskToForm,
  checkTemplateTestTask: checkTemplateTestTask,
  generateTestTaskFromTemplateTestTask: generateTestTaskFromTemplateTestTask,
  translateTestTaskToGIFT: translateTestTaskToGIFT,
  checkTemplateTest: function (templateTest) {
    if (!templateTest.hasOwnProperty('orderType') || !templateTest.hasOwnProperty('arrayTTT') ||
      !templateTest.hasOwnProperty('title')) {
      return false;
    }
    if (typeof templateTest.orderType !== 'number' || typeof templateTest.arrayTTT !== 'object'
    || typeof templateTest.title !== 'string') {
      return false;
    }
    if (templateTest.orderType > RANDOM_ORDER_TYPE || templateTest.orderType < STRONG_ORDER_TYPE) {
      return false;
    }

    for (let i=0;i<templateTest.arrayTTT.length;++i) {
      try {
        checkTemplateTestTask(templateTest.arrayTTT[i]);
      } catch (error) {
        return false;
      }
    }

    return true;
  },
  generateTestFormTemplateTest: function (templateTest) {
    let result = [];
    let arrayTTT = templateTest.arrayTTT.slice(0);

    if (templateTest.orderType === RANDOM_ORDER_TYPE) {
      arrayTTT = rSubArray(arrayTTT, arrayTTT.length);
    }

    for (let i=0;i<arrayTTT.length;++i) {
      result.push(generateTestTaskFromTemplateTestTask(arrayTTT[i]));
    }

    return result;
  },
  translateTestToGIFT: function (test) {
    let date = new Date(Date.now());
    let preamble = '// generated date: ' + date.toString();
    let space = '//--------------------------------------------------';
    let result = preamble + '\n\n\n';

    function getOptions(trueOptions, falseOptions) {
      let result = [];
      for (let i=0;i<trueOptions.length;++i) {
        result.push([true, trueOptions[i]]);
      }
      for (let i=0;i<falseOptions.length;++i) {
        result.push([false, falseOptions[i]]);
      }

      return rSubArray(result, result.length);
    }

    for (let testIndex = 0; testIndex < test.length; ++testIndex) {
      result += test[testIndex]['testText'] + '{\n';
      if (test[testIndex]['type'] === SHORT_ANSWER_TYPE) {
        for (let optionIndex = 0; optionIndex < test[testIndex]['answers'].length; ++optionIndex) {
          result += '=' + test[testIndex]['answers'][optionIndex] + '\n';
        }
      } else {
        let options = getOptions(test[testIndex]['trueOptions'], test[testIndex]['falseOptions']);
        for (let optionIndex = 0; optionIndex < options.length; ++optionIndex) {
          if (options[optionIndex][0]) {
            result += '=';
          } else {
            result += '~';
          }
          result += options[optionIndex][1] + '\n';
        }
      }
      result += '}\n';
      result += '\n' + space + '\n';
    }

    return result;
  }
};
