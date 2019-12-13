class EditorTemplateTask {
  constructor() {
    this.editor = new EditorTemplate(EditorTemplate.templateTypes().task, '/upload_template_task',
      '/update_template_task', (header, type, grammar, textTask, feedbackScript) => {
        try {
          let template = templateTaskFormToTemplate(header, grammar, textTask);
          checkTemplateTask(template);
        } catch (exception) {
          return exception.message;
        }

        return null;
      }, (header, type, grammar, textTask, feedbackScript) => {
        return templateTaskFormToTemplate(header, grammar, textTask);
      }, template => {
        return {header: template.title, grammar: template.grammar, testText: template.textTask};
      },text => {
        return [];
      });
  }

  initialize(tagId, panelId) {
    this.editor.initialize(tagId, panelId);
  }

  load(template, templateId) {
    this.editor.load(template, templateId);
  }

  viewModeOn() {
    this.editor.viewModeOn();
  }

  viewModeOff() {
    this.editor.viewModeOff();
  }
}