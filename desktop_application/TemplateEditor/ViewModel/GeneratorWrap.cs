using System.IO;
using System;
using JavaScriptEngineSwitcher.ChakraCore;
using JavaScriptEngineSwitcher.Core;
using System.Collections.Generic;
using System.Dynamic;

namespace TemplateEditor.ViewModel
{
    public class GeneratorWrap
    {
        private const string _generatorFileName = ".\\generator.js";
        IJsEngine _engine;

        private static GeneratorWrap _instance;

        private GeneratorWrap ()
        {
            _engine = new JavaScriptEngineSwitcher.V8.V8JsEngine();
            var precompiledCode = _engine.PrecompileFile(_generatorFileName);
            _engine.Execute(precompiledCode);
        }

        public static GeneratorWrap GetInstance()
        {
            if (_instance == null)
                _instance = new GeneratorWrap();
            return _instance;
        }

        public Model.TestTaskForm TemplateTestTaskToForm(string template)
        {
            CheckTemplateTestTask(template);
            Model.TestTaskForm result = new Model.TestTaskForm();
            var jsonForm = _engine.CallFunction<string>("translateTemplateTestTaskToForm", new object[1] { template });
            dynamic form = Newtonsoft.Json.JsonConvert.DeserializeObject<ExpandoObject>(jsonForm);

            result.Header = form.header;

            Int64 type = form.type;
            switch (type)
            {
                case 0:
                    result.Type = "Short Answer";
                    break;
                case 1:
                    result.Type = "Single Choose";
                    break;
                case 2:
                    result.Type = "Multiply Choose";
                    break;
                default:
                    Console.WriteLine("wtf "+(form.type==0));
                    break;
            }
            result.Grammar = form.grammar;
            result.TaskText = form.testText;
            result.FeedbackScript = form.feedbackScript;

            return result;
        }

        public string TestTaskFormToTemplate(Model.TestTaskForm form)
        {
            object[] args = new object[5];
            args[0] = (object)form.Header;

            switch (form.Type)
            {
                case "Short Answer":
                    args[1] = (object)0;
                    break;
                case "Single Choose":
                    args[1] = (object)1;
                    break;
                case "Multiply Choose":
                    args[1] = (object)2;
                    break;
            }
            args[2] = (object)form.Grammar;
            args[3] = (object)form.TaskText;
            args[4] = (object)form.FeedbackScript;

            return _engine.CallFunction<string>("templateTestTaskFormToTemplate", args);
        }

        public void GenerateTestTasksGIFT(Model.TestTaskForm form, int number, 
            string prefixFileName, string dstFolder)
        {
            string template = TestTaskFormToTemplate(form);
            CheckTemplateTestTask(template);
            GenerateFileWithContent(() =>
            {
                string testTask = _engine.CallFunction<string>("generateTestTaskFromTemplateTestTask", new object[1] { template });
                return _engine.CallFunction<string>("translateTestTaskToGIFT", new object[1] { testTask });
            }, number, prefixFileName, dstFolder, "gift");
        }

        public void CheckTemplateTestTask(string template)
        {
            _engine.CallFunction("checkTemplateTestTask", new object[1] { template });
        }

        public string TestFormToTemplate(Model.TestForm form)
        {
            object[] args = new object[3];
            args[0] = (object)form.Header;
            switch (form.Type)
            {
                case "Строго последовательный":
                    args[1] = (object)0;
                    break;
                case "Случайный":
                    args[1] = (object)1;
                    break;
            }
            args[2] = (object)Newtonsoft.Json.JsonConvert.SerializeObject(form.TemplateTestTasks);

            return _engine.CallFunction<string>("templateTestFormToTemplate", args);
        }

        public bool CheckTemplateTest(string template)
        {
            return _engine.CallFunction<bool>("checkTemplateTest", new object[1] { template });
        }

        public Model.TestForm TemplateTestToForm(string templateJson)
        {
            CheckTemplateTest(templateJson);
            Model.TestForm result = new Model.TestForm();
            dynamic template = Newtonsoft.Json.JsonConvert.DeserializeObject<ExpandoObject>(templateJson);

            result.Header = template.title;
            Int64 orderType = template.orderType;
            switch (orderType)
            {
                case 0:
                    result.Type = "Строго последовательный";
                    break;
                case 1:
                    result.Type = "Случайный";
                    break;
            }
            result.TemplateTestTasks = new List<string>();
            for (int i = 0; i < template.arrayTemplateTestTask.Count; ++i)
            {
                result.TemplateTestTasks.Add(template.arrayTemplateTestTask[i]);
            }

            return result;
        }

