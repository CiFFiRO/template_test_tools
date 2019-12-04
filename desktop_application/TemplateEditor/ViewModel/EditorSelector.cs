using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;

namespace TemplateEditor.ViewModel
{
    public class EditorSelector : DataTemplateSelector
    {
        public enum TemplateType { Task=1, TestTask=2, Test=3, GroupTask=4, None=0 }
        private TemplateType _typeTemplate = TemplateType.None;
        public TemplateType TypeTemplate
        {
            set
            {
                _typeTemplate = value;
            }
        }

        public override DataTemplate SelectTemplate(object item, DependencyObject container)
        {
            if (_typeTemplate == TemplateType.Task)
            {
                return (container as FrameworkElement).FindResource("TaskTemplate") as DataTemplate;
            }
            if (_typeTemplate == TemplateType.TestTask)
            {
                return (container as FrameworkElement).FindResource("TestTaskTemplate") as DataTemplate;
            }
            if (_typeTemplate == TemplateType.Test)
            {
                return (container as FrameworkElement).FindResource("TestTemplate") as DataTemplate;
            }
            if (_typeTemplate == TemplateType.GroupTask)
            {
                return (container as FrameworkElement).FindResource("GroupTaskTemplate") as DataTemplate;
            }
            return (container as FrameworkElement).FindResource("DefaultTemplate") as DataTemplate;
        }
    }
}
