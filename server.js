/*********************************************************************************
* WEB322 – Assignment 06
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: _Mingxi Wang_________ Student ID: _117920173_____ Date: _Apr.13.2018___
*
* Online (Heroku) Link: https://protected-sierra-16179.herokuapp.com/  
*
********************************************************************************/ 

const express = require("express");
const data_service = require("./data_service.js");
const dataServiceAuth = require("./data-service-auth.js");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const clientSessions = require("client-sessions");
var app = express();
app.engine('.hbs', exphbs({extname: '.hbs', 
                           defaultLayout: 'main',
                           helpers: {
                            navLink: function(url, options){
                              return '<li' + ((url == app.locals.activeRoute) ? ' class="active" ' : '') + '><a href="' + url + '">' + options.fn(this) + '</a></li>';
                           },
                            equal: function (lvalue, rvalue, options) {
                            if (arguments.length < 3)
                            throw new Error("Handlebars Helper equal needs 2 parameters");
                            if (lvalue != rvalue) {
                            return options.inverse(this);
                            } else {
                            return options.fn(this);
                            }
                           } 
                          }
                        }));
app.set('view engine', '.hbs');
var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

const storage = multer.diskStorage({
  destination: "./public/images/uploaded",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
app.post("/images/add", upload.single("imageFile"), (req, res) => {
  res.redirect("/images");
});

// middlewares setup functions
app.use(express.static('public')); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req,res,next){
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
  next();
 });
app.use(clientSessions({
  cookieName: "session",
  secret: "web322-assignment6",
  duration: 2*60*1000,
  activeDuration: 60*1000
}));
app.use(function(req, res, next) {
  res.locals.session = req.session;
 next();
 });
 //helper middleware function to check login status
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
} 

// setup a route to listen on the default url path (http://localhost)
app.get("/", function(req,res){
   res.render('home');
});

// setup a route to listen on /home
app.get("/home", function(req,res){
  res.render('home');
});

// setup a route to listen on /about
app.get("/about", function(req,res){
   res.render('about');
});

// setup a route to listen on /employees
app.get("/employees", ensureLogin, function(req,res){
  if (req.query.status) {
    data_service.getEmployeesByStatus(req.query.status).then((data) => {
      if (data.length > 0) {
        res.render("employees", {employee: data});
      } else {
        res.render("employees", {message: "No results"});
      } 
    }).catch((err) => {
        res.render("employees", {message: "No results"});
    });
} else if (req.query.department) {
    data_service.getEmployeesByDepartment(req.query.department).then((data) => {
      if (data.length > 0) {
        res.render("employees", {employees: data});
      } else {
        res.render("employees", {message: "No results"});
      } 
    }).catch((err) => {
        res.render("employees", {message: "No results"});
    });
} else if (req.query.manager) {
    data_service.getEmployeesByManager(req.query.manager).then((data) => {
      if (data.length > 0) {
        res.render("employees", {employees: data});
      } else {
        res.render("employees", {message: "No results"});
      } 
    }).catch((err) => {
        res.render("employees", {message: "No results"});
    });
} else {
  data_service.getAllEmployees().then((data) => {
    if (data.length > 0) {
      res.render("employees", {employees: data});
    } else {
      res.render("employees", {message: "No results"});
    } 
  }); 
  data_service.getAllEmployees().catch((err) => {
    res.render({message: "No results"});
    });
  }
});

// new route to get employee by empNo
app.get("/employee/:empNum", ensureLogin, (req, res) => {
  // initialize an empty object to store the values
  let viewData = {};
  data_service.getEmployeeByNum(req.params.empNum).then((data) => {
  if (data) {
    viewData.employee = data; //store employee data in the "viewData" object as "employee"
    } else {
    viewData.employee = null; // set employee to null if none were returned
    }
  }).catch(() => {
    viewData.employee = null; // set employee to null if there was an error
  }).then(data_service.getDepartments)
  .then((data) => {
  viewData.departments = data; // store department data in the "viewData" object as "departments"
  // loop through viewData.departments and once we have found the departmentId that matches
  // the employee's "department" value, add a "selected" property to the matching
  // viewData.departments object
  for (let i = 0; i < viewData.departments.length; i++) {
    if (viewData.departments[i].departmentId == viewData.employee.department) {
      viewData.departments[i].selected = true;
      }
    }
  }).catch(() => {
    viewData.departments = []; // set departments to empty if there was an error
  }).then(() => {
  if (viewData.employee == null) { // if no employee - return an error
    res.status(404).send("Employee Not Found");
    } else {
    res.render("employee", { viewData: viewData }); // render the "employee" view
    }
  });
 });

