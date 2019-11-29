const TEST_TASK_TEMPLATE_TYPE = 0;

const fs = require('fs');
const path = require('path');

function parseArguments() {
   let args = process.argv.slice(2);
   let result = {};
   let errorText = "CLI has syntax error";
   for (let i = 0; i < args.length; ++i) {
       switch (args[0]) {
           case '-testTask': {
               if ('type' in result) {
                   throw new Error(errorText);
               }
               result['type'] = TEST_TASK_TEMPLATE_TYPE;
           } break;
           case '-target': {
               if ('target' in result) {
                   throw new Error(errorText);
               }
               result['target'] = args[i];
           } break;
           case '-dstDir': {
               ++i;
               if (i === args.length || 'dstDir' in result) {
                   throw new Error(errorText);
               }
               result['dstDir'] = args[i];
           } break;
           case '-n': {
               ++i;
               if (i === args.length || 'number' in result || isNaN(args[i]) || !Number.isInteger(+args[i]) || +args[i] < 1) {
                   throw new Error(errorText);
               }
               result['number'] = +args[i];
           } break;
           case '-prefixName': {
               ++i;
               if (i === args.length || 'prefixName' in result || !/^[a-zA-Z0-9_]+$/.test(args[i])) {
                   throw new Error(errorText);
               }
               result['prefixName'] = args[i];
           } break;
           default: {
               if (args[0][0] === '-') {
                   throw new Error(errorText);
               }
           }
       }
   }

   if (!('type' in result) || !('prefixName' in result) || !('target' in result)) {
       throw new Error(errorText);
   }
   if (!('number' in result)) {
       result['number'] = 1;
   }

   return result;
}

function run() {
   let settings = parseArguments();
   let folder = '.';

   if ('dstDir' in settings) {
       if (!fs.lstatSync(settings['dstDir']).isDirectory()) {
           throw new Error(`Folder '${settings['dstDir']}' is not exist/folder`);
       }
       if (!fs.lstatSync(settings['target']).isFile()) {
           throw new Error(`Template '${settings['target']}' is not exist/file`);
       }
       folder = settings['dstDir'];
   }

   function getFullName(index) {
       let prefix = path.join(folder, settings['prefixName']);
       let cipherNumber = String(settings['number'] - 1).length;
       let leadingZero = cipherNumber - String(index).length;
       return `${prefix}_${'0'.repeat(leadingZero)}${index}.json`;
   }

   for (let i = 0; i < settings['number']; ++i) {
       switch (settings['type']) {
           case TEST_TASK_TEMPLATE_TYPE: {
               let template = JSON.parse(fs.readFileSync(settings['target']));
               fs.writeFileSync(getFullName(i), translateTestTaskToGIFT(generateTestTaskFromTemplateTestTask(template)));
           } break;
       }
   }
}

try {
   run();
} catch (exception) {
   Console.Error(exception.message);
   process.exit(1);
}