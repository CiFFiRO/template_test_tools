const ASSERT = require('chai').assert;
const FS = require('fs');
const translator = require('../translator.js');

function test_positiveTranslator() {
  const prefixTTTFileName = 'server/test/ttt/ttt_';
  const testNumber = 1;
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
      ASSERT.doesNotThrow(function (){translator.generateTestTaskFromTTT(ttt);});
    });
  }
}

function run() {
  test_positiveTranslator();
}


run();
