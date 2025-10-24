import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import connectDB from "./db/connectDB.js"
import Employee from "./models/Employee.js"

const app = express()
dotenv.config()
const PORT = process.env.PORT;
const DB_URL = process.env.DB_URL;

connectDB(DB_URL);

app.get(
    '/',
    (req, res) => {
        res.send("hello")
    }
)

app.listen(PORT,
    () => {
        console.log("listening to port ",PORT);
    }
)