using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Controls;
using System.Runtime.CompilerServices;
using System.Collections.ObjectModel;

namespace TemplateEditor.ViewModel
{
    public class ApplicationViewModel
    {
        private EditorSelector _editorSelector;
        private Action _updateContentControl;
        private EditorSelector.TemplateType _currentTemplateType = EditorSelector.TemplateType.None;
        public EditorSelector EditorDataTemplateSelector
        {
            get
            {
                return _editorSelector;
            }
            private set { }
        }
        public class FormsData 
        {
            public Model.TaskForm Task { get; set; }
            public Model.TestTaskForm TestTask { get; set; }
            public Model.TestForm Test { get; set; }
            public Model.GroupTaskForm GroupTask { get; set; }
            public ObservableCollection<string> TemplateHeaders { get; set; }
            public int SelectedTemplateIndex { get; set; }
            private RelayCommand _upTest;
            public RelayCommand UpTest
            {
                get
                {
                    return _upTest ??
                        (_upTest = new RelayCommand(obj =>
                        {
                            int templateIndex = int.Parse(obj as string);

                            if (SelectedTemplateIndex>=0 && SelectedTemplateIndex < TemplateHeaders.Count)
                            {
                                int oldIndex = SelectedTemplateIndex;
                                int newIndex = oldIndex - 1;
                                if (newIndex < 0)
                                {
                                    newIndex = TemplateHeaders.Count - 1;
                                    var tmp = TemplateHeaders[oldIndex];
                                    
                                    TemplateHeaders.RemoveAt(oldIndex);
                                    TemplateHeaders.Insert(newIndex, tmp);

                                    if (templateIndex == (int)EditorSelector.TemplateType.Test)
                                    {
                                        var tmpTemplate = Test.TemplateTestTasks[oldIndex];
                                        Test.TemplateTestTasks.RemoveAt(oldIndex);
                                        Test.TemplateTestTasks.Insert(newIndex, tmpTemplate);
                                    }
                                    else
                                    {
                                        var tmpTemplate = GroupTask.TemplateTasks[oldIndex];
                                        GroupTask.TemplateTasks.RemoveAt(oldIndex);
                                        GroupTask.TemplateTasks.Insert(newIndex, tmpTemplate);
                                    }
                                }
                                else
                                {
                                    var tmp = TemplateHeaders[oldIndex];
                                    TemplateHeaders[oldIndex] = TemplateHeaders[newIndex];
                                    TemplateHeaders[newIndex] = tmp;

                                    if (templateIndex == (int)EditorSelector.TemplateType.Test)
                                    {
                                        var tmpTemplate = Test.TemplateTestTasks[oldIndex];
                                        Test.TemplateTestTasks[oldIndex] = Test.TemplateTestTasks[newIndex];
                                        Test.TemplateTestTasks[newIndex] = tmpTemplate;
                                    }
                                    else
                                    {
                                        var tmpTemplate = GroupTask.TemplateTasks[oldIndex];
                                        GroupTask.TemplateTasks[oldIndex] = GroupTask.TemplateTasks[newIndex];
                                        GroupTask.TemplateTasks[newIndex] = tmpTemplate;
                                    }
                                }
                                SelectedTemplateIndex = newIndex;
                            }
                        }));
                }
            }
            private RelayCommand _downTest;
            public RelayCommand DownTest
            {
                get
                {
                    return _downTest ??
                        (_downTest = new RelayCommand(obj =>
                        {
                            int templateIndex = int.Parse(obj as string);

                            if (SelectedTemplateIndex >= 0 && SelectedTemplateIndex < TemplateHeaders.Count)
                            {
                                int oldIndex = SelectedTemplateIndex;
                                int newIndex = oldIndex + 1;
                                if (newIndex == TemplateHeaders.Count)
                                {
                                    newIndex = 0;
                                    var tmp = TemplateHeaders[oldIndex];

                                    TemplateHeaders.RemoveAt(oldIndex);
                                    TemplateHeaders.Insert(newIndex, tmp);

                                    if (templateIndex == (int)EditorSelector.TemplateType.Test)
                                    {
                                        var tmpTemplate = Test.TemplateTestTasks[oldIndex];    
                                        Test.TemplateTestTasks.RemoveAt(oldIndex);
                                        Test.TemplateTestTasks.Insert(newIndex, tmpTemplate);
                                    }
                                    else
                                    {
                                        var tmpTemplate = GroupTask.TemplateTasks[oldIndex];
                                        GroupTask.TemplateTasks.RemoveAt(oldIndex);
                                        GroupTask.TemplateTasks.Insert(newIndex, tmpTemplate);
                                    }
                                }
                                else
                                {
                                    var tmp = TemplateHeaders[oldIndex];
                                    TemplateHeaders[oldIndex] = TemplateHeaders[newIndex];
                                    TemplateHeaders[newIndex] = tmp;

                                    if (templateIndex == (int)EditorSelector.TemplateType.Test)
                                    {
                                        var tmpTemplate = Test.TemplateTestTasks[oldIndex];
                                        Test.TemplateTestTasks[oldIndex] = Test.TemplateTestTasks[newIndex];
                                        Test.TemplateTestTasks[newIndex] = tmpTemplate;
                                    }
                                    else
                                    {
                                        var tmpTemplate = GroupTask.TemplateTasks[oldIndex];
                                        GroupTask.TemplateTasks[oldIndex] = GroupTask.TemplateTasks[newIndex];
                                        GroupTask.TemplateTasks[newIndex] = tmpTemplate;
                                    }
                                }
                                SelectedTemplateIndex = newIndex;
                            }
                        }));
                }
            }
            private RelayCommand _deleteTest;
            public RelayCommand DeleteTest
            {
                get
                {
                    return _deleteTest ??
                        (_deleteTest = new RelayCommand(obj =>
                        {
                            if (SelectedTemplateIndex >= 0 && SelectedTemplateIndex < TemplateHeaders.Count)
                            {
                                int templateIndex = int.Parse(obj as string);

                                if (templateIndex == (int)EditorSelector.TemplateType.Test)
                                {
                                    Test.TemplateTestTasks.RemoveAt(SelectedTemplateIndex);
                                } else
                                {
                                    GroupTask.TemplateTasks.RemoveAt(SelectedTemplateIndex);
                                }

                                TemplateHeaders.RemoveAt(SelectedTemplateIndex);
                                --SelectedTemplateIndex;
                            }
                        }));
                }
            }
            private RelayCommand _addTest;
            public RelayCommand AddTest
            {
                get
                {
                    return _addTest ??
                        (_addTest = new RelayCommand(obj =>
                        {
                            ApplicationViewModel.JsonFileDialog((fileName) =>
                            {
                                string templateJson = File.ReadAllText(fileName);
                                int templateIndex = int.Parse(obj as string);

                                if (templateIndex == (int)EditorSelector.TemplateType.Test)
                                {
                                    GeneratorWrap.GetInstance().CheckTemplateTestTask(templateJson);
                                    Test.TemplateTestTasks.Add(templateJson);
                                }
                                else
                                {
                                    GeneratorWrap.GetInstance().CheckTemplateTask(templateJson);
                                    GroupTask.TemplateTasks.Add(templateJson);
                                }

                                dynamic template = Newtonsoft.Json.JsonConvert.DeserializeObject<ExpandoObject>(templateJson);
                                TemplateHeaders.Add(template.title);
                            }, (error) => { return "Ошибка: файл не является шаблоном или содержит ошибку"; }, true, false);
                        }));
                }
            }
        }
        public FormsData BindingDataForms { get; set; }
        private string _lastFileNameToSave;

