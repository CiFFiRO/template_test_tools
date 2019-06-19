const ASSERT = require('chai').assert;
const FS = require('fs');
const translator = require('../translator.js');

function test_positiveTranslator() {
  const prefixTTTFileName = 'server/test/ttt/ttt_';
  const testNumber = 19;
  for (let i = 0; i < testNumber; ++i) {
    let fileName = prefixTTTFileName;
    if (i<10) {
      fileName += '0' + i;
    } else {
      fileName += i;
    }
    fileName += '.json';

    FS.readFile(fileName, (err, data) => {
      if (err) {
        console.error(err);
        return;
      }

      let ttt = JSON.parse(data);
      ASSERT.doesNotThrow(function (){translator.checkTTT(ttt);});
      ASSERT.doesNotThrow(function (){
        //console.log(fileName);
        let tt = translator.generateTestTaskFromTTT(ttt);
        //console.log(tt);
      });
    });
  }
}

function run() {
  for (let i=0;i<1000;++i) {
    test_positiveTranslator();
  }
}


run();
