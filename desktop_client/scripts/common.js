function DEBUG(error) {
  if (window.debugStatus) {
    console.error(error.message);
  }
}

function LOG(message) {
  console.log(message);
}

function READ_SINGLE_FILE() {
  const { dialog } = require('electron').remote;
  const fs = require('fs');
  let fileName = dialog.showOpenDialog({
    filters: [
      { name: 'ШТЗ', extensions: ['json'] }
    ]
  });

  if (fileName === undefined || fileName.length !== 1) {
    return undefined;
  }

  return {name: fileName[0], data: fs.readFileSync(fileName[0])};
}

function READ_MULTIPLE_FILES() {
  const { dialog } = require('electron').remote;
  const fs = require('fs');
  let fileNames = dialog.showOpenDialog({
    filters: [
      { name: 'ШТЗ', extensions: ['json'] }
    ],
    properties: ['multiSelections']
  });

  if (fileNames === undefined) {
    return [];
  }

  let result = [];
  for (let i=0;i<fileNames.length;++i) {
    result.push({
      name: fileNames[i],
      data: fs.readFileSync(fileNames[i])
    });
  }

  return result;
}

