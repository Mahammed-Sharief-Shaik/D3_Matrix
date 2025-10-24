import mongoose from "mongoose";

const employeeIdRegex = /^[A-Z]{2}[0-9]{4}$/;

const EmployeeSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            required: [true, 'Employee ID is required.'],
            unique: true,
            uppercase: true, // Automatically converts to uppercase
            trim: true,      // Removes whitespace
            // Enforce the Alphanumeric format (2 letters + 4 digits)
            match: [
                employeeIdRegex, 
                'Employee ID must be in the format: 2 letters followed by 4 digits (e.g., AP0001).'
            ],
            // Set index for fast lookup
            index: true 
        },
        password: {
            type: String,
            required: [true, 'Password is required.'],
            // Minimum length is generally recommended for security
            minlength: [6, 'Password must be at least 6 characters long.'] 
        }
    },
    { 
        timestamps: true // Adds createdAt and updatedAt fields automatically
    }
);

// Optional: Export the Model for use in your application
const Employee = mongoose.model('Employee', EmployeeSchema);
export default Employee;