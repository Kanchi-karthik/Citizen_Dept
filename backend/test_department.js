const Department = require("./models/Department");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "❌ MongoDB connection error:"));
db.once("open", async () => {
  console.log("✅ MongoDB Connected Successfully");
  
  try {
    // Create a test department
    const departmentData = {
      departmentName: "Test Department",
      departmentCode: "TEST002",
      headName: "Test Head",
      contactEmail: "test2@email.com",
      contactNumber: "1234567891",
      city: "Test City",
      state: "Test State",
      address: "Test Address",
      description: "Test Description",
      establishedYear: 2020,
      employeeCount: 10,
      isActive: true
    };
    
    // Generate a default password
    const defaultPassword = Math.random().toString(36).slice(-8);
    console.log('Generating default password:', defaultPassword);
    departmentData.password = await bcrypt.hash(defaultPassword, 10);
    
    console.log('Department data to save:', departmentData);
    
    const department = new Department(departmentData);
    console.log('Department object created');
    
    await department.save();
    console.log('Department saved successfully');
    
    console.log('Created department:', department.toObject());
    
    // Close connection
    mongoose.connection.close();
  } catch (err) {
    console.error('Error creating department:', err);
  }
});