// setup a route to listen on /departments
app.get("/departments", ensureLogin, function(req,res){
  data_service.getDepartments().then((data) => {
    if (data.length > 0) {
      res.render("departments", {departments: data});
    } else {
      res.render("departments", {message: "No results"});
    } 
  });
  data_service.getDepartments().catch((err) => {
    res.render({message: "No results"});
  });
});

// setup a route to listen on /employees/add 
app.get("/employees/add", ensureLogin, function(req,res){
  data_service.getDepartments().then((data) => {
    res.render("addEmployee",{departments: data});
}).catch((err) => {
    res.render("addEmployee", {departments: []});
  });
});

//setup a route to listen on /employees/delete/:empNum
app.get("/employees/delete/:empNum", ensureLogin, function(req, res){
  data_service.deleteEmployeeByNum(req.params.empNum).then(() =>{
    res.redirect("/employees");
  })
  .catch((err) =>{
    res.status(500).send("Unable to Remove Employee / Employee not found");
  });
});

// setup a route to listen on /images/add
app.get("/images/add", ensureLogin, function(req,res){
  res.render("addImage");
});

// setup a route to listen on /images
app.get("/images", ensureLogin, function(req,res){
  fs.readdir("./public/images/uploaded", function(err, items) {
    res.render("images", {images:items});
  });
});

// setup a route to listen on /departments/add
app.get("/departments/add", ensureLogin, function(req,res){
  res.render("addDepartment", {title: "Department"});
});

// new route to get department by departmentId
app.get("/department/:departmentId", ensureLogin, (req, res) => {
  data_service.getDepartmentById(req.params.departmentId).then((data) => {
    res.render("department", {data: data});
  }).catch((err) => {
    res.status(404).send("Department Not Found");
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory");
});
// post routes
app.post("/employees/add", ensureLogin, (req, res) => {
  data_service.addEmployee(req.body).then((data) => {
    res.redirect("/employees");
    }).catch((err) => {
    console.log(err);
  });
});

app.post("/employee/update", ensureLogin, (req, res) => {
  data_service.updateEmployee(req.body).then(() => {
    res.redirect("/employees");
  }).catch((err) => {
    console.log(err);
  });
});
 
app.post("/departments/add", ensureLogin, (req, res) => {
  data_service.addDepartment(req.body).then(() => {
    res.redirect("/departments");
  }).catch((err) => {
    console.log(err);
  });
});

app.post("/departments/update", ensureLogin, (req, res) => {
  data_service.updateDepartment(req.body).then(() => {
    res.redirect("/departments");
  }).catch((err) => {
    console.log(err);
  });
});

app.post("/register", (req, res) => {
  dataServiceAuth.registerUser(req.body)
  .then(() => {
    res.render("register", {successMessage: "User created"});
  })
  .catch((err) => {
    res.render("register", {errorMessage: err, userName: req.body.userName});
  });
});

app.post("/login", (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  dataServiceAuth.checkUser(req.body)
  .then((user) => {
    req.session.user = {
    userName: user.userName,
    email: user.email,
    loginHistory: user.loginHistory
    }
    res.redirect('/employees');
   })
  .catch((err) => {
    res.render("login", {errorMessage: err, userName: req.body.userName});
  });
});

// setup custom 404 page
app.use((req,res) => {
  res.status(404).send("Cannot find the page!!!");
});

// setup http server to listen on HTTP_PORT
data_service.initialize()
.then(dataServiceAuth.initialize)
.then(function(){
 app.listen(HTTP_PORT, function(){
 console.log("app listening on: " + HTTP_PORT)
 });
}).catch(function(err){
 console.log("unable to start server: " + err);
});

