class EditorTemplateAggregate {
  constructor(uploadUrl, updateUrl, downloadTemplateUrl, viewListTemplatesUrl, dataToTemplate, templateToData) {
    this.listTemplates = null;
    this.template = null;
    this.cloudTemplateId = null;

    this.uploadUrl = uploadUrl;
    this.updateUrl = updateUrl;
    this.downloadTemplateUrl = downloadTemplateUrl;
    this.viewListTemplatesUrl = viewListTemplatesUrl;

    this.dataToTemplate = dataToTemplate;
    this.templateToData = templateToData;
  }

  initialize(tagId, panelId, data, templateId) {
    let tag = $(`#${tagId}`);
    let panel = $(`#${panelId}`);

    this.template = (data === undefined) ? {title: '', orderType: 0, arrayTemplates: []} : this.dataToTemplate(data);
    this.cloudTemplateId = (templateId === undefined) ? null : templateId;

    let inputTitleId = 'inputTitleId';
    let selectOrderTypeId = 'selectOrderTypeId';
    let addTemplateButtonId = 'addTemplateButtonId';
    let editListTemplateId = 'editListTemplateId';
    let downloadButtonId = 'downloadButtonId';
    let uploadButtonId = 'uploadButtonId';
    let listTemplatesId = 'listTemplatesId';

    tag.append(`<div class="container-fluid">
      <div class="row">
      <div class="col-md-6">
      <h3 class="form-signin-heading" align="left">Тема шаблона</h3>
      <div class="input-group"><input id="${inputTitleId}" type="text" class="form-control" placeholder="Тема" style="width:35em"></div>
      </div>
      <div class="col-md-6">
      <h3 class="form-signin-heading" align="left">Порядок шаблонов</h3>
      <select title="Порядок" class="selectpicker" id="${selectOrderTypeId}" >
      <option value="0">Строго последовательный</option>
      <option value="1">Случайный</option>
      </select></div>
      </div>
      <div class="row">
      <div class="col-md-12">
      <h3>Последовательность шаблонов</h3>
      <div id="${listTemplatesId}" class="container-fluid"></div>
      <button id="${addTemplateButtonId}" type="button" class="btn btn-success">Добавить шаблон</button>
      </div></div>
      <div class="row" id="${editListTemplateId}">
      </div>
      <div class="btn-group-horizontal top-buffer-20 bottom-buffer btn-group-lg" role="group" align="center">
      <button type="button" id="${downloadButtonId}" class="btn btn-info"><span class="glyphicon glyphicon-download" aria-hidden="true"></span> Скачать</button>
      <button type="button" id="${uploadButtonId}" class="btn btn-primary left-buffer-30"><span class="glyphicon glyphicon-upload" aria-hidden="true"></span> Загрузить</button>
      </div></div>`);
    $('select').selectpicker();

    let inputTitle = $('#'+inputTitleId);
    inputTitle.on('input change', () => {
      this.template.title = inputTitle.val();
    });
    let selectTag = $('#'+selectOrderTypeId);
    selectTag.on('input change', () => {
      this.template.orderType = +selectTag.val();
    });
    this.listTemplates = $('#'+listTemplatesId);

    $('#'+addTemplateButtonId).on('click', () => {
      let listChoiceId = 'listChoiceId';
      let windowChoiceId = 'windowChoiceId';
      let prevButtonId = 'prevButtonId';
      let closeButtonId = 'closeButtonId';
      let nextButtonId = 'nextButtonId';

      panel.append('<div class="panel panel-default" align="center" style="' + CENTER_POSITION_STYLE(60, 30) + 'overflow:auto;" id="' + windowChoiceId + '">' +
        '<div class="container-fluid" id="' + listChoiceId + '">' +
        '</div>'+
        '<div class="btn-group-horizontal top-buffer-20 bottom-buffer" role="group" >' +
        '<button type="button" class="btn btn-default" id="' + prevButtonId + '"><span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span></button>' +
        '<button type="button" class="btn btn-default left-buffer-20" id="' + closeButtonId + '">Закрыть</button>' +
        '<button type="button" class="btn btn-default left-buffer-20" id="' + nextButtonId + '"><span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span></button>' +
        '</div></div>');

      let list = $('#'+listChoiceId);
      let pageId = 0;

      let updatePageList = (answer) => {
        list.empty();
        for (let i=0;i<answer.list.length;++i) {
          let buttonAddId = 'buttonAddId_'+i;
          list.append('<div class="row">' +
            '<div class="col-md-8"><h3 class="form-signin-heading" align="left"><span class="left-buffer-20 label label-default">' + answer.list[i].title + '</span></h3></div>' +
            '<div class="col-md-4">' +
            '<button id="' + buttonAddId + '" type="button" class="btn btn-success top-buffer-20"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button>' +
            '</div>' +
            '</div><hr class="divider">');
          $('#'+buttonAddId).on('click', () => {
            $.post(this.downloadTemplateUrl, {templateId: answer.list[i].id})
              .done(answer => {
                if (answer.ok) {
                  this.template.arrayTemplates.push(answer.template);
                  this.updateListTemplates();
                } else {
                  OOOPS_MESSAGE(panelId);
                }
              })
              .fail(() => {SERVER_DOWN_MESSAGE(panelId);});
          });
        }
      };

      let viewList = () => {
        $.post(this.viewListTemplatesUrl, {pageId:pageId})
          .done(answer => {
            if (answer.ok) {
              if (answer.list.length !== 0) {
                updatePageList(answer);
              } else {
                if (pageId === 0) {
                  list.empty();
                  list.append('<h3 class="form-signin-heading" align="center">У Вас нет загруженных шаблонов.</h3>');
                } else {
                  --pageId;
                  USER_MESSAGE(panelId, 'Это последняя страница.', 25, 7);
                }
              }
            } else {
              OOOPS_MESSAGE(panelId);
            }
          })
          .fail(() => {
            SERVER_DOWN_MESSAGE(panelId);
          });
      };

      viewList();

      $('#'+prevButtonId).on('click', () => {
        if (pageId === 0) {
          USER_MESSAGE(panelId, 'Это первая страница.', 25, 7);
          return;
        }
        --pageId;
        viewList();
      });
      $('#'+closeButtonId).on('click', () => {
        $('#'+windowChoiceId).remove();
      });
      $('#'+nextButtonId).on('click', () => {
        ++pageId;
        viewList();
      });
    });

    $('#'+downloadButtonId).on('click', () => {
      SAVE_FILE(JSON.stringify(this.template), 'template.json');
    });
    $('#'+uploadButtonId).on('click', () => {
      if (this.cloudTemplateId === null) {
        $.post(this.uploadUrl, {template: JSON.stringify(this.templateToData(this.template))})
          .done(answer => {
            if (answer.ok) {
              this.cloudTemplateId = answer.templateId;
              USER_MESSAGE(panelId, 'Шаблон загружен.', 20, 7);
            } else {
              USER_MESSAGE(panelId, 'Шаблон синтаксически не корректен.', 30, 7);
            }
          })
          .fail(() => {
            SERVER_DOWN_MESSAGE(panelId);
          });
      } else {
        $.post(this.updateUrl, {template: JSON.stringify(this.templateToData(this.template)), templateId: this.cloudTemplateId})
          .done(answer => {
            if (!answer.ok) {
              USER_MESSAGE(panelId, 'Шаблон синтаксически не корректен.', 30, 7);
            } else {
              USER_MESSAGE(panelId, 'Шаблон обновлен.', 20, 7);
            }
          })
          .fail(() => {
            SERVER_DOWN_MESSAGE(panelId);
          });
      }
    });

    if (data === undefined) {
      selectTag.val("0");
    } else {
      selectTag.val(''+this.template.orderType);
      inputTitle.val(this.template.title);
    }

    inputTitle.change();
    selectTag.change();

    this.updateListTemplates();
  }

