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
        if (text.length < 3) {
          return [];
        }

        let result = [];
        let colors = {ignoreSpecial: '#499c54',
          link: '#cb602d',
          noTerminal: '#ffc66d',
          choose: '#4a88c7',
          end: '#c63bb4'
        };
        let index = 0;
        let line = 0, character = 0;
        while (index < text.length) {
          let begin = {line: line, ch: character};
          while (index < text.length && text[index] !== '=') {
            if (text[index] === '\n') {
              ++line;
              character = 0;
              ++index;
              continue;
            }
            ++character;
            ++index;
          }
          result.push([begin, {line: line, ch: character}, colors.noTerminal]);
          while (index < text.length) {
            if (text[index] === '\n') {
              ++line;
              character = 0;
              ++index;
              continue;
            }

            begin = {line: line, ch: character};
            if (text[index] === '|') {
              result.push([begin, {line: line, ch: character+1}, colors.choose]);
              ++character;
              ++index;
            }
            else if (text[index] === '$') {
              ++character;
              ++index;

              if (text[index] === '$' || text[index] === '|' || text[index] === '(' || text[index] === ')' ||
                text[index] === '[' || text[index] === ']' || text[index] === '.' || text[index] === '=') {
                result.push([begin, {line: line, ch: character+1}, colors.ignoreSpecial]);
                ++character;
                ++index;
              } else if (text[index] === '{') {
                result.push([begin, {line: line, ch: character+1}, colors.link]);
                while (index < text.length && text[index] !== '}') {
                  if (text[index] === '\n') {
                    ++line;
                    character = 0;
                    ++index;
                    continue;
                  }
                  ++character;
                  ++index;
                }
                result.push([{line: begin.line, ch: begin.ch+2}, {line: line, ch: character}, colors.noTerminal]);
                result.push([{line: line, ch: character}, {line: line, ch: character+1}, colors.link]);
              } else {
                while (index < text.length && text[index] !== ')') {
                  if (text[index] === '\n') {
                    ++line;
                    character = 0;
                    ++index;
                    continue;
                  }
                  ++character;
                  ++index;
                }
                result.push([begin, {line: line, ch: character+1}, colors.noTerminal]);
              }
            } else if (text[index] === '.') {
              result.push([begin, {line: line, ch: character+1}, colors.end]);
              ++character;
              ++index;
              break;
            } else {
              ++character;
              ++index;
            }
          }
        }

        return result;
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