        private RelayCommand _createTemplateTestTaskCommand;
        public RelayCommand CreateTemplateTestTaskCommand
        {
            get
            {
                return _createTemplateTestTaskCommand ??
                    (_createTemplateTestTaskCommand = new RelayCommand(obj =>
                    {
                        _editorSelector.TypeTemplate = EditorSelector.TemplateType.TestTask;
                        _lastFileNameToSave = null;
                        BindingDataForms.TestTask = new Model.TestTaskForm();
                        _currentTemplateType = EditorSelector.TemplateType.TestTask;
                        _updateContentControl();
                    }));
            }
        }
        private RelayCommand _createTemplateTaskCommand;
        public RelayCommand CreateTemplateTaskCommand
        {
            get
            {
                return _createTemplateTaskCommand ??
                    (_createTemplateTaskCommand = new RelayCommand(obj =>
                    {
                        _editorSelector.TypeTemplate = EditorSelector.TemplateType.Task;
                        _lastFileNameToSave = null;
                        BindingDataForms.Task = new Model.TaskForm();
                        _currentTemplateType = EditorSelector.TemplateType.Task;
                        _updateContentControl();
                    }));
            }
        }
        private RelayCommand _createTemplateTestCommand;
        public RelayCommand CreateTemplateTestCommand
        {
            get
            {
                return _createTemplateTestCommand ??
                    (_createTemplateTestCommand = new RelayCommand(obj =>
                    {
                        _editorSelector.TypeTemplate = EditorSelector.TemplateType.Test;
                        _lastFileNameToSave = null;
                        BindingDataForms.Test = new Model.TestForm();
                        _currentTemplateType = EditorSelector.TemplateType.Test;
                        BindingDataForms.TemplateHeaders = new ObservableCollection<string>();
                        _updateContentControl();
                    }));
            }
        }
        private RelayCommand _createTemplateGroupTaskCommand;
        public RelayCommand CreateTemplateGroupTaskCommand
        {
            get
            {
                return _createTemplateGroupTaskCommand ??
                    (_createTemplateGroupTaskCommand = new RelayCommand(obj =>
                    {
                        _editorSelector.TypeTemplate = EditorSelector.TemplateType.GroupTask;
                        _lastFileNameToSave = null;
                        BindingDataForms.GroupTask = new Model.GroupTaskForm();
                        _currentTemplateType = EditorSelector.TemplateType.GroupTask;
                        BindingDataForms.TemplateHeaders = new ObservableCollection<string>();
                        _updateContentControl();
                    }));
            }
        }
        private RelayCommand _openTemplateTestTaskCommand;
        public RelayCommand OpenTemplateTestTaskCommand
        {
            get
            {
                return _openTemplateTestTaskCommand ??
                    (_openTemplateTestTaskCommand = new RelayCommand(obj =>
                    {
                        JsonFileDialog((fileName) =>
                        {
                            _lastFileNameToSave = fileName;
                            _editorSelector.TypeTemplate = EditorSelector.TemplateType.TestTask;
                            _currentTemplateType = EditorSelector.TemplateType.TestTask;
                            BindingDataForms.TestTask = GeneratorWrap.GetInstance().TemplateTestTaskToForm(GetTemplateFromLoadData(File.ReadAllText(fileName)));
                            _updateContentControl();
                        }, (error) => { return "Ошибка: файл не является шаблоном тестового задания или содержит ошибку"; }, false, false);
                    }));
            }
        }
        private RelayCommand _openTemplateTaskCommand;
        public RelayCommand OpenTemplateTaskCommand
        {
            get
            {
                return _openTemplateTaskCommand ??
                    (_openTemplateTaskCommand = new RelayCommand(obj =>
                    {
                        JsonFileDialog((fileName) =>
                        {
                            _lastFileNameToSave = fileName;
                            _editorSelector.TypeTemplate = EditorSelector.TemplateType.Task;
                            _currentTemplateType = EditorSelector.TemplateType.Task;
                            BindingDataForms.Task = GeneratorWrap.GetInstance().TemplateTaskToForm(GetTemplateFromLoadData(File.ReadAllText(fileName)));
                            _updateContentControl();
                        }, (error) => { return "Ошибка: файл не является шаблоном задания или содержит ошибку"; }, false, false);
                    }));
            }
        }
        private RelayCommand _openTemplateTestCommand;
        public RelayCommand OpenTemplateTestCommand
        {
            get
            {
                return _openTemplateTestCommand ??
                    (_openTemplateTestCommand = new RelayCommand(obj =>
                    {
                        JsonFileDialog((fileName) =>
                        {
                            _lastFileNameToSave = fileName;
                            _editorSelector.TypeTemplate = EditorSelector.TemplateType.Test;
                            _currentTemplateType = EditorSelector.TemplateType.Test;
                            BindingDataForms.Test = GeneratorWrap.GetInstance().TemplateTestToForm(GetTemplateFromLoadData(File.ReadAllText(fileName)));
                            BindingDataForms.TemplateHeaders = new ObservableCollection<string>();
                            for (int i = 0; i < BindingDataForms.Test.TemplateTestTasks.Count; ++i)
                            {
                                dynamic templateTestTask = Newtonsoft.Json.JsonConvert.DeserializeObject<ExpandoObject>(BindingDataForms.Test.TemplateTestTasks[i]);
                                BindingDataForms.TemplateHeaders.Add(templateTestTask.title);
                            }
                            BindingDataForms.SelectedTemplateIndex = -1;
                            _updateContentControl();
                        }, (error) => {
                            Console.WriteLine(error.Message);
                            return "Ошибка: файл не является шаблоном теста или содержит ошибку";
                        }, false, false);
                    }));
            }
        }
        private RelayCommand _openTemplateGroupTaskCommand;
        public RelayCommand OpenTemplateGroupTaskCommand
        {
            get
            {
                return _openTemplateGroupTaskCommand ??
                    (_openTemplateGroupTaskCommand = new RelayCommand(obj =>
                    {
                        JsonFileDialog((fileName) =>
                        {
                            _lastFileNameToSave = fileName;
                            _editorSelector.TypeTemplate = EditorSelector.TemplateType.GroupTask;
                            _currentTemplateType = EditorSelector.TemplateType.GroupTask;
                            BindingDataForms.GroupTask = GeneratorWrap.GetInstance().TemplateGroupTaskToForm(GetTemplateFromLoadData(File.ReadAllText(fileName)));
                            BindingDataForms.TemplateHeaders = new ObservableCollection<string>();
                            for (int i = 0; i < BindingDataForms.GroupTask.TemplateTasks.Count; ++i)
                            {
                                dynamic templateTestTask = Newtonsoft.Json.JsonConvert.DeserializeObject<ExpandoObject>(BindingDataForms.GroupTask.TemplateTasks[i]);
                                BindingDataForms.TemplateHeaders.Add(templateTestTask.title);
                            }
                            BindingDataForms.SelectedTemplateIndex = -1;
                            _updateContentControl();
                        }, (error) => {
                            Console.WriteLine(error.Message);
                            return "Ошибка: файл не является шаблоном группы заданий или содержит ошибку";
                        }, false, false);
                    }));
            }
        }
        private RelayCommand _exit;
        public RelayCommand Exit
        {
            get
            {
                return _exit ??
                    (_exit = new RelayCommand(obj =>
                    {
                        System.Windows.Application.Current.Shutdown();
                    }));
            }
        }
        private RelayCommand _saveAs;
        public RelayCommand SaveAs
        {
            get
            {
                return _saveAs ??
                    (_saveAs = new RelayCommand(obj =>
                    {
                        if (_currentTemplateType == EditorSelector.TemplateType.None)
                        {
                            return;
                        }

                        JsonFileDialog((fileName) =>
                        {
                            string template = GetTemplateFromForm();
                            CheckForm();
                            _lastFileNameToSave = fileName;
                            File.WriteAllText(_lastFileNameToSave, GetSaveDataFromTemplate(template));
                        }, (error) => { return GetTanslateErrorFromException(error); }, false, true);
                    }));
            }
        }
        private RelayCommand _save;
        public RelayCommand Save
        {
            get
            {
                return _save ??
                    (_save = new RelayCommand(obj =>
                    {
                        if (_currentTemplateType == EditorSelector.TemplateType.None)
                        {
                            return;
                        }
                        if (_lastFileNameToSave == null)
                        {
                            SaveAs.Execute(null);
                            return;
                        }

                        try {
                            string template = GetTemplateFromForm();
                            CheckForm();
                            File.WriteAllText(_lastFileNameToSave, GetSaveDataFromTemplate(template));
                        } catch (Exception error)
                        {
                            System.Windows.MessageBox.Show(GetTanslateErrorFromException(error));
                        }
                    }));
            }
        }
        private RelayCommand _generate;
        public RelayCommand Generate
        {
            get
            {
                return _generate ??
                    (_generate = new RelayCommand(obj =>
                    {
                        if (_currentTemplateType == EditorSelector.TemplateType.None)
                        {
                            return;
                        }

                        var selectWindow = new GenerateDialog();
                        selectWindow.ShowDialog();
                        if (selectWindow.IsOK())
                        {
                            var result = selectWindow.Result();
                            try
                            {
                                if (_currentTemplateType == EditorSelector.TemplateType.TestTask)
                                {
                                    GeneratorWrap.GetInstance().GenerateTestTasksGIFT(BindingDataForms.TestTask, int.Parse(result.Number),
                                        result.Prefix, result.Directory);
                                }
                                else if (_currentTemplateType == EditorSelector.TemplateType.Test)
                                {
                                    GeneratorWrap.GetInstance().GenerateTestGIFT(BindingDataForms.Test, int.Parse(result.Number),
                                        result.Prefix, result.Directory);
                                }
                                else if (_currentTemplateType == EditorSelector.TemplateType.Task)
                                {
                                    GeneratorWrap.GetInstance().GenerateTaskTXT(BindingDataForms.Task, int.Parse(result.Number),
                                        result.Prefix, result.Directory);
                                }
                                else if (_currentTemplateType == EditorSelector.TemplateType.GroupTask)
                                {
                                    GeneratorWrap.GetInstance().GenerateGroupTaskTXT(BindingDataForms.GroupTask, int.Parse(result.Number),
                                        result.Prefix, result.Directory);
                                }
                            } catch(Exception error)
                            {
                                System.Windows.MessageBox.Show(GetTanslateErrorFromException(error));
                            }
                        }
                    }));
            }
        }
        private RelayCommand _openHelp;
        public RelayCommand OpenHelp
        {
            get
            {
                return _openHelp ??
                    (_openHelp = new RelayCommand(obj =>
                    {
                        System.Diagnostics.Process.Start(".\\help.html");
                    }));
            }
        }
        private RelayCommand _info;
        public RelayCommand Info
        {
            get
            {
                return _info ??
                    (_info = new RelayCommand(obj =>
                    {
                        // ?
                    }));
            }
        }

