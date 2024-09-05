import express from 'express';
import  { connectDB } from "./db/db.js";
import dotenv from "dotenv"
import authRoutes from "./routes/authRoutes.js"

dotenv.config()
const app = express();
const PORT = process.env.PORT || 5000
app.use(express.json());

connectDB()

app.get("/test", (req, res) => {
    res.json({ message: "Hello, World!" });


});

app.use("/api/auth",authRoutes)

app.listen(PORT, () => {
    console.log('Server is running on port port 5000');
});

