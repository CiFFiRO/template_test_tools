const IS_CSHARP_INTERPRETER = false;
const FUNCTIONS_RE = 'rInteger\\(\\s*[+-]?[0-9]+\\s*,\\s*[+-]?[0-9]+\\s*\\)|' +
  'rFloat\\(\\s*[-+]?(?:\\d*\\.?\\d+|\\d+\\.?\\d*)(?:[eE][-+]?\\d+)?\\s*,' +
  '\\s*[-+]?(?:\\d*\\.?\\d+|\\d+\\.?\\d*)(?:[eE][-+]?\\d+)?\\s*,\\s*[+]?[1-9]+[0-9]*\\s*\\)|' +
  'rElement\\(\\s*(\\s*[a-zA-Z0-9]+\\s*,)*\\s*[a-zA-Z0-9]+\\s*\\)';
const FUNCTIONS_GRAMMAR_TASK_RE = 'rInteger\\$\\(\\s*[+-]?[0-9]+\\s*,\\s*[+-]?[0-9]+\\s*\\$\\)|' +
  'rFloat\\$\\(\\s*[-+]?(?:\\d*\\$\\.?\\d+|\\d+\\$\\.?\\d*)(?:[eE][-+]?\\d+)?\\s*,' +
  '\\s*[-+]?(?:\\d*\\$\\.?\\d+|\\d+\\$\\.?\\d*)(?:[eE][-+]?\\d+)?\\s*,\\s*[+]?[1-9]+[0-9]*\\s*\\$\\)|' +
  'rElement\\$\\(\\s*(\\s*[a-zA-Z0-9]+\\s*,)*\\s*[a-zA-Z0-9]+\\s*\\$\\)';
