import mongoose from "mongoose";

import ProductMaterials from "../models/materialModels/productMaterials.model.js";
import ProductMaterialsCategory from "../models/materialModels/productMaterialsCategory.model.js";
import RawMaterialsCategory from "../models/materialModels/rawMaterialsCategory.model.js";
import RawMaterials from "../models/materialModels/rawMaterials.model.js";
import RestockProductMaterialsRecord from "../models/materialModels/restockProductMaterials.model.js";
import RestockRawMaterialsRecord from "../models/materialModels/restockRawMaterials.model.js";
import ProductMaterialsRequestRecord from "../models/materialModels/productMaterialsRequest.model.js";
import RawMaterialsRequestRecord from "../models/materialModels/rawMaterialsRequest.model.js";
import { io } from "../socket/socket.js";
import { nanoid } from "nanoid";

// ! GETTERS

// Get product materials
export const get_product_materials = async (req, res) => {
  try {
    const items = await ProductMaterials.find({});
    res.json({ items });
  } catch (error) {
    console.log("Error in get_product_materials controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// Get raw materials
export const get_raw_materials = async (req, res) => {
  try {
    const items = await RawMaterials.find({});
    res.json({ items });
  } catch (error) {
    console.log("Error in get_raw_materials controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// Get Product materials restock record
export const get_restock_product_materials_record = async (req, res) => {
  // start
  var localDate = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
    new Date().getHours() + 1,
    new Date().getMinutes(),
    new Date().getSeconds(),
    new Date().getMilliseconds(),
  );

  // end 3 months ago
  var threeMonthAgo = new Date(
    new Date().getFullYear(),
    new Date().getMonth() - 3,
    1,
  );

  // convert date to local timezone
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());

  threeMonthAgo.setMinutes(
    threeMonthAgo.getMinutes() - threeMonthAgo.getTimezoneOffset(),
  );

  const query = {
    $and: [
      { recordDate: { $lte: localDate } },
      { recordDate: { $gte: threeMonthAgo } },
    ],
  };

  try {
    const record = await RestockProductMaterialsRecord.find(query)
      .sort({ recordDate: -1 })
      .populate({
        path: "items.item",
        select: ["itemName", "category"],
      })
      .populate({
        path: "receiver",
        select: ["nickName", "role", "staffId"],
      })
      .populate({
        path: "editedBy.staff",
        select: ["nickName", "role", "staffId"],
      })
      .populate({
        path: "verifiedBy",
        select: ["nickName", "role", "staffId"],
      });
    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_restock_product_materials_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

//? Get selected Product materials restock record
export const get_selected_restock_product_materials_record = async (
  req,
  res,
) => {
  const { timeFrame, month, date } = req.body;

  let query = {};

  let start;
  let end;

  if (date) {
    query = {
      $match: {
        d: `${date}`,
      },
    };
  } else if (month) {
    query = {
      $match: {
        m: `${month}`,
      },
    };
  } else if (timeFrame) {
    if (!timeFrame || timeFrame.length < 2 || timeFrame.length > 2) {
      return res.status(500).json({ message: "Invalid Entry" });
    }

    start = timeFrame[0];
    end = timeFrame[1];

    query = {
      $match: { dr: true },
    };
  } else {
    return res.status(500).json({ message: "Invalid Entry" });
  }

  try {
    const record = await RestockProductMaterialsRecord.aggregate([
      {
        $addFields: {
          d: { $dateToString: { format: "%Y-%m-%d", date: "$recordDate" } },
          m: { $dateToString: { format: "%Y-%m", date: "$recordDate" } },
        },
      },
      {
        $addFields: timeFrame
          ? {
              dr: { $and: [{ $gte: ["$d", start] }, { $lte: ["$d", end] }] },
            }
          : {},
      },
      { $match: { verified: true } },
      query,
      { $sort: { recordDate: -1 } },
    ]);

    await Promise.all(
      await RestockProductMaterialsRecord.populate(record, {
        path: "items.item",
        select: ["itemName", "category"],
      }),

      await RestockProductMaterialsRecord.populate(record, {
        path: "receiver",
        select: ["nickName", "role", "staffId"],
      }),

      await RestockProductMaterialsRecord.populate(record, {
        path: "editedBy.staff",
        select: ["nickName", "role", "staffId"],
      }),

      await RestockProductMaterialsRecord.populate(record, {
        path: "verifiedBy",
        select: ["nickName", "role", "staffId"],
      }),
    );

    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_selected_restock_product_materials_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// Get raw materials restock record
export const get_restock_raw_materials_record = async (req, res) => {
  // start
  var localDate = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
    new Date().getHours() + 1,
    new Date().getMinutes(),
    new Date().getSeconds(),
    new Date().getMilliseconds(),
  );

  // end 3 months ago
  var threeMonthAgo = new Date(
    new Date().getFullYear(),
    new Date().getMonth() - 3,
    1,
  );

  // convert date to local timezone
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());

  threeMonthAgo.setMinutes(
    threeMonthAgo.getMinutes() - threeMonthAgo.getTimezoneOffset(),
  );

  const query = {
    $and: [
      { recordDate: { $lte: localDate } },
      { recordDate: { $gte: threeMonthAgo } },
    ],
  };

  try {
    const record = await RestockRawMaterialsRecord.find(query)
      .sort({ recordDate: -1 })
      .populate({
        path: "items.item",
        select: ["itemName", "category", "measurementUnit", "storeType"],
      })
      .populate({
        path: "itemsUsed.item",
        select: ["itemName", "category", "measurementUnit", "storeType"],
      })
      .populate({
        path: "receiver",
        select: ["nickName", "role", "staffId"],
      })
      .populate({
        path: "editedBy.staff",
        select: ["nickName", "role", "staffId"],
      })
      .populate({
        path: "verifiedBy",
        select: ["nickName", "role", "staffId"],
      });
    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_restock_raw_materials_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

//? Get selected Raw materials restock record
export const get_selected_restock_raw_materials_record = async (req, res) => {
  const { timeFrame, month, date } = req.body;

  let query = {};

  let start;
  let end;

  if (date) {
    query = {
      $match: {
        d: `${date}`,
      },
    };
  } else if (month) {
    query = {
      $match: {
        m: `${month}`,
      },
    };
  } else if (timeFrame) {
    if (!timeFrame || timeFrame.length < 2 || timeFrame.length > 2) {
      return res.status(500).json({ message: "Invalid Entry" });
    }

    start = timeFrame[0];
    end = timeFrame[1];

    query = {
      $match: { dr: true },
    };
  } else {
    return res.status(500).json({ message: "Invalid Entry" });
  }

  try {
    const record = await RestockRawMaterialsRecord.aggregate([
      {
        $addFields: {
          d: { $dateToString: { format: "%Y-%m-%d", date: "$recordDate" } },
          m: { $dateToString: { format: "%Y-%m", date: "$recordDate" } },
        },
      },
      {
        $addFields: timeFrame
          ? {
              dr: { $and: [{ $gte: ["$d", start] }, { $lte: ["$d", end] }] },
            }
          : {},
      },
      { $match: { verified: true } },
      query,
      { $sort: { recordDate: -1 } },
    ]);

    await Promise.all(
      await RestockRawMaterialsRecord.populate(record, {
        path: "items.item",
        select: ["itemName", "category", "measurementUnit", "storeType"],
      }),

      await RestockRawMaterialsRecord.populate(record, {
        path: "itemsUsed.item",
        select: ["itemName", "category", "measurementUnit", "storeType"],
      }),

      await RestockRawMaterialsRecord.populate(record, {
        path: "receiver",
        select: ["nickName", "role", "staffId"],
      }),

      await RestockRawMaterialsRecord.populate(record, {
        path: "editedBy.staff",
        select: ["nickName", "role", "staffId"],
      }),

      await RestockRawMaterialsRecord.populate(record, {
        path: "verifiedBy",
        select: ["nickName", "role", "staffId"],
      }),
    );

    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_selected_restock_raw_materials_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// Get product materials request record
export const get_product_materials_request_record = async (req, res) => {
  // start
  var localDate = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
    new Date().getHours() + 1,
    new Date().getMinutes(),
    new Date().getSeconds(),
    new Date().getMilliseconds(),
  );

  // end 3 months ago
  var threeMonthAgo = new Date(
    new Date().getFullYear(),
    new Date().getMonth() - 3,
    1,
  );

  // convert date to local timezone
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());

  threeMonthAgo.setMinutes(
    threeMonthAgo.getMinutes() - threeMonthAgo.getTimezoneOffset(),
  );

  const query = {
    $and: [
      { recordDate: { $lte: localDate } },
      { recordDate: { $gte: threeMonthAgo } },
    ],
  };

  try {
    const record = await ProductMaterialsRequestRecord.find(query)
      .sort({ recordDate: -1 })
      .populate({
        path: "items.item",
        select: ["itemName", "category"],
      })
      .populate({
        path: "receiver",
        select: ["nickName", "role", "staffId"],
      })
      .populate({
        path: "editedBy.staff",
        select: ["nickName", "role", "staffId"],
      })
      .populate({
        path: "authorizedBy",
        select: ["nickName", "role", "staffId"],
      });
    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_product_materials_request_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

//? Get selected product materials request record
export const get_selected_product_materials_request_record = async (
  req,
  res,
) => {
  const { timeFrame, month, date } = req.body;

  let query = {};

  let start;
  let end;

  if (date) {
    query = {
      $match: {
        d: `${date}`,
      },
    };
  } else if (month) {
    query = {
      $match: {
        m: `${month}`,
      },
    };
  } else if (timeFrame) {
    if (!timeFrame || timeFrame.length < 2 || timeFrame.length > 2) {
      return res.status(500).json({ message: "Invalid Entry" });
    }

    start = timeFrame[0];
    end = timeFrame[1];

    query = {
      $match: { dr: true },
    };
  } else {
    return res.status(500).json({ message: "Invalid Entry" });
  }

  try {
    const record = await ProductMaterialsRequestRecord.aggregate([
      {
        $addFields: {
          d: { $dateToString: { format: "%Y-%m-%d", date: "$recordDate" } },
          m: { $dateToString: { format: "%Y-%m", date: "$recordDate" } },
        },
      },
      {
        $addFields: timeFrame
          ? {
              dr: { $and: [{ $gte: ["$d", start] }, { $lte: ["$d", end] }] },
            }
          : {},
      },
      { $match: { authorized: true } },
      query,
      { $sort: { recordDate: -1 } },
    ]);

    await Promise.all(
      await ProductMaterialsRequestRecord.populate(record, {
        path: "items.item",
        select: ["itemName", "category"],
      }),

      await ProductMaterialsRequestRecord.populate(record, {
        path: "receiver",
        select: ["nickName", "role", "staffId"],
      }),

      await ProductMaterialsRequestRecord.populate(record, {
        path: "editedBy.staff",
        select: ["nickName", "role", "staffId"],
      }),

      await ProductMaterialsRequestRecord.populate(record, {
        path: "authorizedBy",
        select: ["nickName", "role", "staffId"],
      }),
    );
    // console.log(record);
    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_selected_product_materials_request_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// Get raw materials request record
export const get_raw_materials_request_record = async (req, res) => {
  // start
  var localDate = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
    new Date().getHours() + 1,
    new Date().getMinutes(),
    new Date().getSeconds(),
    new Date().getMilliseconds(),
  );

  // end 3 months ago
  var threeMonthAgo = new Date(
    new Date().getFullYear(),
    new Date().getMonth() - 3,
    1,
  );

  // convert date to local timezone
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());

  threeMonthAgo.setMinutes(
    threeMonthAgo.getMinutes() - threeMonthAgo.getTimezoneOffset(),
  );

  const query = {
    $and: [
      { recordDate: { $lte: localDate } },
      { recordDate: { $gte: threeMonthAgo } },
    ],
  };

  try {
    const record = await RawMaterialsRequestRecord.find(query)
      .sort({ recordDate: -1 })
      .populate({
        path: "items.item",
        select: ["itemName", "category", "measurementUnit", "storeType"],
      })
      .populate({
        path: "receiver",
        select: ["nickName", "role", "staffId"],
      })
      .populate({
        path: "editedBy.staff",
        select: ["nickName", "role", "staffId"],
      })
      .populate({
        path: "authorizedBy",
        select: ["nickName", "role", "staffId"],
      });

    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_raw_materials_request_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

//? Get selected raw materials request record
export const get_selected_raw_materials_request_record = async (req, res) => {
  const { timeFrame, month, date } = req.body;

  let query = {};

  let start;
  let end;

  if (date) {
    query = {
      $match: {
        d: `${date}`,
      },
    };
  } else if (month) {
    query = {
      $match: {
        m: `${month}`,
      },
    };
  } else if (timeFrame) {
    if (!timeFrame || timeFrame.length < 2 || timeFrame.length > 2) {
      return res.status(500).json({ message: "Invalid Entry" });
    }

    start = timeFrame[0];
    end = timeFrame[1];

    query = {
      $match: { dr: true },
    };
  } else {
    return res.status(500).json({ message: "Invalid Entry" });
  }

  try {
    const record = await RawMaterialsRequestRecord.aggregate([
      {
        $addFields: {
          d: { $dateToString: { format: "%Y-%m-%d", date: "$recordDate" } },
          m: { $dateToString: { format: "%Y-%m", date: "$recordDate" } },
        },
      },
      {
        $addFields: timeFrame
          ? {
              dr: { $and: [{ $gte: ["$d", start] }, { $lte: ["$d", end] }] },
            }
          : {},
      },
      { $match: { authorized: true } },
      query,
      { $sort: { recordDate: -1 } },
    ]);

    await Promise.all(
      await RawMaterialsRequestRecord.populate(record, {
        path: "items.item",
        select: ["itemName", "category"],
      }),

      await RawMaterialsRequestRecord.populate(record, {
        path: "receiver",
        select: ["nickName", "role", "staffId"],
      }),

      await RawMaterialsRequestRecord.populate(record, {
        path: "editedBy.staff",
        select: ["nickName", "role", "staffId"],
      }),

      await RawMaterialsRequestRecord.populate(record, {
        path: "authorizedBy",
        select: ["nickName", "role", "staffId"],
      }),
    );

    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_selected_raw_materials_request_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// Get product materials categories
export const get_product_materials_categories = async (req, res) => {
  try {
    const categories = await ProductMaterialsCategory.find({});
    res.json({ categories });
  } catch (error) {
    console.log(
      "Error in get_product_materials_categories controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// Get raw materials categories
export const get_raw_materials_categories = async (req, res) => {
  try {
    const categories = await RawMaterialsCategory.find({});
    res.json({ categories });
  } catch (error) {
    console.log(
      "Error in get_raw_materials_categories controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// ! SETTERS

// Add/Update product materials
export const add_update_product_materials = async (req, res) => {
  // get values from body
  const { id, itemName, category, quantity, restockLimit } = req.body;

  // verify fields
  if (!itemName || !category) {
    return res.status(500).json({ message: "Invalid Entry" });
  }

  // verify category
  const findCategory = await ProductMaterialsCategory.findOne({ category });

  if (!findCategory) {
    return res.status(500).json({ message: "Category not found" });
  }

  try {
    // if id is undefined CREATE
    if (!id) {
      const itemExists = await ProductMaterials.findOne({ itemName });

      // if name already exist return error
      if (itemExists) {
        return res.status(500).json({ message: "Item already exist" });
      }

      const item = await ProductMaterials.create({
        itemName,
        category,
        quantity,
        restockLimit,
      });

      res.json({ message: "Item Created Successfully", item });
    }

    // else UPDATE
    else {
      // check if id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "ID not valid" });
      }

      // Check if item exist
      const itemExists = await ProductMaterials.findById(id);
      if (!itemExists) {
        return res.status(500).json({ message: "Item does not exist" });
      }

      const nameExists = await ProductMaterials.findOne({ itemName });

      // if name already exist return error
      if (nameExists && nameExists._id != id) {
        return res.status(500).json({ message: "Item already exist" });
      }

      const item = await ProductMaterials.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            itemName,
            category,
            quantity,
            restockLimit,
          },
        },
        { new: true },
      );
      res.json({ message: "Item Updated Successfully", item });
    }

    //? emit
    io.emit("ProductMaterials");
  } catch (error) {
    console.log("Error in add_update_product_materials: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Add/Update raw materials
export const add_update_raw_materials = async (req, res) => {
  // get values from body
  const {
    id,
    itemName,
    category,
    quantity,
    restockLimit,
    measurementUnit,
    storeType,
  } = req.body;

  // verify fields
  if (!itemName || !category || !measurementUnit || !storeType) {
    return res.status(500).json({ message: "Invalid Entry" });
  }

  // verify measurementUnit
  if (measurementUnit !== "Weight" && measurementUnit !== "Count") {
    return res.status(500).json({ message: "Invalid Measurement Unit" });
  }

  // verify storeType
  if (storeType !== "Store" && storeType !== "Processed") {
    return res.status(500).json({ message: "Invalid Store Type" });
  }

  // verify category
  const findCategory = await RawMaterialsCategory.findOne({ category });

  if (!findCategory) {
    return res.status(500).json({ message: "Category not found" });
  }

  try {
    // if id is undefined CREATE
    if (!id) {
      const itemExists = await RawMaterials.findOne({ itemName });

      // if name already exist return error
      if (itemExists) {
        return res.status(500).json({ message: "Item already exist" });
      }

      const item = await RawMaterials.create({
        itemName,
        category,
        quantity,
        restockLimit,
        measurementUnit,
        storeType,
      });

      res.json({ message: "Item Created Successfully", item });
    }

    // else UPDATE
    else {
      // check if id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "ID not valid" });
      }

      // Check if item exist
      const itemExists = await RawMaterials.findById(id);
      if (!itemExists) {
        return res.status(500).json({ message: "Item does not exist" });
      }

      const nameExists = await RawMaterials.findOne({ itemName });

      // if name already exist return error
      if (nameExists && nameExists._id != id) {
        return res.status(500).json({ message: "Item already exist" });
      }

      const item = await RawMaterials.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            itemName,
            category,
            quantity,
            restockLimit,
            measurementUnit,
            storeType,
          },
        },
        { new: true },
      );
      res.json({ message: "Item Updated Successfully", item });
    }

    //? emit
    io.emit("RawMaterials");
  } catch (error) {
    console.log("Error in add_update_raw_materials: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

//? Restock product materials record
export const enter_restock_product_materials_record = async (req, res) => {
  // get values from body
  const { id, receiver, items, shortNote, editedBy, date } = req.body;

  // verify all fields
  if (!receiver || !items || !date) {
    return res.status(500).json({ message: "Invalid Entry" });
  }

  // check if date is valid
  if (!new Date(date)) {
    return res.status(500).json({ message: "Invalid Date" });
  }

  // verify date
  if (new Date(date) > new Date()) {
    return res.status(500).json({ message: "Invalid Date" });
  }

  const recordDate = new Date(date);

  // convert date to local timezone
  recordDate.setMinutes(
    recordDate.getMinutes() - recordDate.getTimezoneOffset(),
  );

  // verify items
  if (items.length < 1) {
    return res.status(500).json({ message: "No Items" });
  }

  // Verfiy each item field
  for (let i = 0; i < items.length; i++) {
    if (!items[i].item || !items[i].quantity) {
      return res.status(500).json({ message: "Invalid Item Entry" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(items[i].item)) {
      return res.status(500).json({ message: "Invalid Item found" });
    }

    // Check if item exist
    const itemExists = await ProductMaterials.findById(items[i].item);
    if (!itemExists) {
      return res.status(500).json({ message: "Invalid Item Entry" });
    }
  }

  try {
    // if id is undefined CREATE
    if (!id) {
      const record = await RestockProductMaterialsRecord.create({
        receiver,
        items,
        shortNote,
        recordDate: recordDate.toISOString(),
        recordId: generate_record_id(),
      });

      res.json({ message: "Product Materials Entry Submitted", record });
    }

    // else UPDATE
    else {
      // check if id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "Record ID not valid" });
      }

      // Check if record exist
      const recordFind = await RestockProductMaterialsRecord.findById(id);
      if (!recordFind) {
        return res.status(500).json({ message: "Record does not exist" });
      }

      // Check if editedBy
      if (!editedBy) {
        return res.status(500).json({ message: "Invalid Entry" });
      }

      // Check if record is verified
      if (recordFind.verified) {
        return res.status(500).json({ message: "Record verified already" });
      }

      //  Edit record
      const record = await RestockProductMaterialsRecord.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            receiver,
            items,
            shortNote,
            isEdited: true,
            recordDate: recordDate.toISOString(),
          },
          $push: {
            editedBy: {
              staff: editedBy,
            },
          },
        },
        { new: true },
      );
      res.json({ message: "Product Materials Entry Updated", record });
    }

    //? emit
    io.emit("RestockProductMaterialsRecord");
  } catch (error) {
    console.log(
      "Error in enter_restock_product_materials_record: ",
      error.message,
    );
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Verify restock product materials record
export const verify_restock_product_materials_record = async (req, res) => {
  const { id, verifiedBy } = req.body;

  // verify all input
  if (!id || !verifiedBy) {
    return res.status(500).json({ message: "Invalid Verification" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Record ID not valid" });
  }

  // Check if record exist
  const record = await RestockProductMaterialsRecord.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // Check if record is verified
  if (record.verified) {
    return res.status(500).json({ message: "Record verified already" });
  }

  //  get items
  const items = record.items;

  // verify items
  if (!items || items.length < 1) {
    return res.status(500).json({ message: "Record contains No items" });
  }

  // verify each item
  for (let index = 0; index < items.length; index++) {
    const item = items[index];

    if (!item.item || !item.quantity) {
      return res.status(500).json({ message: "Invalid item found" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(item.item)) {
      return res.status(500).json({ message: "Invalid item found" });
    }

    // Check if item exist
    const itemExists = await ProductMaterials.findById(item.item);
    if (!itemExists) {
      return res.status(500).json({ message: "Invalid item found" });
    }
  }

  // Update all items (increase quantity)
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    await update_product_materials_item_quantity(
      item.item,
      item.quantity,
      true,
    );
  }

  const date = new Date();
  // convert date to local timezone
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  // Update record
  try {
    const record = await RestockProductMaterialsRecord.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          verifiedBy,
          verified: true,
          verifiedDate: date,
        },
      },
      { new: true },
    );

    //? emit
    io.emit("ProductMaterials");
    io.emit("RestockProductMaterialsRecord");

    res.json({ message: "Product Materials Entry Verified", record });
  } catch (error) {
    console.log(
      "Error in verify_restock_product_materials_record: ",
      error.message,
    );
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

//? Restock raw materials record
export const enter_restock_raw_materials_record = async (req, res) => {
  // get values from body
  const { id, receiver, items, itemsUsed, shortNote, editedBy, date } =
    req.body;

  // verify all fields
  if (!receiver || !items || !date) {
    return res.status(500).json({ message: "Invalid Entry" });
  }

  // check if date is valid
  if (!new Date(date)) {
    return res.status(500).json({ message: "Invalid Date" });
  }

  // verify date
  if (new Date(date) > new Date()) {
    return res.status(500).json({ message: "Invalid Date" });
  }

  const recordDate = new Date(date);

  // convert date to local timezone
  recordDate.setMinutes(
    recordDate.getMinutes() - recordDate.getTimezoneOffset(),
  );

  // verify items
  if (items.length < 1) {
    return res.status(500).json({ message: "No Items" });
  }

  // Verfiy each item field
  for (let i = 0; i < items.length; i++) {
    if (!items[i].item || !items[i].quantity) {
      return res.status(500).json({ message: "Invalid Item Entry" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(items[i].item)) {
      return res.status(500).json({ message: "Invalid Item found" });
    }

    // Check if item exist
    const itemExists = await RawMaterials.findById(items[i].item);
    if (!itemExists) {
      return res.status(500).json({ message: "Invalid Item Entry" });
    }
  }

  // if itemsUsed
  // Verfiy each itemUsed field
  if (itemsUsed && itemsUsed.length > 0) {
    for (let i = 0; i < itemsUsed.length; i++) {
      if (!itemsUsed[i].item || !itemsUsed[i].quantity) {
        return res.status(500).json({ message: "Invalid Item Entry" });
      }

      // check if id is valid
      if (!mongoose.Types.ObjectId.isValid(itemsUsed[i].item)) {
        return res.status(500).json({ message: "Invalid Item found" });
      }

      // Check if item exist
      const itemExists = await RawMaterials.findById(itemsUsed[i].item);
      if (!itemExists) {
        return res.status(500).json({ message: "Invalid Item Entry" });
      }
    }
  }

  try {
    // if id is undefined CREATE
    if (!id) {
      const record = await RestockRawMaterialsRecord.create({
        receiver,
        items,
        itemsUsed,
        shortNote,
        recordDate: recordDate.toISOString(),
        recordId: generate_record_id(),
      });

      res.json({ message: "Raw Materials Entry Submitted", record });
    }

    // else UPDATE
    else {
      // check if id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "Record ID not valid" });
      }

      // Check if record exist
      const recordFind = await RestockRawMaterialsRecord.findById(id);
      if (!recordFind) {
        return res.status(500).json({ message: "Record does not exist" });
      }

      // Check if editedBy
      if (!editedBy) {
        return res.status(500).json({ message: "Invalid Entry" });
      }

      // Check if record is verified
      if (recordFind.verified) {
        return res.status(500).json({ message: "Record verified already" });
      }

      //  Edit record
      const record = await RestockRawMaterialsRecord.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            receiver,
            items,
            itemsUsed,
            shortNote,
            recordDate: recordDate.toISOString(),
            isEdited: true,
          },
          $push: {
            editedBy: {
              staff: editedBy,
            },
          },
        },
        { new: true },
      );
      res.json({ message: "Raw Materials Entry Updated", record });
    }

    //? emit
    io.emit("RestockRawMaterialsRecord");
  } catch (error) {
    console.log("Error in enter_restock_raw_materials_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Verify raw product materials record
export const verify_restock_raw_materials_record = async (req, res) => {
  const { id, verifiedBy } = req.body;

  // verify all input
  if (!id || !verifiedBy) {
    return res.status(500).json({ message: "Invalid Verification" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Record ID not valid" });
  }

  // Check if record exist
  const record = await RestockRawMaterialsRecord.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // Check if record is verified
  if (record.verified) {
    return res.status(500).json({ message: "Record verified already" });
  }

  //  get items
  const items = record.items;

  // verify items
  if (!items || items.length < 1) {
    return res.status(500).json({ message: "Record contains No items" });
  }

  // verify each item
  for (let index = 0; index < items.length; index++) {
    const item = items[index];

    if (!item.item || !item.quantity) {
      return res.status(500).json({ message: "Invalid item found" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(item.item)) {
      return res.status(500).json({ message: "Invalid item found" });
    }

    // Check if item exist
    const itemExists = await RawMaterials.findById(item.item);
    if (!itemExists) {
      return res.status(500).json({ message: "Invalid item found" });
    }
  }

  const itemsUsed = record.itemsUsed;

  // if itemUsed
  // verify each items used
  if (itemsUsed && itemsUsed.length > 0) {
    for (let index = 0; index < itemsUsed.length; index++) {
      const item = itemsUsed[index];

      if (!item.item || !item.quantity) {
        return res.status(500).json({ message: "Invalid item found" });
      }

      // check if id is valid
      if (!mongoose.Types.ObjectId.isValid(item.item)) {
        return res.status(500).json({ message: "Invalid item found" });
      }

      // Check if item exist
      const itemExists = await RawMaterials.findById(item.item);
      if (!itemExists) {
        return res.status(500).json({ message: "Invalid item found" });
      }
    }
  }

  // Update all items (increase quantity)
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    await update_raw_materials_item_quantity(item.item, item.quantity, true);
  }

  // if itemUsed
  // Update all itemsUsed (decrease quantity)
  if (itemsUsed && itemsUsed.length > 0) {
    for (let index = 0; index < itemsUsed.length; index++) {
      const item = itemsUsed[index];
      await update_raw_materials_item_quantity(item.item, item.quantity, false);
    }
  }

  const date = new Date();
  // convert date to local timezone
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  // Update record
  try {
    const record = await RestockRawMaterialsRecord.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          verifiedBy,
          verified: true,
          verifiedDate: date,
        },
      },
      { new: true },
    );

    //? emit
    io.emit("RawMaterials");
    io.emit("RestockRawMaterialsRecord");

    res.json({ message: "Raw Materials Entry Verified", record });
  } catch (error) {
    console.log(
      "Error in verify_restock_raw_materials_record: ",
      error.message,
    );
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

//? Request for product materials record
export const enter_product_materials_request_record = async (req, res) => {
  // get values from body
  const { id, receiver, items, purpose, editedBy, date } = req.body;

  // verify all fields
  if (!receiver || !items || !date) {
    return res.status(500).json({ message: "Invalid Entry" });
  }

  // check if date is valid
  if (!new Date(date)) {
    return res.status(500).json({ message: "Invalid Date" });
  }

  // verify date
  if (new Date(date) > new Date()) {
    return res.status(500).json({ message: "Invalid Date" });
  }

  const recordDate = new Date(date);

  // convert date to local timezone
  recordDate.setMinutes(
    recordDate.getMinutes() - recordDate.getTimezoneOffset(),
  );

  // verify items
  if (items.length < 1) {
    return res.status(500).json({ message: "No Items" });
  }

  // Verfiy each item field
  for (let i = 0; i < items.length; i++) {
    if (!items[i].item || !items[i].quantity) {
      return res.status(500).json({ message: "Invalid Item Entry" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(items[i].item)) {
      return res.status(500).json({ message: "Invalid Item found" });
    }

    // Check if item exist
    const itemExists = await ProductMaterials.findById(items[i].item);
    if (!itemExists) {
      return res.status(500).json({ message: "Invalid Item Entry" });
    }
  }

  try {
    // if id is undefined CREATE
    if (!id) {
      const record = await ProductMaterialsRequestRecord.create({
        receiver,
        items,
        purpose,
        recordDate: recordDate.toISOString(),
        recordId: generate_record_id(),
      });

      res.json({
        message: "Product Materials Request Entry Submitted",
        record,
      });
    }

    // else UPDATE
    else {
      // check if id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "Record ID not valid" });
      }

      // Check if record exist
      const recordFind = await ProductMaterialsRequestRecord.findById(id);
      if (!recordFind) {
        return res.status(500).json({ message: "Record does not exist" });
      }

      // Check if editedBy
      if (!editedBy) {
        return res.status(500).json({ message: "Invalid Entry" });
      }

      // Check if record is verified
      if (recordFind.authorized) {
        return res.status(500).json({ message: "Record authorized already" });
      }

      //  Edit record
      const record = await ProductMaterialsRequestRecord.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            receiver,
            items,
            purpose,
            recordDate: recordDate.toISOString(),
            isEdited: true,
          },
          $push: {
            editedBy: {
              staff: editedBy,
            },
          },
        },
        { new: true },
      );
      res.json({ message: "Product Materials Request Entry Updated", record });
    }

    //? emit
    io.emit("ProductMaterialsRequestRecord");
  } catch (error) {
    console.log(
      "Error in enter_product_materials_request_record: ",
      error.message,
    );
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Verify Request for product materials record
export const verify_product_materials_request_record = async (req, res) => {
  const { id, authorizedBy } = req.body;

  // verify all input
  if (!id || !authorizedBy) {
    return res.status(500).json({ message: "Invalid Verification" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Record ID not valid" });
  }

  // Check if record exist
  const record = await ProductMaterialsRequestRecord.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // Check if record is authorized
  if (record.authorized) {
    return res.status(500).json({ message: "Record authorized already" });
  }

  //  get items
  const items = record.items;

  // verify items
  if (!items || items.length < 1) {
    return res.status(500).json({ message: "Record contains No items" });
  }

  // verify each item
  for (let index = 0; index < items.length; index++) {
    const item = items[index];

    if (!item.item || !item.quantity) {
      return res.status(500).json({ message: "Invalid item found" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(item.item)) {
      return res.status(500).json({ message: "Invalid item found" });
    }

    // Check if item exist
    const itemExists = await ProductMaterials.findById(item.item);
    if (!itemExists) {
      return res.status(500).json({ message: "Invalid item found" });
    }
  }

  // Update all items (decrease quantity)
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    await update_product_materials_item_quantity(
      item.item,
      item.quantity,
      false,
    );
  }

  const date = new Date();
  // convert date to local timezone
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  // Update record
  try {
    const record = await ProductMaterialsRequestRecord.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          authorizedBy,
          authorized: true,
          authorizedDate: date,
        },
      },
      { new: true },
    );

    //? emit
    io.emit("ProductMaterials");
    io.emit("ProductMaterialsRequestRecord");

    res.json({ message: "Product Materials Request Entry Authorized", record });
  } catch (error) {
    console.log(
      "Error in verify_product_materials_request_record: ",
      error.message,
    );
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

//? Request for raw materials record
export const enter_raw_materials_request_record = async (req, res) => {
  // get values from body
  const { id, receiver, items, purpose, editedBy, date } = req.body;

  // verify all fields
  if (!receiver || !items || !date) {
    return res.status(500).json({ message: "Invalid Entry" });
  }

  // check if date is valid
  if (!new Date(date)) {
    return res.status(500).json({ message: "Invalid Date" });
  }

  // verify date
  if (new Date(date) > new Date()) {
    return res.status(500).json({ message: "Invalid Date" });
  }

  const recordDate = new Date(date);

  // convert date to local timezone
  recordDate.setMinutes(
    recordDate.getMinutes() - recordDate.getTimezoneOffset(),
  );

  // verify items
  if (items.length < 1) {
    return res.status(500).json({ message: "No Items" });
  }

  // Verfiy each item field
  for (let i = 0; i < items.length; i++) {
    if (!items[i].item || !items[i].quantity) {
      return res.status(500).json({ message: "Invalid Item Entry" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(items[i].item)) {
      return res.status(500).json({ message: "Invalid Item found" });
    }

    // Check if item exist
    const itemExists = await RawMaterials.findById(items[i].item);
    if (!itemExists) {
      return res.status(500).json({ message: "Invalid Item Entry" });
    }
  }

  try {
    // if id is undefined CREATE
    if (!id) {
      const record = await RawMaterialsRequestRecord.create({
        receiver,
        items,
        purpose,
        recordDate: recordDate.toISOString(),
        recordId: generate_record_id(),
      });

      res.json({
        message: "Raw Materials Request Entry Submitted",
        record,
      });
    }

    // else UPDATE
    else {
      // check if id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "Record ID not valid" });
      }

      // Check if record exist
      const recordFind = await RawMaterialsRequestRecord.findById(id);
      if (!recordFind) {
        return res.status(500).json({ message: "Record does not exist" });
      }

      // Check if editedBy
      if (!editedBy) {
        return res.status(500).json({ message: "Invalid Entry" });
      }

      // Check if record is authorized
      if (recordFind.authorized) {
        return res.status(500).json({ message: "Record authorized already" });
      }

      //  Edit record
      const record = await RawMaterialsRequestRecord.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            receiver,
            items,
            purpose,
            recordDate: recordDate.toISOString(),
            isEdited: true,
          },
          $push: {
            editedBy: {
              staff: editedBy,
            },
          },
        },
        { new: true },
      );
      res.json({ message: "Raw Materials Request Entry Updated", record });
    }

    //? emit
    io.emit("RawMaterialsRequestRecord");
  } catch (error) {
    console.log("Error in enter_raw_materials_request_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Verify Request for raw materials record
export const verify_raw_materials_request_record = async (req, res) => {
  const { id, authorizedBy } = req.body;

  // verify all input
  if (!id || !authorizedBy) {
    return res.status(500).json({ message: "Invalid Verification" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Record ID not valid" });
  }

  // Check if record exist
  const record = await RawMaterialsRequestRecord.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // Check if record is authorized
  if (record.authorized) {
    return res.status(500).json({ message: "Record authorized already" });
  }

  //  get items
  const items = record.items;

  // verify items
  if (!items || items.length < 1) {
    return res.status(500).json({ message: "Record contains No items" });
  }

  // verify each item
  for (let index = 0; index < items.length; index++) {
    const item = items[index];

    if (!item.item || !item.quantity) {
      return res.status(500).json({ message: "Invalid item found" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(item.item)) {
      return res.status(500).json({ message: "Invalid item found" });
    }

    // Check if item exist
    const itemExists = await RawMaterials.findById(item.item);
    if (!itemExists) {
      return res.status(500).json({ message: "Invalid item found" });
    }
  }

  // Update all items (decrease quantity)
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    await update_raw_materials_item_quantity(item.item, item.quantity, false);
  }

  const date = new Date();
  // convert date to local timezone
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  // Update record
  try {
    const record = await RawMaterialsRequestRecord.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          authorizedBy,
          authorized: true,
          authorizedDate: date,
        },
      },
      { new: true },
    );

    //? emit
    io.emit("RawMaterials");
    io.emit("RawMaterialsRequestRecord");

    res.json({ message: "Raw Materials Request Entry Authorized", record });
  } catch (error) {
    console.log(
      "Error in verify_raw_materials_request_record: ",
      error.message,
    );
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Add/Update product materials categories
export const add_update_product_materials_category = async (req, res) => {
  const { id, category, sort } = req.body;

  if (!category) {
    return res.status(500).json({ message: "Category required" });
  }

  if (!sort) {
    return res.status(500).json({ message: "Sort required" });
  }

  try {
    // if id is undefined CREATE
    if (!id) {
      const categoryExists = await ProductMaterialsCategory.findOne({
        category,
      });

      // if category already exist
      if (categoryExists) {
        return res.status(500).json({ message: "Category already exist" });
      }

      const sortExists = await ProductMaterialsCategory.findOne({ sort });

      // if category already exist
      if (sortExists) {
        return res.status(500).json({ message: "Sort already exist" });
      }

      const newCategory = await ProductMaterialsCategory.create({
        category,
        sort,
      });

      res.json({ message: "Category Created Successfully", newCategory });
    }

    // else UPDATE
    else {
      // check if id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "ID not valid" });
      }

      // Check if category exist
      const categoryExists = await ProductMaterialsCategory.findById(id);
      if (!categoryExists) {
        return res.status(500).json({ message: "Category does not exist" });
      }

      const sortExists = await ProductMaterialsCategory.findOne({ sort });

      // if category already exist
      if (sortExists && sortExists._id != id) {
        return res.status(500).json({ message: "Sort already exist" });
      }

      const newCategory = await ProductMaterialsCategory.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            category,
            sort,
          },
        },
        { new: true },
      );

      res.json({ message: "Category Updated Successfully", newCategory });
    }

    //? emit
    io.emit("ProductMaterialsCategory");
  } catch (error) {
    console.log(
      "Error in add_update_product_materials_category: ",
      error.message,
    );
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Add/Update raw materials categories
export const add_update_raw_materials_category = async (req, res) => {
  const { id, category, sort } = req.body;

  if (!category) {
    return res.status(500).json({ message: "Category required" });
  }

  if (!sort) {
    return res.status(500).json({ message: "Sort required" });
  }

  try {
    // if id is undefined CREATE
    if (!id) {
      const categoryExists = await RawMaterialsCategory.findOne({ category });

      // if category already exist
      if (categoryExists) {
        return res.status(500).json({ message: "Category already exist" });
      }

      const sortExists = await RawMaterialsCategory.findOne({ sort });

      // if category already exist
      if (sortExists) {
        return res.status(500).json({ message: "Sort already exist" });
      }

      const newCategory = await RawMaterialsCategory.create({
        category,
        sort,
      });

      res.json({ message: "Category Created Successfully", newCategory });
    }

    // else UPDATE
    else {
      // check if id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "ID not valid" });
      }

      // Check if category exist
      const categoryExists = await RawMaterialsCategory.findById(id);
      if (!categoryExists) {
        return res.status(500).json({ message: "Category does not exist" });
      }

      const sortExists = await RawMaterialsCategory.findOne({ sort });

      // if category already exist
      if (sortExists && sortExists._id != id) {
        return res.status(500).json({ message: "Sort already exist" });
      }

      const newCategory = await RawMaterialsCategory.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            category,
            sort,
          },
        },
        { new: true },
      );
      res.json({ message: "Category Updated Successfully", newCategory });
    }

    //? emit
    io.emit("RawMaterialsCategory");
  } catch (error) {
    console.log("Error in add_update_raw_materials_category: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// ! REMOVALS

// Delete Product materials
export const delete_product_materials = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(500).json({ message: "Item ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Item ID not valid" });
  }

  // Check if item exist
  const itemExists = await ProductMaterials.findById(id);
  if (!itemExists) {
    return res.status(500).json({ message: "Item does not exist" });
  }

  try {
    await ProductMaterials.findByIdAndDelete(id);

    res.json({ message: "Item deleted Sucessfully" });

    //? emit
    io.emit("ProductMaterials");
  } catch (error) {
    console.log("Error in delete_product_materials: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Delete raw materials
export const delete_raw_materials = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(500).json({ message: "Item ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Item ID not valid" });
  }

  // Check if item exist
  const itemExists = await RawMaterials.findById(id);
  if (!itemExists) {
    return res.status(500).json({ message: "Item does not exist" });
  }

  try {
    await RawMaterials.findByIdAndDelete(id);

    res.json({ message: "Item deleted Sucessfully" });

    //? emit
    io.emit("RawMaterials");
  } catch (error) {
    console.log("Error in delete_raw_materials: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Delete restock product materials record
export const delete_restock_product_materials_record = async (req, res) => {
  const { id } = req.params;
  const { isAllowed } = req.body;

  if (!id) {
    return res.status(500).json({ message: "Record ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Record ID not valid" });
  }

  // Check if record exist
  const record = await RestockProductMaterialsRecord.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // check if record is verified
  if (record.verified) {
    const items = record.items;
    // Check is user is permitted
    if (!isAllowed) {
      return res.status(500).json({ message: "Unathorized to Delete" });
    }

    // User allowed to delete
    else {
      // Update all items (decrease quantity)
      for (let index = 0; index < items.length; index++) {
        const item = items[index];
        await update_product_materials_item_quantity(
          item.item,
          item.quantity,
          false,
        );
      }

      //? emit
      io.emit("ProductMaterials");
    }
  }

  // delete record
  try {
    await RestockProductMaterialsRecord.findByIdAndDelete(id);

    res.json({ message: "Record deleted Sucessfully" });

    //? emit
    io.emit("RestockProductMaterialsRecord");
  } catch (error) {
    console.log(
      "Error in delete_restock_product_materials_record: ",
      error.message,
    );
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Delete restock raw materials record
export const delete_restock_raw_materials_record = async (req, res) => {
  const { id } = req.params;
  const { isAllowed } = req.body;

  if (!id) {
    return res.status(500).json({ message: "Record ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Record ID not valid" });
  }

  // Check if record exist
  const record = await RestockRawMaterialsRecord.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // check if record is verified
  if (record.verified) {
    // Check is user is permitted
    if (!isAllowed) {
      return res.status(500).json({ message: "Unathorized to Delete" });
    }

    // User allowed to delete
    else {
      // get items
      const items = record.items;

      // Update all items (decrease quantity)
      for (let index = 0; index < items.length; index++) {
        const item = items[index];
        await update_raw_materials_item_quantity(
          item.item,
          item.quantity,
          false,
        );
      }

      // get items used
      const itemsUsed = record.itemsUsed;

      // if items used
      if (itemsUsed && itemsUsed.length > 0) {
        // Update all itemsUsed (increase quantity)
        for (let index = 0; index < itemsUsed.length; index++) {
          const item = itemsUsed[index];
          await update_raw_materials_item_quantity(
            item.item,
            item.quantity,
            true,
          );
        }
      }

      //? emit
      io.emit("RawMaterials");
    }
  }

  // delete record
  try {
    await RestockRawMaterialsRecord.findByIdAndDelete(id);

    res.json({ message: "Record deleted Sucessfully" });

    //? emit
    io.emit("RestockRawMaterialsRecord");
  } catch (error) {
    console.log(
      "Error in delete_restock_raw_materials_record: ",
      error.message,
    );
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Delete product materials request record
export const delete_product_materials_request_record = async (req, res) => {
  const { id } = req.params;
  const { isAllowed } = req.body;

  if (!id) {
    return res.status(500).json({ message: "Record ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Record ID not valid" });
  }

  // Check if record exist
  const record = await ProductMaterialsRequestRecord.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // check if record is authorized
  if (record.authorized) {
    // Check is user is permitted
    if (!isAllowed) {
      return res.status(500).json({ message: "Unathorized to Delete" });
    }

    // User allowed to delete
    else {
      const items = record.items;

      // Update all items (increase quantity)
      for (let index = 0; index < items.length; index++) {
        const item = items[index];
        await update_product_materials_item_quantity(
          item.item,
          item.quantity,
          true,
        );
      }

      //? emit
      io.emit("ProductMaterials");
    }
  }

  // delete record
  try {
    await ProductMaterialsRequestRecord.findByIdAndDelete(id);

    res.json({ message: "Record deleted Sucessfully" });

    //? emit
    io.emit("ProductMaterialsRequestRecord");
  } catch (error) {
    console.log(
      "Error in delete_product_materials_request_record: ",
      error.message,
    );
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Delete raw materials request record
export const delete_raw_materials_request_record = async (req, res) => {
  const { id } = req.params;
  const { isAllowed } = req.body;

  if (!id) {
    return res.status(500).json({ message: "Record ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Record ID not valid" });
  }

  // Check if record exist
  const record = await RawMaterialsRequestRecord.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // check if record is authorized
  if (record.authorized) {
    // Check is user is permitted
    if (!isAllowed) {
      return res.status(500).json({ message: "Unathorized to Delete" });
    }

    // User allowed to delete
    else {
      const items = record.items;

      // Update all items (increase quantity)
      for (let index = 0; index < items.length; index++) {
        const item = items[index];
        await update_raw_materials_item_quantity(
          item.item,
          item.quantity,
          true,
        );
      }

      //? emit
      io.emit("RawMaterials");
    }
  }

  // delete record
  try {
    await RawMaterialsRequestRecord.findByIdAndDelete(id);

    res.json({ message: "Record deleted Sucessfully" });

    //? emit
    io.emit("RawMaterialsRequestRecord");
  } catch (error) {
    console.log(
      "Error in delete_raw_materials_request_record: ",
      error.message,
    );
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Delete product materials categories
export const delete_product_materials_category = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(500).json({ message: "Category ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Category ID not valid" });
  }

  // Check if product exist
  const categoryExists = await ProductMaterialsCategory.findById(id);
  if (!categoryExists) {
    return res.status(500).json({ message: "Category does not exist" });
  }

  try {
    await ProductMaterialsCategory.findByIdAndDelete(id);

    res.json({ message: "Category deleted Sucessfully" });

    //? emit
    io.emit("ProductMaterialsCategory");
  } catch (error) {
    console.log("Error in delete_product_materials_category: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Delete raw materials categories
export const delete_raw_materials_category = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(500).json({ message: "Category ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Category ID not valid" });
  }

  // Check if product exist
  const categoryExists = await RawMaterialsCategory.findById(id);
  if (!categoryExists) {
    return res.status(500).json({ message: "Category does not exist" });
  }

  try {
    await RawMaterialsCategory.findByIdAndDelete(id);

    res.json({ message: "Category deleted Sucessfully" });

    //? emit
    io.emit("RawMaterialsCategory");
  } catch (error) {
    console.log("Error in delete_raw_materials_category: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// ! UTILS

// update product materials item quantity
export const update_product_materials_item_quantity = async (
  id,
  quantity,
  increament,
) => {
  if (increament === undefined) {
    return { error: "No increament attribute" };
  }

  const finalQuantity = increament ? quantity : -quantity;

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { error: "Item ID not valid" };
  }

  // Check if item exist
  const itemExists = await ProductMaterials.findById(id);
  if (!itemExists) {
    return { error: "Item does not exist" };
  }

  try {
    const item = await ProductMaterials.findOneAndUpdate(
      { _id: id },
      {
        $inc: {
          quantity: finalQuantity,
        },
      },
      { new: true },
    );

    return { message: "Product Material updated" };
  } catch (error) {
    console.log(
      "Error in update_product_materials_item_quantity: ",
      error.message,
    );
    return { error: error.message };
  }
};

// update raw materials item quantity
export const update_raw_materials_item_quantity = async (
  id,
  quantity,
  increament,
) => {
  if (increament === undefined) {
    return { error: "No increament attribute" };
  }

  const finalQuantity = increament ? quantity : -quantity;

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { error: "Item ID not valid" };
  }

  // Check if item exist
  const itemExists = await RawMaterials.findById(id);
  if (!itemExists) {
    return { error: "Item does not exist" };
  }

  try {
    const item = await RawMaterials.findOneAndUpdate(
      { _id: id },
      {
        $inc: {
          quantity: finalQuantity,
        },
      },
      { new: true },
    );

    return { message: "Raw Material updated" };
  } catch (error) {
    console.log("Error in update_raw_materials_item_quantity: ", error.message);
    return { error: error.message };
  }
};

// generate record Id
export const generate_record_id = () => {
  return "" + nanoid(11);
};
