const express = require("express");
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const validator = require('./validator')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/tools', express.static(path.join(__dirname, "../tools")));
app.use(express.static(path.join(__dirname, "../web_application")));

app.post("/registration", function(request, response){
  response.send({ok: validator.registrationForm(request.body)});
});


app.post("/test_post", function(request, response){
  console.log("Arguments: ", request.query);
  console.log("Cookies: ", request.cookies);
  console.log("POST data: ", request.body);

  response.send({resp_var: 'data'});

});

app.get("/test_get", function(request, response){
  console.log("Arguments: ", request.query);
  console.log("Cookies: ", request.cookies);

  response.send({resp_var: 'get_data'});
});

app.listen(4001);

/*

 */