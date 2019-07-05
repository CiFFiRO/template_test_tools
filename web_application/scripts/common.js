function DEBUG(error) {
  if (window.debugStatus) {
    console.error(error.message);
  }
}

function LOG(message) {
  console.log(message);
}

function LOAD_FILE(callback) {
  let readFile = function (e) {
    let file = e.target.files[0];
    if (!file) {
      return;
    }
    let reader = new FileReader();
    reader.onload = function(e) {
      let contents = e.target.result;// содержимое
      callback(contents);
    };
    reader.readAsText(file);
  };
  let fileInput = document.createElement("input");
  fileInput.type = 'file';
  fileInput.click();
  fileInput.addEventListener('change', readFile, false);
}

function LOAD_FILES(callback) {
  let readFiles = (e) => {
    for (let i=0;i<e.target.files.length;++i) {
      let reader = new FileReader();
      reader.onload = (e) => {
        callback(e.target.result);
      };
      let file = e.target.files[i];
      if (!file) {
        return;
      }
      reader.readAsText(file);
    }
  };
  let fileInput = document.createElement("input");
  fileInput.type = 'file';
  fileInput.multiple = true;
  fileInput.click();
  fileInput.addEventListener('change', readFiles, false);
}

function SAVE_FILE(content, fileName) {
  let a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], {type: 'text/plain'}));
  if (fileName) {
    a.download = fileName;
  }
  a.click();
}