        public ApplicationViewModel(Action updateContentControl)
        {
            BindingDataForms = new FormsData();
            BindingDataForms.Task = new Model.TaskForm();
            BindingDataForms.TestTask = new Model.TestTaskForm();
            BindingDataForms.Test = new Model.TestForm();

            _editorSelector = new EditorSelector();
            _updateContentControl = updateContentControl;
        }

        private string GetTanslateErrorFromException(Exception error)
        {
            return error.Message.Split('\n')[0];
        }

        private static void JsonFileDialog(Action<string> callback, Func<Exception, string> getExceptionMessage,
            bool isMultiselect, bool isSave)
        {
            dynamic dialog = null;
            if (isSave)
            {
                dialog = new Microsoft.Win32.SaveFileDialog();
            } else
            {
                dialog = new Microsoft.Win32.OpenFileDialog();
            }

            dialog.FileName = "Template";
            dialog.DefaultExt = ".json";
            dialog.Filter = "Text documents (.json)|*.json";

            if (!isSave)
            {
                dialog.Multiselect = isMultiselect;
            }

            Nullable<bool> result = dialog.ShowDialog();

            if (result == true)
            {
                try
                {
                    if (!isSave)
                    {
                        if (!isMultiselect)
                        {
                            callback(dialog.FileName);
                        }
                        else
                        {
                            foreach (var fileName in dialog.FileNames)
                            {
                                try
                                {
                                    callback(fileName);
                                }
                                catch (Exception)
                                {
                                    continue;
                                }
                            }
                        }
                    } else
                    {
                        callback(dialog.FileName);
                    }
                }
                catch (Exception error)
                {
                    System.Windows.MessageBox.Show(getExceptionMessage(error));
                }
            }
        }

