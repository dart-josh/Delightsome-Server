import bcrypt from "bcryptjs";
import { get_connected_users } from "../socket/socket.js";

import Staff from "../models/userModels/staff.model.js";

// get online users
export const get_online_users = async (req, res) => {
  const onlineUsers = get_connected_users();

  try {
    // find online users from database
    const onlineUsersDb = await Staff.find({
      staffId: { $in: onlineUsers },
    }).select("nickName role staffId fullname");
    res.json({ onlineUsersDb });
  } catch (error) {
    console.log("Error in get_online_users controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// login
export const login = async (req, res) => {
  const { staffId, password } = req.body;

  if (!staffId || !password) {
    return res.status(500).json({ message: "Enter all required fields" });
  }

  // password must be at least 6 characters
  if (password.length < 6) {
    return res
      .status(500)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    const staffExists = await Staff.findOne({ staffId });
    if (!staffExists) {
      return res.status(500).json({ message: "Staff does not exist" });
    }

    // if password does not exist create a new one
    if (!staffExists.password) {
      const salt = await bcrypt.genSalt(10);
      staffExists.password = await bcrypt.hash(password, salt);
      await staffExists.save();
      return res.status(200).json({ message: "Password created successfully" });
    }

    const isMatch = await bcrypt.compare(password, staffExists.password);
    if (!isMatch) {
      return res.status(500).json({ message: "Incorrect password" });
    }

    // remove password
    staffExists.password = undefined;

    // login
    return res
      .status(200)
      .json({ message: "Login Successful", staffExists, success: true });
  } catch (error) {
    console.log("Error in login: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// reset password
export const reset_password = async (req, res) => {
  const { id: staffId } = req.params;

  if (!staffId) {
    return res.status(500).json({ message: "Staff ID is required" });
  }

  try {
    const staffExists = await Staff.findOne({ staffId });
    if (!staffExists) {
      return res.status(500).json({ message: "Staff does not exist" });
    }

    // delete password from database
    staffExists.password = null;
    await staffExists.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.log("Error in reset_password: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// get active staff
export const get_active_staff = async (req, res) => {
  const { id: staffId } = req.params;

  if (!staffId) {
    return res.status(500).json({ message: "Staff ID is required" });
  }

  try {
    const staffExists = await Staff.findOne({ staffId });
    if (!staffExists) {
      return res.status(500).json({ message: "Staff does not exist" });
    }

    return res.status(200).json({staff: staffExists, success: true});
  } catch (error) {
    console.log("Error in get_active_staff: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};
