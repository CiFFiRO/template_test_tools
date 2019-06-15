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