        private string GetTemplateFromForm()
        {
            if (_currentTemplateType == EditorSelector.TemplateType.TestTask)
            {
                return GeneratorWrap.GetInstance().TestTaskFormToTemplate(BindingDataForms.TestTask);
            }
            if (_currentTemplateType == EditorSelector.TemplateType.Test)
            {
                return GeneratorWrap.GetInstance().TestFormToTemplate(BindingDataForms.Test);
            }
            if (_currentTemplateType == EditorSelector.TemplateType.Task)
            {
                return GeneratorWrap.GetInstance().TaskFormToTemplate(BindingDataForms.Task);
            }
            if (_currentTemplateType == EditorSelector.TemplateType.GroupTask)
            {
                return GeneratorWrap.GetInstance().GroupTaskFormToTemplate(BindingDataForms.GroupTask);
            }
            return null;
        }

        private void CheckForm()
        {
            if (_currentTemplateType == EditorSelector.TemplateType.TestTask)
            {
                GeneratorWrap.GetInstance().CheckTemplateTestTask(GeneratorWrap.GetInstance().TestTaskFormToTemplate(BindingDataForms.TestTask));
            }
            else if (_currentTemplateType == EditorSelector.TemplateType.Test)
            {
                if (!GeneratorWrap.GetInstance().CheckTemplateTest(GeneratorWrap.GetInstance().TestFormToTemplate(BindingDataForms.Test)))
                {
                    throw new Exception("Шаблон теста содержит ошибки");
                }
            }
            else if (_currentTemplateType == EditorSelector.TemplateType.Task)
            {
                GeneratorWrap.GetInstance().CheckTemplateTask(GeneratorWrap.GetInstance().TaskFormToTemplate(BindingDataForms.Task));
            }
            else if (_currentTemplateType == EditorSelector.TemplateType.GroupTask)
            {
                if (!GeneratorWrap.GetInstance().CheckTemplateGroupTask(GeneratorWrap.GetInstance().GroupTaskFormToTemplate(BindingDataForms.GroupTask)))
                {
                    throw new Exception("Шаблон теста содержит ошибки");
                }
            }
        }

