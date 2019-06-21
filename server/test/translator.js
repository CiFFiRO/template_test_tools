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
    const prefixTTTFileName = 'server/test/ttt/ttt_';
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

function run() {
  for (let i=0;i<100;++i) {
    test_positiveTranslator();
  }
}


run();