        public void GenerateTestGIFT(Model.TestForm form, int number,
            string prefixFileName, string dstFolder)
        {
            string template = TestFormToTemplate(form);
            if (!CheckTemplateTest(template))
            {
                throw new Exception("Test has error");
            }

            GenerateFileWithContent(() =>
            {
                string test = _engine.CallFunction<string>("generateTestFromTemplateTest", new object[1] { template });
                return _engine.CallFunction<string>("translateTestToGIFT", new object[1] { test });
            }, number, prefixFileName, dstFolder, "gift");
        }

        public void CheckTemplateTask(string template)
        {
            _engine.CallFunction("checkTemplateTask", new object[1] { template });
        }

        public Model.TaskForm TemplateTaskToForm(string template)
        {
            CheckTemplateTask(template);
            Model.TaskForm result = new Model.TaskForm();
            dynamic form = Newtonsoft.Json.JsonConvert.DeserializeObject<ExpandoObject>(template);

            result.Header = form.title;
            result.Grammar = form.grammar;
            result.TextTask = form.textTask;

            return result;
        }

        public string TaskFormToTemplate(Model.TaskForm form)
        {
            object[] args = new object[3];
            args[0] = (object)form.Header;
            args[1] = (object)form.Grammar;
            args[2] = (object)form.TextTask;

            return _engine.CallFunction<string>("templateTaskFormToTemplate", args);
        }

        public void GenerateTaskTXT(Model.TaskForm form, int number,
            string prefixFileName, string dstFolder)
        {
            string template = TaskFormToTemplate(form);
            CheckTemplateTask(template);
            GenerateFileWithContent(() =>
            {
                string testTask = _engine.CallFunction<string>("generateTaskFromTemplateTask", new object[1] { template });
                return _engine.CallFunction<string>("translateTaskToTXT", new object[1] { testTask });
            }, number, prefixFileName, dstFolder, "txt");
        }

        public bool CheckTemplateGroupTask(string template)
        {
            return _engine.CallFunction<bool>("checkTemplateGroupTask", new object[1] { template });
        }

        public Model.GroupTaskForm TemplateGroupTaskToForm(string templateJson)
        {
            CheckTemplateGroupTask(templateJson);
            Model.GroupTaskForm result = new Model.GroupTaskForm();
            dynamic template = Newtonsoft.Json.JsonConvert.DeserializeObject<ExpandoObject>(templateJson);

            result.Header = template.title;
            Int64 orderType = template.orderType;
            switch (orderType)
            {
                case 0:
                    result.Type = "Строго последовательный";
                    break;
                case 1:
                    result.Type = "Случайный";
                    break;
            }
            result.TemplateTasks = new List<string>();
            for (int i = 0; i < template.arrayTemplateTask.Count; ++i)
            {
                result.TemplateTasks.Add(template.arrayTemplateTask[i]);
            }

            return result;
        }

        public string GroupTaskFormToTemplate(Model.GroupTaskForm form)
        {
            object[] args = new object[3];
            args[0] = (object)form.Header;
            switch (form.Type)
            {
                case "Строго последовательный":
                    args[1] = (object)0;
                    break;
                case "Случайный":
                    args[1] = (object)1;
                    break;
            }
            args[2] = (object)Newtonsoft.Json.JsonConvert.SerializeObject(form.TemplateTasks);

            return _engine.CallFunction<string>("templateGroupTaskFormToTemplate", args);
        }

        public void GenerateGroupTaskTXT(Model.GroupTaskForm form, int number,
            string prefixFileName, string dstFolder)
        {
            string template = GroupTaskFormToTemplate(form);
            if (!CheckTemplateGroupTask(template))
            {
                throw new Exception("Group task has error");
            }

            GenerateFileWithContent(() =>
            {
                string test = _engine.CallFunction<string>("generateGroupTaskFromTemplateGroupTask", new object[1] { template });
                return _engine.CallFunction<string>("translateGroupTaskToTXT", new object[1] { test });
            }, number, prefixFileName, dstFolder, "txt");
        }

        private void GenerateFileWithContent(Func<string> callback, int number, 
            string prefixFileName, string dstFolder, string extension)
        {
            Func<int, string> getFullName = (index) =>
            {
                string prefix = Path.Combine(dstFolder, prefixFileName);
                int cipherNumber = (number - 1).ToString().Length;
                int leadingZero = cipherNumber - index.ToString().Length;
                return $"{prefix}_{new String('0', leadingZero)}{index.ToString()}.{extension}";
            };

            for (int i = 0; i < number; ++i)
            {
                string fileName = getFullName(i);
                string text = callback();
                File.WriteAllText(fileName, text);
            }
        }
    }
}