        private string GetSaveDataFromTemplate(string templateJson)
        {
            if (_currentTemplateType == EditorSelector.TemplateType.TestTask)
            {
                return templateJson;
            }
            if (_currentTemplateType == EditorSelector.TemplateType.Test)
            {
                dynamic template = Newtonsoft.Json.JsonConvert.DeserializeObject<ExpandoObject>(templateJson);
                for (int i = 0; i < template.arrayTemplateTestTask.Count; ++i)
                {
                    template.arrayTemplateTestTask[i] = Newtonsoft.Json.JsonConvert.DeserializeObject<ExpandoObject>(template.arrayTemplateTestTask[i]);
                }
                return Newtonsoft.Json.JsonConvert.SerializeObject(template);
            }
            if (_currentTemplateType == EditorSelector.TemplateType.Task)
            {
                return templateJson;
            }
            if (_currentTemplateType == EditorSelector.TemplateType.Test)
            {
                dynamic template = Newtonsoft.Json.JsonConvert.DeserializeObject<ExpandoObject>(templateJson);
                for (int i = 0; i < template.arrayTemplateTestTask.Count; ++i)
                {
                    template.arrayTemplateTask[i] = Newtonsoft.Json.JsonConvert.DeserializeObject<ExpandoObject>(template.arrayTemplateTask[i]);
                }
                return Newtonsoft.Json.JsonConvert.SerializeObject(template);
            }
            return "";
        }

