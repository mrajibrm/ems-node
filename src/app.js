const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const path = require('path'); // Import the path module



const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

//Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Handlebars Middleware
// app.engine("hbs", exphbs({ defaultLayout: "main", extname: ".hbs" }));
app.set("view engine", "hbs");



//MongoDB Connection
mongoose.connect("mongodb://localhost:27017/employeeDB", { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
// print if db connection successful
db.once("open", () => {
    console.log("MongoDB Connected Successfully");
})
// print if db connection is failed
db.on("error", console.error.bind(console, "MongoDB Connection Error"));



//Define Employee Schemas
const employeeSchema = new mongoose.Schema({
emp_id:{
    type: String,
    unique: true}, // Unique Employee Id
    name:{
        type: String,
        required: true
    },
    position:{
        type: String,
        required: true

    },
    salary:{
        type: Number,
        required: true
    }
});

// Pre-save middleware to generate unique random emp_id
employeeSchema.pre("save", function(next){
    const empIdLenth = 6; // Length of Employee Id
    let empId = '';
    for (let i=0; i<empIdLenth; i++){
        empId += Math.floor(Math.random() * 10); // Random Number Between 0-9
    }
    this.emp_id = empId; // Assign generated emp_id to the employee document
    next();
    })

const Employee  = mongoose.model("Employee", employeeSchema);

// Route
app.get("/", (req, res) => {
    Employee.find()
    .then(employees => {
        res.render("view_employee", {employees});
        console.log(employees);
    })
    .catch(err => res.status(400).json("Error: ${err}"));

});

// Add New Employee

app.get("/addEmployeeForm",(req, res) =>{
    res.render("add_employee");
    
});


app.post("/addEmployee", (req, res) => {
    const newEmployee = new Employee(req.body);
    newEmployee.save()
    // Show that employee saved with the Id number
    // .then(employee => res.json("Employee added with ID: ${employee._id"))
    .then(() => {
        const message = `${req.body.name} added with emp_id ${newEmployee.emp_id}`;
        console.log(message); //  Log the message to the console
        res.render("view_employee", {message, employess:[newEmployee]}); // Render the view with success message

    })
    .catch(err => res.status(400).json("Error: ${err}"));
});


//Update an Employee
app.get("/updateEmployeeForm", (req, res) =>{
    res.render("update_employee");
});

app.post('/updateEmployee/:emp_id', (req, res) => {
    const empId = req.params.emp_id;

    Employee.findOneAndUpdate({emp_id: empId }, req.body, {new: true})
    .then(updatedEmployee => {
        if (!updatedEmployee){
        return res.status(404).json({message: "Employee not found"});
    }
    const message = `${updatedEmployee.name} with ${emp_id} updated successfully`;
    console.log(message); // Log the message to the console
    res.render("view_employee", {message, employees:[updatedEmployee]}); // Render the view with success message
    })
    .catch(err => res.status(400).json("Error: ${err}"));
});






// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})