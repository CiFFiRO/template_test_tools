class EditorTemplateTest {
  constructor() {
    this.editor = new EditorTemplateAggregate("/upload_template_test", "/update_template_test",
      "/download_template_test_task", "/view_list_template_test_task",
      (data) => {
      return {title: data.title, orderType: data.orderType, arrayTemplates: data.arrayTemplateTestTask};
    }, (template) => {
      return {title: template.title, orderType: template.orderType, arrayTemplateTestTask: template.arrayTemplates};
    }, (containerId, panelId, template) => {
        let editor = new EditorTemplateTestTask();
        editor.initialize(containerId, panelId);
        editor.load(template, null);
        editor.viewModeOn();
    });
  }

  initialize(tagId, panelId, data, templateId) {
    this.editor.initialize(tagId, panelId, data, templateId);
  }
} 