import doctorModel from '../models/Doctor.js';
import generateToken from '../utils/generateToken.js';

// Auth User/Doctor
const authUser = async (req, res) => {
    // This logic might be redundant if using Supabase on frontend
    // But implementation requested.
    res.json({ message: "Auth User" });
};

export { authUser };
