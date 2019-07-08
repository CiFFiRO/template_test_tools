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
  let url = URL.createObjectURL(new Blob([content], {type: 'text/plain'}));
  a.href = url;
  if (fileName) {
    a.download = fileName;
  }
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
}

function USER_MESSAGE(panelId, message, width, height, callback) {
  let windowId = 'windowId';
  let panel = $('#'+panelId);
  panel.append(
    '<div class="panel panel-default" align="center" id="' + windowId + '" style="' + CENTER_POSITION_STYLE(width, height) + '">' +
    '<div class="panel-body">' +
    '<h3 class="form-signin-heading" align="center">' + message + '</h3>' +
    '</div>');
  setTimeout(()=>{
    $('#'+windowId).remove();
    if (callback) {
      callback();
    }
  }, 2000);
}

function SERVER_DOWN_MESSAGE() {
  let panel = $('#'+panelId);
  panel.empty();
  panel.append('<div class="panel panel-default" align="center" style="' + CENTER_POSITION_STYLE(25, 7) + '">' +
    '<div class="panel-body">' +
    '<h3 class="form-signin-heading" align="center">Сервер не доступен.</h3>' +
    '</div>');
}

function OOOPS_MESSAGE(panelId) {
  USER_MESSAGE(panelId, 'Упс, что-то пошло не так...', 25, 7);
}

function SHOW_DIALOG(panelId, message, width, height, okCallback) {
  let windowId = 'windowId';
  let okButtonId = 'okButtonId';
  let cancelButtonId = 'cancelButtonId';
  let panel = $('#'+panelId);
  panel.append(
    '<div class="panel panel-default" align="center" id="' + windowId + '" style="' + CENTER_POSITION_STYLE(width, height) + '">' +
    '<div class="panel-body">' +
    '<h3 class="form-signin-heading" align="center">' + message + '</h3>' +
    '<div class="btn-group-horizontal btn-group-lg top-buffer-20" role="group" align="center">' +
    '<button type="button" class="btn btn-default" id="' + okButtonId + '">Да</button>' +
    '<button type="button" class="btn btn-default left-buffer-20" id="' + cancelButtonId + '">Отмена</button>' +
    '</div></div></div>');
  $('#'+okButtonId).on('click', () => {
    $('#'+windowId).remove();
    okCallback();
  });
  $('#'+cancelButtonId).on('click', () => {$('#'+windowId).remove();});
}

function CENTER_POSITION_STYLE(width, height) {
  return "top: 50%;left: 50%;" +
    "width:" + width + "em;" +
    "height:" + height + "em;" +
    "margin-top: -" + (height/2) + "em;" +
    "margin-left: -" + (width/2) + "em;" +
    "border: 1px solid #ccc;position:fixed;z-index: 75;";
}