  updateListTemplates() {
    this.listTemplates.empty();
    for (let i = 0; i < this.template.arrayTemplates.length; ++i) {
      let sectionId = 'sectionId_' + i;
      let buttonRemoveId = 'buttonRemoveId_' + i;
      let buttonUpId = 'buttonUpId_' + i;
      let buttonDownId = 'buttonDownId_' + i;
      this.listTemplates.append('<div class="row" id="' + sectionId + '">' +
        '<div class="col-md-8"><h3 class="form-signin-heading" align="left"><span class="left-buffer-20 label label-default">' + this.template.arrayTemplates[i].title + '</span></h3></div>' +
        '<div class="col-md-4">' +
        '<button id="' + buttonUpId + '" type="button" class="btn btn-default top-buffer-20"><span class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span></button>' +
        '<button id="' + buttonDownId + '" type="button" class="btn btn-default left-buffer-30 top-buffer-20"><span class="glyphicon glyphicon-arrow-down" aria-hidden="true"></span></button>' +
        '<button id="' + buttonRemoveId + '" type="button" class="btn btn-danger left-buffer-45 top-buffer-20"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>' +
        '</div>' +
        '</div><hr class="divider">');
      $('#' + buttonUpId).on('click', () => {
        if (i === 0 || this.template.arrayTemplates.length === 1) {
          return;
        }
        [this.template.arrayTemplates[i - 1], this.template.arrayTemplates[i]] =
          [this.template.arrayTemplates[i], this.template.arrayTemplates[i - 1]];
        this.updateListTemplates();
      });
      $('#' + buttonDownId).on('click', () => {
        if (i === this.template.arrayTemplates.length - 1 || this.template.arrayTemplates.length === 1) {
          return;
        }
        [this.template.arrayTemplates[i], this.template.arrayTemplates[i + 1]] =
          [this.template.arrayTemplates[i + 1], this.template.arrayTemplates[i]];
        this.updateListTemplates();
      });
      $('#' + buttonRemoveId).on('click', () => {
        this.template.arrayTemplates.splice(i, 1);
        this.updateListTemplates();
      });
    }
  }
}