const PREGENERATED_ANSWER_SCRIPT_PART = '' +
  'let __FALSE_OPTIONS = [];' +
  'let __ANSWER = -1;' +
  '' +
  'function $$rSubArray(array, length) {\n' +
  '  if (isNaN(+length)) {\n' +
  '    throw new Error(\'$$rSubArray: length is not a number\');\n' +
  '  }\n' +
  '  if (length < 0) {\n' +
  '    throw new Error(\'$$rSubArray: length is bad\');\n' +
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
// TODO: текст исключений переработать, где он слабо осмыслен, и мб на русском его написать.

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function rInteger(min, max) {
  return getRandomInt(min, max + 1);
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
  for (let _ = 0; _ < length; ++_) {
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

  if ((myCharCode > 64 && myCharCode < 91) || (myCharCode > 96 && myCharCode < 123)) {
    return true;
  }

  return false;
}

function isSpace(aChar) {
  let myCharCode = aChar.charCodeAt(0);

  if ((myCharCode > 8 && myCharCode < 14) || myCharCode === 32) {
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
    throw new Error('Argument(s) type(s) is not current');
  }
  if (type < SHORT_ANSWER_TYPE || type > MULTIPLE_CHOOSE_TYPE) {
    throw new Error('Type test task is not current');
  }
  if (!CheckTemplateTestTaskGrammar(grammar)) {
    throw new Error('Grammar has syntax error');
  }

  let rules = {};
  for (let i = 0; i < grammar.length;) {
    let beginNonTerminal = -1;
    while (i < grammar.length && isSpace(grammar[i]))++i;
    if (i === grammar.length) {
      break;
    }
    beginNonTerminal = i;
    while (grammar[i] !== '=')++i;
    let nonTerminal = grammar.substring(beginNonTerminal, i);
    if (nonTerminal in rules) {
      throw new Error(`Redefine non terminal ${nonTerminal}`);
    }
    if (!/^[a-zA-Z]+[a-zA-Z0-9]*$/.test(nonTerminal)) {
      throw new Error(`Name non terminal '${nonTerminal}' is not allowable`);
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
        if (i + 1 === grammar.length || grammar[i + 1] !== '.') {
          let endAlternative = i;
          if (condition && grammar[i - 1] === ']') {
            --endAlternative;
          } else if (condition) {
            condition = false;
            if (rules[nonTerminal].length > 0) {
              rules[nonTerminal][0] = '[' + rules[nonTerminal][0];
            } else {
              rules[nonTerminal].push('[');
              ++i;
              continue;
            }
          }

          if (beginAlternative === endAlternative && condition) {
            throw new Error(`Non terminal ${nonTerminal} has empty alternative with condition construction`);
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
        if (grammar[i + 1] === '$') {
          i += 2;
        } else if (grammar[i + 1] === '{') {
          i += 2;
          while (isSpace(grammar[i]))++i;
          let beginNonTerminalName = i;
          while (!isSpace(grammar[i]) && grammar[i] !== '}')++i;
          let nonTerminalName = grammar.substring(beginNonTerminalName, i);
          ++i;
          if (!(nonTerminalName in rules) || nonTerminalName === nonTerminal) {
            throw new Error(`Use not previously defined non terminal ${nonTerminalName} in the definition ${nonTerminal}`);
          }
        } else if (grammar[i + 1] === '|') {
          i += 2;
        } else {
          while (grammar[i] !== '(')++i;
          ++i;
          while (grammar[i] !== ')')++i;
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

  let result = { title: header, type: type, rules: rules, testText: textTask, feedbackScript: feedbackScript };
  if (IS_CSHARP_INTERPRETER) {
    return JSON.stringify(result);
  }
  return result;
}

function checkTemplateTestTask(templateTestTask) {
  if (IS_CSHARP_INTERPRETER) {
    templateTestTask = JSON.parse(templateTestTask);
  }

  if (!templateTestTask.hasOwnProperty('title') || !templateTestTask.hasOwnProperty('type') || !templateTestTask.hasOwnProperty('rules')
    || !templateTestTask.hasOwnProperty('testText') || !templateTestTask.hasOwnProperty('feedbackScript')) {
    throw new Error('Bad json data');
  }
  if (typeof templateTestTask['type'] !== 'number' ||
    templateTestTask['type'] < SHORT_ANSWER_TYPE || templateTestTask['type'] > MULTIPLE_CHOOSE_TYPE) {
    throw new Error('Bad template test task type');
  }
  let nonTerminals = new Set();
  let nonTerminalsNamesRegExp = '';
  for (let nonTerminal in templateTestTask['rules']) {
    if (templateTestTask['rules'].hasOwnProperty(nonTerminal)) {
      if (!/^[a-zA-Z]+[a-zA-Z0-9]*$/.test(nonTerminal)) {
        throw new Error(`Non terminal name has syntax error - ${nonTerminal}`);
      }
      if (nonTerminals.has(nonTerminal)) {
        throw new Error(`Duplicate non terminal name - ${nonTerminal}`);
      }
      nonTerminals.add(nonTerminal);
      let regexp = new RegExp(`^([^$]|\\$\\$|\\$(${FUNCTIONS_RE})|\\$\\{\\s*(${nonTerminalsNamesRegExp})\\s*\\})*$`);
      for (let i = 0; i < templateTestTask['rules'][nonTerminal].length; ++i) {
        if (!regexp.test(templateTestTask['rules'][nonTerminal][i])) {
          throw new Error(`Non terminal ${nonTerminal} alternative has syntax error`);
        }
      }
      if (nonTerminalsNamesRegExp.length > 0) {
        nonTerminalsNamesRegExp += '|' + nonTerminal;
      } else {
        nonTerminalsNamesRegExp += nonTerminal;
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

function replaceFunctions(production) {
  function nextFunction(production) {
    let i = 0;
    while (i < production.length) {
      if (i + 1 < production.length && production[i] === '$' && production[i + 1] !== '$' && production[i + 1] !== '{') {
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
        throw new Error('rInteger: interval is not exist');
      }

      let value = rInteger(min, max);
      result = result.substring(0, info[0]) + value + result.substring(info[1] + 1);
    } else if (name === 'rFloat') {
      let min = +arguments[0];
      let max = +arguments[1];
      let length = +arguments[2];
      if (min > max) {
        throw new Error('rFloat: interval is not exist');
      }

      let value = rFloat(min, max, length);
      result = result.substring(0, info[0]) + value + result.substring(info[1] + 1);
    } else if (name === 'rElement') {
      // TODO: протестить на работоспособность
      if (arguments.length === 0) {
        throw new Error('rElement: does not have arguments');
      }

      let value = arguments[getRandomInt(0, arguments.length)];
      result = result.substring(0, info[0]) + value + result.substring(info[1] + 1);
    } else {
      throw new Error('Function ' + name + ' is not exist');
    }
  }

  return result;
}

function generateTestTaskFromTemplateTestTask(templateTestTask) {
  if (IS_CSHARP_INTERPRETER) {
    templateTestTask = JSON.parse(templateTestTask);
  }

  let result = {};
  result['type'] = templateTestTask['type'];


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
    for (let i = 0; i < specialCharacters.length; ++i) {
      let regexp = new RegExp(specialCharacters[i], 'g');
      result = result.replace(regexp, '\\' + specialCharacters[i]);
    }

    return result;
  }

  let testText = replaceSpecialSymbolsGIFT(removeEmptyStrings(replaceNonTerminals(templateTestTask['testText'])));
  if (testText.length === 0) {
    throw new Error('Test task text is empty');
  }

  result['testText'] = testText;

  let generatedFeedbackScriptPart = 'let __TYPE_TEST_TASK = ' + templateTestTask['type'] + ';\n';
  for (let rule in templateTestTask['rules']) {
    if (templateTestTask['rules'].hasOwnProperty(rule)) {
      generatedFeedbackScriptPart += 'let $' + rule + ' = ' + alternativeIndexForNonTerminals[rule] + ';\n';
      generatedFeedbackScriptPart += 'let $' + rule + '_value = "' + alternativeForNonTerminals[rule].replace(/\n/g, '\\n') + '";\n';
      for (let i = 0; i < templateTestTask['rules'][rule].length; ++i) {
        generatedFeedbackScriptPart += 'let $' + rule + '_' + i + ' = ' + i + ';\n';
      }
    }
  }

  let script = generatedFeedbackScriptPart + PREGENERATED_ANSWER_SCRIPT_PART + templateTestTask['feedbackScript'] + ';\n__END_SCRIPT();';
  let value = null;
  try {
    value = eval(script);
  } catch (error) {
    throw new Error('Answer script error: ' + error.message);
  }

  let answer = value[0];
  let falseOptions = value[1];

  if (typeof answer !== 'object') {
    throw new Error('Answer does not initialized');
  }
  if (answer.length < 1) {
    throw new Error('Wrong true answers number');
  }

  answer.forEach(function (elem) {
    let type = typeof elem;
    if (type !== 'string' && type !== 'number') {
      throw new Error('Wrong true option type');
    }
  });
  falseOptions.forEach(function (elem) {
    let type = typeof elem;
    if (type !== 'string' && type !== 'number') {
      throw new Error('Wrong false option type');
    }
  });

  if (templateTestTask['type'] === SINGLE_CHOOSE_TYPE && answer.length > 1) {
    throw new Error('Multiple answer options');
  }

  if (templateTestTask['type'] === SHORT_ANSWER_TYPE) {
    result['answers'] = answer;
  } else {
    result['trueOptions'] = answer;

    for (let i = 0; i < answer.length; ++i) {
      if (falseOptions.indexOf(answer[i]) !== -1) {
        throw new Error('False options contain true option');
      }
    }

    result['falseOptions'] = falseOptions;
  }

  if (IS_CSHARP_INTERPRETER) {
    return JSON.stringify(result);
  }
  return result;
}

function translateTestTaskToGIFT(testTask) {
  if (IS_CSHARP_INTERPRETER) {
    testTask = JSON.parse(testTask);
  }

  function getOptions(trueOptions, falseOptions) {
    let result = [];
    for (let i = 0; i < trueOptions.length; ++i) {
      result.push([true, trueOptions[i]]);
    }
    for (let i = 0; i < falseOptions.length; ++i) {
      result.push([false, falseOptions[i]]);
    }

    return rSubArray(result, result.length);
  }
  let date = new Date(Date.now());
  let preamble = '// generated date: ' + date.toString();
  let result = `${preamble}\n\n\n${testTask['testText']}{\n`;
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
  if (IS_CSHARP_INTERPRETER) {
    template = JSON.parse(template);
  }

  let result = {
    header: template['title'], type: template['type'], grammar: '',
    testText: template['testText'], feedbackScript: template['feedbackScript']
  };

  function replaceDots(alternative) {
    let result = '';
    let beginIndex = 0;
    for (let i = 0; i < alternative.length; ++i) {
      if (alternative[i] === '$' && i + 1 < alternative.length) {
        if (alternative[i + 1] === '$') {
          ++i;
        } else if (alternative[i + 1] !== '{' && alternative[i + 1] !== '$') {
          ++i;
          while (alternative[i] !== ')')++i;
        }
      } else if (alternative[i] === '.') {
        result += alternative.substring(beginIndex, i + 1) + '.';
        beginIndex = i + 1;
      }
    }
    if (beginIndex < alternative.length) {
      result += alternative.substring(beginIndex);
    }

    return result;
  }

  for (let nonTerminal in template['rules']) {
    if (template['rules'].hasOwnProperty(nonTerminal)) {
      let expression = nonTerminal + '=';
      let condition = false;
      if (template['rules'][nonTerminal][template['rules'][nonTerminal].length - 1].length === 0) {
        condition = true;
        expression += '[';
      }

      for (let i = 0; i < template['rules'][nonTerminal].length; ++i) {
        if (condition && i + 1 === template['rules'][nonTerminal].length) {
          break;
        }
        let alternative = template['rules'][nonTerminal][i];
        alternative = replaceDots(alternative);
        alternative = alternative.replace(/\|/g, '$|');
        expression += alternative;
        if ((condition && i + 1 < template['rules'][nonTerminal].length - 1) ||
          (!condition && i + 1 < template['rules'][nonTerminal].length)) {
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

  if (IS_CSHARP_INTERPRETER) {
    return JSON.stringify(result);
  }
  return result;
}

function checkTemplateTest(templateTest) {
  if (IS_CSHARP_INTERPRETER) {
    templateTest = JSON.parse(templateTest);
  }

  if (!templateTest.hasOwnProperty('orderType') || !templateTest.hasOwnProperty('arrayTemplateTestTask') ||
    !templateTest.hasOwnProperty('title')) {
    return false;
  }
  if (typeof templateTest.orderType !== 'number' || typeof templateTest.arrayTemplateTestTask !== 'object'
    || typeof templateTest.title !== 'string') {
    return false;
  }
  if (templateTest.orderType > RANDOM_ORDER_TYPE || templateTest.orderType < STRONG_ORDER_TYPE) {
    return false;
  }

  for (let i = 0; i < templateTest.arrayTemplateTestTask.length; ++i) {
    try {
      checkTemplateTestTask(templateTest.arrayTemplateTestTask[i]);
    } catch (error) {
      return false;
    }
  }

  return true;
}

function generateTestFromTemplateTest(templateTest) {
  if (IS_CSHARP_INTERPRETER) {
    templateTest = JSON.parse(templateTest);
  }

  let result = [];
  let arrayTemplateTestTask = templateTest.arrayTemplateTestTask.slice(0);

  if (templateTest.orderType === RANDOM_ORDER_TYPE) {
    arrayTemplateTestTask = rSubArray(arrayTemplateTestTask, arrayTemplateTestTask.length);
  }

  for (let i = 0; i < arrayTemplateTestTask.length; ++i) {
    let testTask = generateTestTaskFromTemplateTestTask(arrayTemplateTestTask[i]);
    if (IS_CSHARP_INTERPRETER) {
      testTask = JSON.parse(testTask);
    }
    result.push(testTask);
  }

  if (IS_CSHARP_INTERPRETER) {
    return JSON.stringify(result);
  }

  return result;
}

function translateTestToGIFT(test) {
  if (IS_CSHARP_INTERPRETER) {
    test = JSON.parse(test);
  }

  let date = new Date(Date.now());
  let preamble = '// generated date: ' + date.toString();
  let space = '//--------------------------------------------------';
  let result = preamble + '\n\n\n';

  function getOptions(trueOptions, falseOptions) {
    let result = [];
    for (let i = 0; i < trueOptions.length; ++i) {
      result.push([true, trueOptions[i]]);
    }
    for (let i = 0; i < falseOptions.length; ++i) {
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

function templateTestFormToTemplate(header, type, templates) {
  if (IS_CSHARP_INTERPRETER) {
    templates = JSON.parse(templates);
  }

  if (typeof header !== 'string' || typeof templates !== 'object' || typeof type !== 'number') {
    throw new Error('Argument(s) type(s) is not current');
  }
  if (type < STRONG_ORDER_TYPE || type > RANDOM_ORDER_TYPE) {
    throw new Error('Type test task is not current');
  }

  let result = { title: header, orderType: type, arrayTemplateTestTask: templates };

  if (IS_CSHARP_INTERPRETER) {
    return JSON.stringify(result);
  }

  return result;
}

function templateTaskFormToTemplate(header, grammar, textTask) {
  let result = {header:header, grammar:grammar, textTask:textTask};

  if (IS_CSHARP_INTERPRETER) {
    return JSON.stringify(result);
  }

  return result;
}

function mapFromEBNF(grammar) {
  grammar = grammar.replace(/\$\|/g, '${_condition}');
  grammar = grammar.replace(/\$\(/g, '${_parenthesisOpen}');
  grammar = grammar.replace(/\$\)/g, '${_parenthesisClose}');
  grammar = grammar.replace(/\$\[/g, '${_squareBracketOpen}');
  grammar = grammar.replace(/\$]/g, '${_squareBracketClose}');
  grammar = grammar.replace(/\$\./g, '${_end}');
  grammar = grammar.replace(/\$=/g, '${_assignment}');
  grammar = grammar.replace(/"/g, '\\"');

  grammar = grammar.replace(/]\|\[/g, '], [');
  grammar = grammar.replace(/\)\|\(/g, '), (');
  grammar = grammar.replace(/]\|\(/g, '], (');
  grammar = grammar.replace(/\)\|\[/g, '), [');
  grammar = grammar.replace(/\)\|/g, '), "');
  grammar = grammar.replace(/]\|/g, '], "');
  grammar = grammar.replace(/\|\(/g, '", (');
  grammar = grammar.replace(/\|\[/g, '", [');

  grammar = grammar.replace(/\|/g, '", "');
  grammar = grammar.trim();

  if (grammar.length === 0) {
    return {};
  }

  let index = 0;
  function translateOpenBrackets(nextBracket, nextOther) {
    if (index+1 === grammar.length) {
      throw new Error('Grammar has error');
    }
    if (grammar[index+1] === ')' || grammar[index+1] === ']' || grammar[index+1] === '.' || grammar[index+1] === '=') {
      throw new Error('Grammar has error');
    }
    if (grammar[index+1] === '(' || grammar[index+1] === '[') {
      grammar = grammar.substring(0, index) + nextBracket + grammar.substring(index+1);
      index += nextBracket.length;
    } else {
      grammar = grammar.substring(0, index) + nextOther + grammar.substring(index+1);
      index += nextOther.length;
    }
  }
  function translateCloseBrackets() {
    if (index+1 === grammar.length) {
      throw new Error('Grammar has error');
    }
    if (grammar[index+1] === '(' || grammar[index+1] === '[' || grammar[index+1] === '=') {
      throw new Error('Grammar has error');
    }

    if (grammar[index-1] !== ')' && grammar[index-1] !== ']') {
      grammar = grammar.substring(0, index) + '"]' + grammar.substring(index + 1);
      index += 2;
    } else {
      grammar = grammar.substring(0, index) + ']' + grammar.substring(index + 1);
      ++index;
    }
  }
  let isMayBeNonTerminal = true;
  while (index < grammar.length) {
    if (grammar[index] === '(') {
      translateOpenBrackets('[', '["');
    } else if (grammar[index] === '[') {
      translateOpenBrackets('["", ', '["", "');
    } else if (grammar[index] === ')' || grammar[index] === ']') { //
      translateCloseBrackets();
    } else if (index > 0 && grammar[index-1] === '=') {
      grammar = grammar.substring(0, index) + '"' + grammar.substring(index);
      ++index;
      isMayBeNonTerminal = false;
    } else if (index-1 > 0 && grammar[index] === '.' && grammar[index-1] !== ']' && grammar[index-1] !== ')') {
      grammar = grammar.substring(0, index) + '"' + grammar.substring(index);
      isMayBeNonTerminal = true;
      index += 2;
    } else if (grammar[index] === '.') {
      isMayBeNonTerminal = true;
      ++index;
    } else if (isMayBeNonTerminal && isSpace(grammar[index]) && grammar[index] !== ' ') {
      grammar = grammar.substring(0, index) + grammar.substring(index+1);
    } else {
      ++index;
    }
  }

  grammar = grammar.replace(/=/g, '": [');
  grammar = grammar.replace(/\./g, '], "');// !

  grammar = grammar.replace(/\${_condition}/g, '|');
  grammar = grammar.replace(/\${_parenthesisOpen}/g, '(');
  grammar = grammar.replace(/\${_parenthesisClose}/g, ')');
  grammar = grammar.replace(/\${_squareBracketOpen}/g, '[');
  grammar = grammar.replace(/\${_squareBracketClose}/g, ']');
  grammar = grammar.replace(/\${_end}/g, '.');
  grammar = grammar.replace(/\${_assignment}/g, '=');

  grammar = grammar.trim();
  grammar = '"' + grammar;
  if (grammar.length > 3) {
    grammar = grammar.substring(0, grammar.length-3);
  }
  grammar = `{${grammar}}`;

  let rawMap = {};
  try {
    rawMap = JSON.parse(grammar);
  } catch (exception) {
    throw new Error('Grammar has error');
  }

  let mapGenerate = {};
  for (let nonTerminal in rawMap) {
    if (rawMap.hasOwnProperty(nonTerminal)) {
      let newNonTerminal = nonTerminal.trim();
      if (!/^[a-zA-Z]+[0-9a-zA-Z]*$/.test(newNonTerminal)) {
        throw new Error(`Non terminal ${newNonTerminal} has syntax error`);
      }
      if (newNonTerminal in mapGenerate) {
        throw new Error(`Non terminal ${newNonTerminal} has redefinition`);
      }
      if (rawMap[nonTerminal].length === 1 && typeof rawMap[nonTerminal][0] === 'string'
        && rawMap[nonTerminal][0].length === 0) {
        throw new Error(`Non terminal ${newNonTerminal} has only one alternative and she's empty`);
      }
      mapGenerate[newNonTerminal] = rawMap[nonTerminal];
    }
  }

  return mapGenerate;
}

function checkTemplateTask(template) {
  if (IS_CSHARP_INTERPRETER) {
    template = JSON.parse(template);
  }

  if (!template.hasOwnProperty('header') || !template.hasOwnProperty('grammar')
    || !template.hasOwnProperty('textTask')) {
    throw new Error('Bad json data');
  }
  if (typeof template['header'] !== 'string' || typeof template['grammar'] !== 'string'
    || typeof template['textTask'] !== 'string') {
    throw new Error('Bad template property types');
  }

  let mapGenerate = mapFromEBNF(template['grammar']);

  let nonTerminals = new Set();
  let nonTerminalsNamesRegExp = '';
  for (let nonTerminal in mapGenerate) {
    if (mapGenerate.hasOwnProperty(nonTerminal)) {
      if (!/^[a-zA-Z]+[a-zA-Z0-9]*$/.test(nonTerminal)) {
        throw new Error(`Non terminal name has syntax error - ${nonTerminal}`);
      }
      if (nonTerminals.has(nonTerminal)) {
        throw new Error(`Duplicate non terminal name - ${nonTerminal}`);
      }

      nonTerminals.add(nonTerminal);
      let regexp = new RegExp(`^([^$]|\\$\\$|\\$(${FUNCTIONS_RE})|\\$\\{\\s*(${nonTerminalsNamesRegExp})\\s*\\})*$`);
      function checkAlternatives(content) {
        if (typeof content === 'string') {
          if (!regexp.test(content)) {
            throw new Error(`Non terminal ${nonTerminal} alternative has syntax error`);
          }
        } else {
          let numberEmptyAlternatives = 0;
          for (let i=0;i<content.length;++i) {
            if (typeof content[i] === 'string' && content[i].length === 0) {
              ++numberEmptyAlternatives;
            }
            checkAlternatives(content[i]);
          }
          if (numberEmptyAlternatives > 1) {
            throw new Error(`Non terminal ${nonTerminal} has more then one empty alternative`);
          }
        }
      }

      checkAlternatives(mapGenerate[nonTerminal]);
      if (nonTerminalsNamesRegExp.length > 0) {
        nonTerminalsNamesRegExp += '|' + nonTerminal;
      } else {
        nonTerminalsNamesRegExp += nonTerminal;
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
  if (!checkRegExp.test(template['textTask'])) {
    throw new Error('Test text has syntax error')
  }
}

function generateTaskFromTemplateTask(template) {
  if (IS_CSHARP_INTERPRETER) {
    template = JSON.parse(template);
  }

  let nonTerminalToTerminal = {};
  let mapGenerate = mapFromEBNF(template['grammar']);
  function generateAlternative(content) {
    if (typeof content === 'string') {
      return content;
    }

    let index = getRandomInt(0, content.length);
    return generateAlternative(content[index]);
  }
  function replaceNonTerminals(text) {
    let result = text;
    for (let nonTerminal in nonTerminalToTerminal) {
      if (nonTerminalToTerminal.hasOwnProperty(nonTerminal)) {
        let regexpScheme = '\\$\\{\\s*' + nonTerminal + '\\s*\\}';
        let regexp = new RegExp(regexpScheme, 'g');
        result = result.replace(regexp, nonTerminalToTerminal[nonTerminal]);
      }
    }

    result = result.replace(/\$\$/g, '$');

    return result;
  }

  for (let nonTerminal in mapGenerate) {
    if (mapGenerate.hasOwnProperty(nonTerminal)) {
      let alternative = generateAlternative(mapGenerate[nonTerminal]);
      nonTerminalToTerminal[nonTerminal] = replaceFunctions(replaceNonTerminals(alternative));
    }
  }

  let result = {task: template['textTask']};
  for (let nonTerminal in nonTerminalToTerminal) {
    if (nonTerminalToTerminal.hasOwnProperty(nonTerminal)) {
      let regexpScheme = '\\$\\{\\s*' + nonTerminal + '\\s*\\}';
      let regexp = new RegExp(regexpScheme, 'g');
      result.task = result.task.replace(regexp, nonTerminalToTerminal[nonTerminal]);
    }
  }

  if (IS_CSHARP_INTERPRETER) {
    return JSON.stringify(result);
  }

  return result;
}

function translateTaskToTXT(task) {
  if (IS_CSHARP_INTERPRETER) {
    task = JSON.parse(task);
  }

  let result = '';
  result += task.task;

  return result;
}

function templateGroupTaskFormToTemplate(header, type, templates) {
  if (IS_CSHARP_INTERPRETER) {
    templates = JSON.parse(templates);
  }

  if (typeof header !== 'string' || typeof templates !== 'object' || typeof type !== 'number') {
    throw new Error('Argument(s) type(s) is not current');
  }
  if (type < STRONG_ORDER_TYPE || type > RANDOM_ORDER_TYPE) {
    throw new Error('Type test task is not current');
  }

  let result = { title: header, orderType: type, arrayTemplateTask: templates };

  if (IS_CSHARP_INTERPRETER) {
    return JSON.stringify(result);
  }

  return result;
}

function checkTemplateGroupTask(template) {
  if (IS_CSHARP_INTERPRETER) {
    template = JSON.parse(template);
  }

  if (!template.hasOwnProperty('orderType') || !template.hasOwnProperty('arrayTemplateTask') ||
    !template.hasOwnProperty('title')) {
    return false;
  }
  if (typeof template.orderType !== 'number' || typeof template.arrayTemplateTask !== 'object'
    || typeof template.title !== 'string') {
    return false;
  }
  if (template.orderType > RANDOM_ORDER_TYPE || template.orderType < STRONG_ORDER_TYPE) {
    return false;
  }

  for (let i = 0; i < template.arrayTemplateTask.length; ++i) {
    try {
      checkTemplateTask(template.arrayTemplateTask[i]);
    } catch (error) {
      return false;
    }
  }

  return true;
}

function generateGroupTaskFromTemplateGroupTask(template) {
  if (IS_CSHARP_INTERPRETER) {
    template = JSON.parse(template);
  }

  let result = [];
  let arrayTemplateTask = template.arrayTemplateTask.slice(0);

  if (template.orderType === RANDOM_ORDER_TYPE) {
    arrayTemplateTask = rSubArray(arrayTemplateTask, arrayTemplateTask.length);
  }

  for (let i = 0; i < arrayTemplateTask.length; ++i) {
    let task = generateTaskFromTemplateTask(arrayTemplateTask[i]);
    if (IS_CSHARP_INTERPRETER) {
      task = JSON.parse(task);
    }
    result.push(task);
  }

  if (IS_CSHARP_INTERPRETER) {
    return JSON.stringify(result);
  }

  return result;
}

function translateGroupTaskToTXT(groupTask) {
  let date = new Date(Date.now());
  let preamble = '// generated date: ' + date.toString();
  let space = '//--------------------------------------------------';
  let result = preamble + '\n\n\n';

  for (let i=0;i<groupTask.length;++i) {
    result += groupTask[i].task + '\n\n';
    result += space + '\n\n';
  }

  return result;
}

module.exports = {
  templateTestTaskFormToTemplate: templateTestTaskFormToTemplate,
  translateTemplateTestTaskToForm: translateTemplateTestTaskToForm,
  checkTemplateTestTask: checkTemplateTestTask,
  generateTestTaskFromTemplateTestTask: generateTestTaskFromTemplateTestTask,
  translateTestTaskToGIFT: translateTestTaskToGIFT,
  checkTemplateTest: checkTemplateTest,
  generateTestFormTemplateTest: generateTestFromTemplateTest,
  translateTestToGIFT: translateTestToGIFT,
  checkTemplateTask: checkTemplateTask,
  generateTaskFromTemplateTask: generateTaskFromTemplateTask,
  translateTaskToTXT: translateTaskToTXT,
  checkTemplateGroupTask: checkTemplateGroupTask,
  generateGroupTaskFromTemplateGroupTask: generateGroupTaskFromTemplateGroupTask,
  translateGroupTaskToTXT: translateGroupTaskToTXT
};
