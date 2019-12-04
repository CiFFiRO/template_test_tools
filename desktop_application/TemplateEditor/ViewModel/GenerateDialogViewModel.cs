using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace TemplateEditor.ViewModel
{
    public class GenerateDialogViewModel
    {
        public class BindingForm : INotifyPropertyChanged
        {
            private string _number;
            private string _prefix;
            private string _directory;

            public string Number {
                get { return _number; }
                set
                {
                    _number = value;
                    OnPropertyChanged("Number");
                }
            }
            public string Prefix
            {
                get { return _prefix; }
                set
                {
                    _prefix = value;
                    OnPropertyChanged("Prefix");
                }
            }
            public string Directory
            {
                get { return _directory; }
                set
                {
                    _directory = value;
                    OnPropertyChanged("Directory");
                }
            }

            public event PropertyChangedEventHandler PropertyChanged;
            public void OnPropertyChanged([CallerMemberName]string prop = "")
            {
                if (PropertyChanged != null)
                    PropertyChanged(this, new PropertyChangedEventArgs(prop));
            }
        };
        public BindingForm BindingData { get; set; }
        public bool IsOK;
        private Action _close;

        private RelayCommand _browseDirectoryCommand;
        public RelayCommand BrowseDirectoryCommand
        {
            get
            {
                return _browseDirectoryCommand ??
                    (_browseDirectoryCommand = new RelayCommand(obj =>
                    {
                        var dialog = new System.Windows.Forms.FolderBrowserDialog();
                        dialog.RootFolder = Environment.SpecialFolder.Desktop;
                        dialog.SelectedPath = BindingData.Directory;                        
                        var result = dialog.ShowDialog();

                        if (result == System.Windows.Forms.DialogResult.OK)
                        {
                            BindingData.Directory = dialog.SelectedPath;
                        }
                    }));
            }
        }
        private RelayCommand _okCommand;
        public RelayCommand OkCommand
        {
            get
            {
                return _okCommand ??
                    (_okCommand = new RelayCommand(obj =>
                    {
                        if (BindingData.Prefix.Length == 0 || BindingData.Number.Length == 0)
                        {
                            System.Windows.MessageBox.Show("Введены некорректные данные!");
                            return;
                        }

                        IsOK = true;
                        _close();
                    }));
            }
        }
        private RelayCommand _cancelCommand;
        public RelayCommand CancelCommand
        {
            get
            {
                return _cancelCommand ??
                    (_cancelCommand = new RelayCommand(obj =>
                    {
                        IsOK = false;
                        _close();
                    }));
            }
        }

        public GenerateDialogViewModel(Action close)
        {
            _close = close;
            BindingData = new BindingForm();
            BindingData.Number = "1";
            BindingData.Prefix = "variant";
            BindingData.Directory = AppDomain.CurrentDomain.BaseDirectory;
        }
    }
}
