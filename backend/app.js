import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/db.js';
import connectCloudinary from './config/cloudinary.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRouter from './routes/appointmentRoutes.js'; // Check import name later

const app = express();

connectDB();
connectCloudinary();

// Middleware
app.use(cors());
app.use(express.json());

import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Routes
app.use("/api/admin", adminRoutes); // Mounted Admin Routes
app.use("/api/doctors", doctorRoutes);
app.use("/api/user", userRoutes);
app.use("/api/appointments", appointmentRouter);

app.get('/', (req, res) => {
    res.send('Doctor Appointment Backend is running');
});

export default app;
