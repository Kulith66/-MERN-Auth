import express from 'express';
import cookieParser from 'cookie-parser';
import { connectDB } from "./db/db.js";
import dotenv from "dotenv";
import cors from 'cors';
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import attachmentRoutes from "./routes/attachmentRoutes.js"
import leaveRoutes from "./routes/leaveRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

// Connect to the database
connectDB();

// CORS configuration
app.use(cors({
    origin: 'http://localhost:5173', // Replace with your frontend's origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

// Test route
app.get("/test", (req, res) => {
    res.json({ message: "Hello, World!" });
});

// Define routes
app.use("/api/auth", authRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/attachment", attachmentRoutes);
app.use("/api/leave", leaveRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
