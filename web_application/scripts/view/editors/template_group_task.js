class EditorTemplateGroupTask {
  constructor() {
    this.editor = new EditorTemplateAggregate("/upload_template_group_task", "/update_template_group_task",
      "/download_template_task", "/view_list_template_task",
      (data) => {
        return {title: data.title, orderType: data.orderType, arrayTemplates: data.arrayTemplateTask};
      }, (template) => {
        return {title: template.title, orderType: template.orderType, arrayTemplateTask: template.arrayTemplates};
      }, (containerId, panelId, template) => {
        let editor = new EditorTemplateTask();
        editor.initialize(containerId, panelId);
        editor.load(template, null);
        editor.viewModeOn();
      });
  }

  initialize(tagId, panelId, data, templateId) {
    this.editor.initialize(tagId, panelId, data, templateId);
  }
}