        private string GetTemplateFromLoadData(string data)
        {
            if (_currentTemplateType == EditorSelector.TemplateType.TestTask)
            {
                return data;
            }
            if (_currentTemplateType == EditorSelector.TemplateType.Test)
            {
                dynamic template = Newtonsoft.Json.JsonConvert.DeserializeObject<ExpandoObject>(data);
                for (int i = 0; i < template.arrayTemplateTestTask.Count; ++i)
                {
                    template.arrayTemplateTestTask[i] = Newtonsoft.Json.JsonConvert.SerializeObject(template.arrayTemplateTestTask[i]);
                }
                return Newtonsoft.Json.JsonConvert.SerializeObject(template);
            }
            if (_currentTemplateType == EditorSelector.TemplateType.Task)
            {
                return data;
            }
            if (_currentTemplateType == EditorSelector.TemplateType.Test)
            {
                dynamic template = Newtonsoft.Json.JsonConvert.DeserializeObject<ExpandoObject>(data);
                for (int i = 0; i < template.arrayTemplateTestTask.Count; ++i)
                {
                    template.arrayTemplateTask[i] = Newtonsoft.Json.JsonConvert.SerializeObject(template.arrayTemplateTask[i]);
                }
                return Newtonsoft.Json.JsonConvert.SerializeObject(template);
            }
            return "";
        }
    }
}
