const ASSERT = require('chai').assert;
const FS = require('fs');
const translator = require('../translator.js');

function test_positiveTranslator() {
  function TTT2T(fileNames) {
    let result = [];
    for (let i=0;i<fileNames.length;++i) {
      let data = FS.readFileSync(fileNames[i]);
      let ttt = JSON.parse(data);
      ASSERT.doesNotThrow(function () {
        translator.checkTTT(ttt);
      });
      ASSERT.doesNotThrow(function () {
        //console.log(fileName);
        let tt = translator.generateTestTaskFromTTT(ttt);
        result.push(tt);
        //console.log(tt);
      });
    }

    return result;
  }

  function getTT(beginIndex, endIndex) {
    const prefixTTTFileName = 'tools/translator/test/ttt/ttt_';
    let tt = [];
    for (let i = beginIndex; i < endIndex; ++i) {
      let fileName = prefixTTTFileName;
      if (i<10) {
        fileName += '0' + i;
      } else {
        fileName += i;
      }
      fileName += '.json';

      tt.push(fileName);
    }

    return tt;
  }

  ASSERT.doesNotThrow(function (){
    let tt = translator.translateTestToGIFT(TTT2T(getTT(1, 11)));
    //console.log(tt);
    tt = translator.translateTestToGIFT(TTT2T(getTT(11, 19)));
    //console.log(tt);
  });
}

function test_positiveTemplateTestTaskGrammarTranslation() {
  let testCases = [
    ['a=asd.',
      {a:['asd']}],
    ['a=asd|zxc$|.\n\nb=[1|2|2+${a}]].',
      {a:['asd', 'zxc|'], b:['1','2','2+${a}]','']}],
    ['a=$|$${b}|qwe$|. b=${a}zxc|${a}qwe. c=[${b}${a}].',
      {a:['|$${b}', 'qwe|'], b:['${a}zxc', '${a}qwe'], c:['${b}${a}', '']}],
    ['a=[123|3.b=3]|4].',
      {a:['[123', '3'], b:['3]', '4]']}],
    ['a=[$|$rInteger(5,123)|$|$rFloat(1,4.2,3).b=2+${a}|2-${a}.',
      {a:['[|$rInteger(5,123)', '|$rFloat(1,4.2,3)'], b:['2+${a}', '2-${a}']}],
    ['a=..$||$|...b=[..${a}....].',
      {a:['.|', '|.'], b:['.${a}..', '']}],
    ['                ', {}]
  ];

  for (let i=0;i<testCases.length;++i) {
    ASSERT.doesNotThrow(function (){
      let template = translator.templateTestTaskFormToTemplate('', 0, testCases[i][0], '' ,'');
      ASSERT.deepEqual(template['rules'], testCases[i][1], `In grammar ${testCases[i][0]} map ${
        JSON.stringify(template['rules'])} is not equal ${JSON.stringify(testCases[i][1])}`);
      translator.checkTemplateTest(template);
    });
  }
}

function test_negativeTemplateTestTaskGrammarTranslation() {
  let testCases = [
    'a=asd', 'aasd.', 'a=asd|zxc|.\n\nb=[1|2|2+${a}]].', 'a=asd||zxc$|.\n\nb=[1|2|2+${a}]].',
    'a=asd|zxc$|.\n\nb=[1|2|2+${b}]].', 'a=asd|zxc$|.\n\nb=[1|2|2+${a}]]', 'a=asd|zxc$|.\n\nb=[1|2|2+${a}]]..',
    'a=asd|zxc$|.\n\nb=[1|2|2+${a}]]', 'a=asd|zxc$|\n\nb=[1|2|2+${a}]].',
    'a=$|${b}|qwe$|. b=${a}zxc|${a}qwe. c=[${b}${a}].',
    'a=[$|$rInteger(5,123)|$|$rFloat(1,4.2,3).b=2+${a}|2-${b}.',
    'a=..$||$|..b=[..${a}....].',
    '     .      ', 'a = 123 .', 'a=.', 'asd.', 'as'];

  for (let i=0;i<testCases.length;++i) {
    ASSERT.throws(function (){
      let template = translator.templateTestTaskFormToTemplate('', 0, testCases[i], '' ,'');
      console.log(testCases[i]);
      console.log(JSON.stringify(template['rules']));
    });
  }
}

function run() {
  test_positiveTemplateTestTaskGrammarTranslation();
  test_negativeTemplateTestTaskGrammarTranslation();
  // for (let i=0;i<100;++i) {
  //   test_positiveTranslator();
  // }
}


run();
