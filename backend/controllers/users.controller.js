import mongoose from "mongoose";

import Staff from "../models/userModels/staff.model.js";
import Customer from "../models/userModels/customer.model.js";

import { io } from "../socket/socket.js";

// ! GETTERS

// get staff
export const get_all_staff = async (req, res) => {
  try {
    const staffs = await Staff.find({}).select("-password");
    res.json({ staffs });
  } catch (error) {
    console.log("Error in get_all_staff controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// get customer
export const get_all_customer = async (req, res) => {
  try {
    const customers = await Customer.find({});
    res.json({ customers });
  } catch (error) {
    console.log("Error in get_all_customer controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// ! SETTERS

// Add/update staff
export const add_update_staff = async (req, res) => {
  const { id, staffId, fullname, nickName, role, fullaccess, backDate } =
    req.body;

  // verify fields
  if (!staffId || !fullname || !nickName || !role) {
    return res.status(500).json({ message: "All fields are required" });
  }

  // verify role
  if (
    role !== "Management" &&
    role !== "Production" &&
    role !== "Sales" &&
    role !== "Terminal" &&
    role !== "Admin"
  ) {
    return res.status(500).json({ message: "Invalid role" });
  }

  try {
    // if id is undefined CREATE
    if (!id) {
      const staffIdExists = await Staff.findOne({ staffId });

      // if name already exist return error
      if (staffIdExists) {
        return res.status(500).json({ message: "Staff ID not available" });
      }

      const staff = await Staff.create({
        staffId,
        fullname,
        nickName,
        role,
        fullaccess,
        backDate,
      });

      staff.password = undefined;

      res.json({ message: "Staff Created Successfully", staff });
    }

    // else UPDATE
    else {
      // check if _id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "ID not valid" });
      }

      // Check if staff exist
      const staffExists = await Staff.findById(id);
      if (!staffExists) {
        return res.status(500).json({ message: "Staff does not exist" });
      }

      const staff = await Staff.findByIdAndUpdate(
        id,
        {
          staffId,
          fullname,
          nickName,
          role,
          fullaccess,
          backDate,
        },
        { new: true },
      );

      staff.password = undefined;

      //? emit
      io.emit(staffId);

      res.json({ message: "Staff Updated Successfully", staff });
    }

    //? emit
    io.emit("Staff");
  } catch (error) {
    console.log("Error in add_update_staff: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Add/Update customers
export const add_update_customer = async (req, res) => {
  const {
    id,
    fullname,
    nickName,
    contactPhone,
    address,
    gender,
    birthday,
    customerType,
  } = req.body;

  // verify fields
  if (!fullname || !customerType || !gender) {
    return res.status(500).json({ message: "Enter all required fields" });
  }

  // verify customerType
  if (
    customerType !== "Store" &&
    customerType !== "Terminal" &&
    customerType !== "Online"
  ) {
    return res.status(500).json({ message: "Invalid customer type" });
  }

  // verify gender
  if (gender !== "Male" && gender !== "Female") {
    return res.status(500).json({ message: "Invalid gender" });
  }

  try {
    // if id is undefined CREATE
    if (!id) {
      const customerExists = await Customer.findOne({ fullname });

      // if name already exist return error
      if (customerExists) {
        return res.status(500).json({ message: "This Customer exists" });
      }

      const customer = await Customer.create({
        fullname,
        nickName,
        contactPhone,
        address,
        gender,
        birthday,
        customerType,
      });

      res.json({ message: "Customer Created Successfully", customer });
    }

    // else UPDATE
    else {
      // check if id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "ID not valid" });
      }

      // Check if customer exist
      const customerExists = await Customer.findById(id);
      if (!customerExists) {
        return res.status(500).json({ message: "Customer does not exist" });
      }

      const customer = await Customer.findByIdAndUpdate(
        id,
        {
          fullname,
          nickName,
          contactPhone,
          address,
          gender,
          birthday,
          customerType,
        },
        { new: true },
      );
      res.json({ message: "Customer Updated Successfully", customer });
    }

    //? emit
    io.emit("Customer");
  } catch (error) {
    console.log("Error in add_update_customer: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// ! REMOVALS

// delete staff
export const delete_staff = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(500).json({ message: "Staff ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Staff ID not valid" });
  }

  // Check if staff exist
  const staffExists = await Staff.findById(id);
  if (!staffExists) {
    return res.status(500).json({ message: "Staff does not exist" });
  }

  try {
    await Staff.findByIdAndDelete(id);

    //? emit
    io.emit("Staff");

    res.json({ message: "Staff deleted Sucessfully" });
  } catch (error) {
    console.log("Error in delete_staff: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// delete customer
export const delete_customer = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(500).json({ message: "Customer ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Customer ID not valid" });
  }

  // Check if customer exist
  const customerExists = await Customer.findById(id);
  if (!customerExists) {
    return res.status(500).json({ message: "Customer does not exist" });
  }

  try {
    await Customer.findByIdAndDelete(id);

    //? emit
    io.emit("Customer");

    res.json({ message: "Customer deleted Sucessfully" });
  } catch (error) {
    console.log("Error in delete_customer: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// ! AUTH



//
