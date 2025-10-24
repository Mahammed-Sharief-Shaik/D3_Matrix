// mlRoutes.js
import express from 'express';
// Assuming the external prediction service runs at this URL
const ML_SERVICE_URL = 'http://localhost:8000/api/karthik/predict';

const router = express.Router();

/**
 * Route 1: GET /api/karthik/predict
 * Purpose: Simple status check.
 */
router.get('/predict', (req, res) => {
    res.status(200).json({ 
        message: 'I am working! Ready to receive a POST request to predict.' 
    });
});

/**
 * Route 2: POST /api/karthik/predict
 * Purpose: Receive data from the frontend and forward it to the ML service.
 */
router.post('/predict', async (req, res) => {
    // Data received from the client (req.body)
    const frontendData = req.body;

    // Expected data structure from your frontend:
    // { 
    //   population: 2.1, 
    //   economic: 3.2, 
    //   renewable: 28, 
    //   efficiency: 'Medium', 
    //   climate: 'Moderate' 
    // }

    try {
        // --- Forward the POST request to the external ML service ---
        const mlResponse = await fetch(ML_SERVICE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any necessary API keys or authorization headers here
            },
            body: JSON.stringify(frontendData),
        });

        // Check if the ML service responded successfully (200-299 status code)
        if (!mlResponse.ok) {
            // Forward the error status and message from the ML service
            const errorText = await mlResponse.text();
            return res.status(mlResponse.status).json({ 
                message: `ML Service Error: ${errorText}` 
            });
        }

        // Get the prediction result from the ML service response
        const predictionResult = await mlResponse.json();

        // Send the final result back to the original client
        res.status(200).json({
            message: 'Prediction successfully received from ML service.',
            data: predictionResult,
        });

    } catch (error) {
        console.error('Error during prediction forwarding:', error);
        // Handle connection failure to the external service
        res.status(500).json({ 
            message: 'Failed to connect to the external ML Prediction service.', 
            error: error.message 
        });
    }
});

export default router;