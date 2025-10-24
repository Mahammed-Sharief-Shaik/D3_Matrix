// authRoutes.js
import express from 'express';
import Employee from '../models/Employee.js';
const router = express.Router();

// The base path for this router is already defined as '/api/auth' 
// in your main application file (server.js/app.js).
// Therefore, the complete path for this route is POST /api/auth/login

const loginEmployee = async (req, res) => {
    const { employeeId, password } = req.body;

    // 1. Basic Validation
    if (!employeeId || !password) {
        return res.status(400).json({ message: 'Please provide both employeeId and password.' });
    }

    try {
        // 2. Find the employee by their ID
        const employee = await Employee.findOne({ employeeId });

        if (!employee) {
            return res.status(401).json({ message: 'Invalid credentials (Employee ID not found).' });
        }

        // 3. Compare the provided password with the hashed password in the database
        // NOTE: This assumes you have previously hashed the password when the user registered!
        const isMatch = await bcrypt.compare(password, employee.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials (Incorrect password).' });
        }

        
        return res.status(200).json({
            message: 'Login successful!',
            employeeId: employee.employeeId,
            // token: token // Return the generated token
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login process.' });
    }
};

router.post('/login', loginEmployee);

export default router;