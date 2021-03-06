﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TemplateEditor.Model
{
    public class TestForm
    {
        public string Header { get; set; } = "";
        public string Type { get; set; } = "Строго последовательный";
        public List<string> Types
        {
            get
            {
                var content = new List<string> { "Строго последовательный", "Случайный" };
                content.Remove(Type);
                content.Insert(0, Type);
                return content;
            }
            private set { }
        }
        public List<string> TemplateTestTasks;
        public TestForm ()
        {
            TemplateTestTasks = new List<string>();
        }
    }
}
