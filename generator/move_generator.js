const FS = require('fs');

let contentServer = FS.readFileSync('./generator/generator.js')+'';
let contentWebApplication = contentServer.substring(0, contentServer.indexOf('module.exports = {'));
let contentDesktopApplication = 'const IS_CSHARP_INTERPRETER = true;' +
  contentWebApplication.substring('const IS_CSHARP_INTERPRETER = false;'.length);

FS.writeFileSync('./server/generator.js', contentServer);
FS.writeFileSync('./web_application/scripts/internal/generator.js', contentWebApplication);
FS.writeFileSync('./desktop_application/TemplateEditor/bin/Debug/generator.js', contentDesktopApplication);
FS.writeFileSync('./desktop_application/TemplateEditor/bin/Release/generator.js', contentDesktopApplication);
