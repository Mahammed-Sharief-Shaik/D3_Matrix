import express from "express"
import dotenv from "dotenv"
import connectDB from "./db/connectDB.js"
import authRoutes from './routes/authRoutes.js'
import mlRoutes from "./routes/mlRoutes.js"
const app = express()
dotenv.config()
const PORT = process.env.PORT;
const DB_URL = process.env.DB_URL;

connectDB(DB_URL);
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/karthik', mlRoutes);
app.get(
    '/api',
    (req, res) => {
        res.send("hello")
    }
)

app.listen(PORT,
    () => {
        console.log("listening to port ",PORT);
    }
)