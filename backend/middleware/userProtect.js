import mongoose from "mongoose";
import Staff from "../models/userModels/staff.model.js";

export const user_verification = async (req, res, next) => {

    const {user} = req.body;

    if (!user) {
        return res.status(500).json({message: "UnAuthorized"})
    }

    if (!mongoose.Types.ObjectId.isValid(user)) {
        return res.status(500).json({ message: "Request not valid" });
      }

    // Check if staff exist
    const staffExists = await Staff.findById(user);
    if (!staffExists) {
      return res.status(500).json({ message: "Request not valid" });
    }

    if (!staffExists.active) {
      return res.status(500).json({ message: "Request not valid" });
    }

    
    next();
}

export const admin_verification = async (req, res, next) => {

  const {user} = req.body;

  if (!user) {
      return res.status(500).json({message: "UnAuthorized"})
  }

  if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(500).json({ message: "User not valid" });
    }

  // Check if staff exist
  const staffExists = await Staff.findById(user);
  if (!staffExists) {
    return res.status(500).json({ message: "Staff does not exist" });
  }

  if (staffExists.role === "Management" || staffExists.fullaccess) {
      req.body.isAllowed = true;
  }

  
  next();
}