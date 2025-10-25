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

router.get('/display-data', async (req, res) => {
    try {
        // 1. Send GET request to the ML service
        const mlResponse = await fetch(ML_SERVICE_URL);

        // Check if the response was successful
        if (!mlResponse.ok) {
            // Throw an error if the HTTP status is not 2xx
            throw new Error(`ML Service HTTP error! status: ${mlResponse.status}`);
        }

        // 2. Parse the JSON data from the response
        const data = await mlResponse.json();

        // 3. Send the received data back to the frontend client
        // Express's res.json() will automatically set the Content-Type to application/json
        res.json(data);

    } catch (error) {
        console.error('Error fetching data from ML service:', error.message);

        // Send an error response back to the frontend
        res.status(500).json({ 
            message: "Failed to retrieve data from the external service.",
            error: error.message 
        });
    }
});


/**
 * Route 2: POST /api/karthik/predict
 * Purpose: Receive data from the frontend and forward it to the ML service.
 */
router.post('/predict', async (req, res) => {
    // Data received from the client (req.body)
    const frontendData = req.body;

    try {
        // 1. Forward the POST request to the external ML service using axios
        // Axios is smart enough to stringify the body data and set the Content-Type header
        // when sending an object as the second argument to axios.post
        const mlResponse = await axios.post(ML_SERVICE_URL, frontendData, {
            headers: {
                // 'Content-Type': 'application/json' is usually handled automatically,
                // but you can specify custom headers like authorization here:
                // 'Authorization': 'Bearer YOUR_TOKEN'
            }
        });

        // 2. Axios automatically checks for successful status codes (2xx) and throws an
        // error for non-2xx codes, so no separate 'if (!mlResponse.ok)' check is needed.
        
        // The actual response data is in the '.data' property of the axios response object
        const predictionResult = mlResponse.data;

        // 3. Send the final result back to the original client
        res.status(200).json({
            message: 'Prediction successfully received from ML service.',
            data: predictionResult,
        });

    } catch (error) {
        // This catch block handles both connection errors AND non-2xx responses from the ML service
        console.error('Error during prediction forwarding:', error.message);

        // Check if the error is an HTTP error (i.e., the service responded with 4xx/5xx)
        if (error.response) {
            // Forward the error status and response data/message from the ML service
            const status = error.response.status;
            const errorData = error.response.data || { message: 'ML Service returned an error.' };
            
            return res.status(status).json(errorData);

        } else if (error.request) {
            // The request was made but no response was received (e.g., network timeout/service down)
            res.status(503).json({ 
                message: 'ML Service is currently unavailable or unreachable.', 
                error: error.message 
            });
        } else {
            // Something happened in setting up the request that triggered an Error
            res.status(500).json({ 
                message: 'An unexpected error occurred while setting up the request.', 
                error: error.message 
            });
        }
    }
});

export default router;