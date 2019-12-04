using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TemplateEditor.Model
{
    public class TestTaskForm
    {
        public string Header { get; set; } = "";
        public string Type { get; set; } = "Single Choose";
        public List<string> Types
        {
            get
            {
                var content = new List<string> { "Short Answer", "Single Choose", "Multiply Choose" };
                content.Remove(Type);
                content.Insert(0, Type);
                return content;
            }
            private set { }
        }        
        public string Grammar { set; get; } = "";
        public string TaskText { set; get; } = "";
        public string FeedbackScript { set; get; } = "";
    }
}
