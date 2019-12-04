using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace TemplateEditor
{
    /// <summary>
    /// Interaction logic for GenerateDialog.xaml
    /// </summary>
    public partial class GenerateDialog : Window
    {
        private ViewModel.GenerateDialogViewModel _generateDialog;

        public bool IsOK()
        {
            return _generateDialog.IsOK;
        }
        public ViewModel.GenerateDialogViewModel.BindingForm Result()
        {
            return _generateDialog.BindingData;
        }

        public GenerateDialog()
        {
            InitializeComponent();
            _generateDialog = new ViewModel.GenerateDialogViewModel(Close);
            DataContext = _generateDialog;
        }
        private void PreviewNumber(Object sender, TextCompositionEventArgs e)
        {
            Regex regex = new Regex("^[1-9]+[0-9]*$");
            const int maxNumber = 50;
            string content = _generateDialog.BindingData.Number + e.Text;
            if (!regex.IsMatch(content)) {
                e.Handled = true;
            } else if (int.Parse(content) > maxNumber)
            {
                e.Handled = true;
            } else
            {
                e.Handled = false;
            }
        }
        private void PreviewPrefix(Object sender, TextCompositionEventArgs e)
        {
            Regex regex = new Regex("^[a-zA-Z0-9_]+$");
            string content =  e.Text;
            e.Handled = !regex.IsMatch(content);
        }
    }
}
