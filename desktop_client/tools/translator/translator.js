const SPECIAL_FUNCTIONS_RE = 'rInteger\\(\\s*[+-]?[0-9]+\\s*,\\s*[+-]?[0-9]+\\s*\\)|' +
  'rFloat\\(\\s*[-+]?(?:\\d*\\.?\\d+|\\d+\\.?\\d*)(?:[eE][-+]?\\d+)?\\s*,' +
  '\\s*[-+]?(?:\\d*\\.?\\d+|\\d+\\.?\\d*)(?:[eE][-+]?\\d+)?\\s*\\)|' +
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
const INPUT_TYPE = 0;
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

function  checkTTT (ttt) {
  if (!ttt.hasOwnProperty('title') || !ttt.hasOwnProperty('type') || !ttt.hasOwnProperty('rules')
    || !ttt.hasOwnProperty('testText') || !ttt.hasOwnProperty('answerScript')) {
    throw Error('Bad json data');
  }
  if (typeof ttt['type'] !== 'number' || ttt['type'] < 0 || ttt['type'] > 2) {
    throw Error('Bad TTT type');
  }
  let rules = new Set();
  for (let rule in ttt['rules']) {
    if (ttt['rules'].hasOwnProperty(rule)) {
      if (!/^[0-9a-zA-Z]+$/.test(rule)) {
        throw Error('Rule name has syntax error - ' + rule);
      }
      if (rules.has(rule)) {
        throw Error('Duplicate rules name - ' + rule);
      }
      rules.add(rule);
      let regexp = new RegExp('^([^$]|\\$\\$|\\$(' + SPECIAL_FUNCTIONS_RE + ')+)*$');
      for (let i = 0; i < ttt['rules'][rule].length; ++i) {
        if (!regexp.test(ttt['rules'][rule][i])) {
          throw Error('Production has syntax error in rule - ' + rule);
        }
      }
    }
  }

  let ruleNames = '';
  for (let name of rules) {
    ruleNames += name + '|';
  }
  ruleNames = ruleNames.substr(0, ruleNames.length - 1);

  let checkRegExpPattern = '^([^$]|\\$\\$|\\$\\{\\s*(' + ruleNames + ')\\s*\\}+)*$';
  let checkRegExp = new RegExp(checkRegExpPattern);
  if (!checkRegExp.test(ttt['testText'])) {
    throw new Error('Test text has syntax error')
  }
}

function generateTestTaskFromTTT (ttt) {
  let result = {};
  result['type'] = ttt['type'];

  function replaceSpecialFunctions(production) {
    function nextSpecialFunction(production) {
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
      let info = nextSpecialFunction(result);
      if (info === null) {
        break;
      }

      let name = info[2];
      let arguments = info[3];

      if (name === 'rInteger') {
        if (arguments.length !== 2) {
          throw Error('rInteger: number of arguments is not 2');
        }
        if (isNaN(+arguments[0]) || isNaN(+arguments[1])) {
          throw Error('rInteger: argument(s) not a number');
        }
        let min = +arguments[0];
        let max = +arguments[1];
        if (min > max) {
          throw Error('rInteger: interval is not exist');
        }

        let value = rInteger(min, max);
        result = result.substring(0, info[0]) + value + result.substring(info[1]+1);
      } else if (name === 'rFloat') {
        if (arguments.length !== 3) {
          throw Error('rFloat: number of arguments is not 3');
        }
        if (isNaN(+arguments[0]) || isNaN(+arguments[1]) || isNaN(+arguments[2])) {
          throw Error('rFloat: argument(s) not a number');
        }
        let min = +arguments[0];
        let max = +arguments[1];
        let length = +arguments[2];
        if (min > max) {
          throw Error('rFloat: interval is not exist');
        }
        if (length <= 0) {
          throw Error('rFloat: length is not natural');
        }

        let value = rFloat(min, max, length);
        result = result.substring(0, info[0]) + value + result.substring(info[1]+1);
      } else if (name === 'rElement') {
        if (arguments.length === 0) {
          throw Error('rElement: does not have arguments');
        }

        let value = arguments[getRandomInt(0, arguments.length)];
        result = result.substring(0, info[0]) + value + result.substring(info[1]+1);
      } else {
        throw Error('Special function ' + name + ' is not exist');
      }
    }

    return result;
  }

  let selectedProductionForRules = {};
  let valueForRules = {};
  for (let rule in ttt['rules']) {
    if (ttt['rules'].hasOwnProperty(rule)) {
      selectedProductionForRules[rule] = getRandomInt(0, ttt['rules'][rule].length);
      valueForRules[rule] = replaceSpecialFunctions(ttt['rules'][rule][selectedProductionForRules[rule]]);
    }
  }

  function replaceRules(text) {
    let result = text;
    for (let rule in ttt['rules']) {
      if (ttt['rules'].hasOwnProperty(rule)) {
        let regexpScheme = '\\$\\{\\s*' + rule + '\\s*\\}';
        let regexp = new RegExp(regexpScheme, 'g');
        result = result.replace(regexp, valueForRules[rule]);
      }
    }

    result = result.replace(/\$\$/g, '$');

    return result;
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

  let testText = replaceSpecialSymbolsGIFT(removeEmptyStrings(replaceRules(ttt['testText'])));
  if (testText.length === 0) {
    throw Error('Test task text is empty');
  }

  result['testText'] = testText;

  let generatedAnswerScriptPart = 'let __TYPE_TEST_TASK = ' + ttt['type'] + ';\n';
  for (let rule in ttt['rules']) {
    if (ttt['rules'].hasOwnProperty(rule)) {
      generatedAnswerScriptPart += 'let $' + rule + ' = ' + selectedProductionForRules[rule] + ';\n';
      generatedAnswerScriptPart += 'let $' + rule + '_value = "' + valueForRules[rule].replace(/\n/g, '\\n') + '";\n';
      for (let i=0;i<ttt['rules'][rule].length;++i) {
        generatedAnswerScriptPart += 'let $' + rule + '_' + i + ' = ' + i + ';\n';
      }
    }
  }

  let script = generatedAnswerScriptPart + PREGENERATED_ANSWER_SCRIPT_PART + ttt['answerScript'] + ';\n__END_SCRIPT();';
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

  if (ttt['type'] === SINGLE_CHOOSE_TYPE && answer.length > 1) {
    throw Error('Multiple answer options');
  }

  if (ttt['type'] === INPUT_TYPE) {
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

  return result;
}

module.exports = {
  checkTTT: checkTTT,
  generateTestTaskFromTTT: generateTestTaskFromTTT,
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
        checkTTT(templateTest.arrayTTT[i]);
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
      result.push(generateTestTaskFromTTT(arrayTTT[i]));
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
      if (test[testIndex]['type'] === INPUT_TYPE) {
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
