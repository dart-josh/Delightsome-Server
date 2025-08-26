import BadProduct from "../models/storeModels/badProduct.model.js";
import Product from "../models/storeModels/product.model.js";
import mongoose from "mongoose";
import ProductionRecord from "../models/storeModels/productionRecord.model.js";
import {
  enter_daily_store_record,
  enter_outlet_daily_sales_record,
  enter_terminal_daily_sales_record,
  enter_dangote_daily_sales_record,
} from "./sales.controller.js";
import ProductReceived from "../models/storeModels/productReceived.model.js";
import ProductRequest from "../models/storeModels/productRequest.model.js";
import {
  OutletProduct,
  TerminalProduct,
  DangoteProduct,
} from "../models/storeModels/outletProduct.model.js";
import {
  OutletCollectionRecord,
  TerminalCollectionRecord,
  DangoteCollectionRecord,
} from "../models/storeModels/collection.model.js";
import ProductCategory from "../models/storeModels/productCategory.model.js";
import { io } from "../socket/socket.js";
import { nanoid } from "nanoid";
import ProductTakeOut from "../models/storeModels/productTakeOut.model.js";
import ProductReturn from "../models/storeModels/productReturn.model.js";

// ! GETTERS

//?
// Get all products
export const get_products = async (req, res) => {
  try {
    const products = await get_all_products();
    res.json({ products });
  } catch (error) {
    console.log("Error in get_products controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// get outlet products
export const get_outlet_products = async (req, res) => {
  try {
    const products = await get_all_outlet_products();
    res.json({ products });
  } catch (error) {
    console.log("Error in get_outlet_products controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// get terminal products
export const get_terminal_products = async (req, res) => {
  try {
    const products = await get_all_terminal_products();
    res.json({ products });
  } catch (error) {
    console.log("Error in get_terminal_products controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// get dangote products
export const get_dangote_products = async (req, res) => {
  try {
    const products = await get_all_dangote_products();
    res.json({ products });
  } catch (error) {
    console.log("Error in get_dangote_products controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

//?

// get production record
export const get_production_record = async (req, res) => {
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
    const record = await ProductionRecord.find(query)
      .sort({ recordDate: -1 })
      .populate({
        path: "products.product",
        select: ["name", "code", "category", "sort"],
      })
      .populate({
        path: "producer",
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
    console.log("Error in get_production_record controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

//? Get selected production record
export const get_selected_production_record = async (req, res) => {
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
    const record = await ProductionRecord.aggregate([
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
      await ProductionRecord.populate(record, {
        path: "products.product",
        select: ["name", "code", "category", "sort"],
      }),

      await ProductionRecord.populate(record, {
        path: "producer",
        select: ["nickName", "role", "staffId"],
      }),

      await ProductionRecord.populate(record, {
        path: "editedBy.staff",
        select: ["nickName", "role", "staffId"],
      }),

      await ProductionRecord.populate(record, {
        path: "verifiedBy",
        select: ["nickName", "role", "staffId"],
      }),
    );

    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_selected_production_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// Get product received record
export const get_product_received_record = async (req, res) => {
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
    const record = await ProductReceived.find(query)
      .sort({ recordDate: -1 })
      .populate({
        path: "products.product",
        select: ["name", "code", "category", "sort"],
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
      "Error in get_product_received_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

//? Get selected product received record
export const get_selected_product_received_record = async (req, res) => {
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
    const record = await ProductReceived.aggregate([
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
      await ProductReceived.populate(record, {
        path: "products.product",
        select: ["name", "code", "category", "sort"],
      }),

      await ProductReceived.populate(record, {
        path: "receiver",
        select: ["nickName", "role", "staffId"],
      }),

      await ProductReceived.populate(record, {
        path: "editedBy.staff",
        select: ["nickName", "role", "staffId"],
      }),

      await ProductReceived.populate(record, {
        path: "verifiedBy",
        select: ["nickName", "role", "staffId"],
      }),
    );

    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_selected_product_received_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// Get product request record
export const get_product_request_record = async (req, res) => {
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
    const record = await ProductRequest.find(query)
      .sort({ recordDate: -1 })
      .populate({
        path: "products.product",
        select: ["name", "code", "category", "sort"],
      })
      .populate({
        path: "requestedBy",
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
      "Error in get_product_request_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

//? Get selected product request record
export const get_selected_product_request_record = async (req, res) => {
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
    const record = await ProductRequest.aggregate([
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
      await ProductRequest.populate(record, {
        path: "products.product",
        select: ["name", "code", "category", "sort"],
      }),

      await ProductRequest.populate(record, {
        path: "requestedBy",
        select: ["nickName", "role", "staffId"],
      }),

      await ProductRequest.populate(record, {
        path: "editedBy.staff",
        select: ["nickName", "role", "staffId"],
      }),

      await ProductRequest.populate(record, {
        path: "verifiedBy",
        select: ["nickName", "role", "staffId"],
      }),
    );

    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_selected_product_request_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// Get product takeOut record
export const get_product_takeOut_record = async (req, res) => {
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
    const record = await ProductTakeOut.find(query)
      .sort({ recordDate: -1 })
      .populate({
        path: "products.product",
        select: ["name", "code", "category", "sort"],
      })
      .populate({
        path: "takenBy",
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
      "Error in get_product_takeOut_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

//? Get selected product takeOut record
export const get_selected_product_takeOut_record = async (req, res) => {
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
    const record = await ProductTakeOut.aggregate([
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
      await ProductTakeOut.populate(record, {
        path: "products.product",
        select: ["name", "code", "category", "sort"],
      }),

      await ProductTakeOut.populate(record, {
        path: "takenBy",
        select: ["nickName", "role", "staffId"],
      }),

      await ProductTakeOut.populate(record, {
        path: "editedBy.staff",
        select: ["nickName", "role", "staffId"],
      }),

      await ProductTakeOut.populate(record, {
        path: "verifiedBy",
        select: ["nickName", "role", "staffId"],
      }),
    );

    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_selected_product_takeOut_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// Get product return record
export const get_product_return_record = async (req, res) => {
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
    const record = await ProductReturn.find(query)
      .sort({ recordDate: -1 })
      .populate({
        path: "products.product",
        select: ["name", "code", "category", "sort"],
      })
      .populate({
        path: "returnedBy",
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
      "Error in get_product_return_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

//? Get selected product return record
export const get_selected_product_return_record = async (req, res) => {
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
    const record = await ProductReturn.aggregate([
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
      await ProductReturn.populate(record, {
        path: "products.product",
        select: ["name", "code", "category", "sort"],
      }),

      await ProductReturn.populate(record, {
        path: "returnedBy",
        select: ["nickName", "role", "staffId"],
      }),

      await ProductReturn.populate(record, {
        path: "editedBy.staff",
        select: ["nickName", "role", "staffId"],
      }),

      await ProductReturn.populate(record, {
        path: "verifiedBy",
        select: ["nickName", "role", "staffId"],
      }),
    );

    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_selected_product_return_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// Get bad product record
export const get_bad_product_record = async (req, res) => {
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
    const record = await BadProduct.find(query)
      .sort({ recordDate: -1 })
      .populate({
        path: "products.product",
        model: "Product",
        select: ["name", "code", "category", "sort"],
      })
      .populate({
        path: "staffResponsible",
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
    console.log("Error in get_bad_product_record controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

//? Get selected bad product record
export const get_selected_bad_product_record = async (req, res) => {
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
    const record = await BadProduct.aggregate([
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
      await BadProduct.populate(record, {
        path: "products.product",
        select: ["name", "code", "category", "sort"],
      }),

      await BadProduct.populate(record, {
        path: "staffResponsible",
        select: ["nickName", "role", "staffId"],
      }),

      await BadProduct.populate(record, {
        path: "editedBy.staff",
        select: ["nickName", "role", "staffId"],
      }),

      await BadProduct.populate(record, {
        path: "verifiedBy",
        select: ["nickName", "role", "staffId"],
      }),
    );

    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_selected_bad_product_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// Get Outlet collection record
export const get_outletCollection_record = async (req, res) => {
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
    const record = await OutletCollectionRecord.find(query)
      .sort({ recordDate: -1 })
      .populate({
        path: "products.product",
        model: "Product",
        select: ["name", "code", "category", "sort"],
      })
      .populate({
        path: "staffResponsible",
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
      "Error in get_outletCollection_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

//? Get selected Outlet collection record
export const get_selected_outletCollection_record = async (req, res) => {
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
    const record = await OutletCollectionRecord.aggregate([
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
      await OutletCollectionRecord.populate(record, {
        path: "products.product",
        select: ["name", "code", "category", "sort"],
      }),

      await OutletCollectionRecord.populate(record, {
        path: "staffResponsible",
        select: ["nickName", "role", "staffId"],
      }),

      await OutletCollectionRecord.populate(record, {
        path: "editedBy.staff",
        select: ["nickName", "role", "staffId"],
      }),

      await OutletCollectionRecord.populate(record, {
        path: "verifiedBy",
        select: ["nickName", "role", "staffId"],
      }),
    );

    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_selected_outletCollection_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// Get Terminal collection record
export const get_terminalCollection_record = async (req, res) => {
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
    const record = await TerminalCollectionRecord.find(query)
      .sort({ recordDate: -1 })
      .populate({
        path: "products.product",
        model: "Product",
        select: ["name", "code", "category", "sort"],
      })
      .populate({
        path: "staffResponsible",
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
      "Error in get_terminalCollection_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

//? Get selected Terminal collection record
export const get_selected_terminalCollection_record = async (req, res) => {
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
    const record = await TerminalCollectionRecord.aggregate([
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
      await TerminalCollectionRecord.populate(record, {
        path: "products.product",
        select: ["name", "code", "category", "sort"],
      }),

      await TerminalCollectionRecord.populate(record, {
        path: "staffResponsible",
        select: ["nickName", "role", "staffId"],
      }),

      await TerminalCollectionRecord.populate(record, {
        path: "editedBy.staff",
        select: ["nickName", "role", "staffId"],
      }),

      await TerminalCollectionRecord.populate(record, {
        path: "verifiedBy",
        select: ["nickName", "role", "staffId"],
      }),
    );

    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_selected_terminalCollection_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// Get Dangote collection record
export const get_dangoteCollection_record = async (req, res) => {
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
    const record = await DangoteCollectionRecord.find(query)
      .sort({ recordDate: -1 })
      .populate({
        path: "products.product",
        model: "Product",
        select: ["name", "code", "category", "sort"],
      })
      .populate({
        path: "staffResponsible",
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
      "Error in get_dangoteCollection_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

//? Get selected Dangote collection record
export const get_selected_dangoteCollection_record = async (req, res) => {
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
    const record = await DangoteCollectionRecord.aggregate([
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
      await DangoteCollectionRecord.populate(record, {
        path: "products.product",
        select: ["name", "code", "category", "sort"],
      }),

      await DangoteCollectionRecord.populate(record, {
        path: "staffResponsible",
        select: ["nickName", "role", "staffId"],
      }),

      await DangoteCollectionRecord.populate(record, {
        path: "editedBy.staff",
        select: ["nickName", "role", "staffId"],
      }),

      await DangoteCollectionRecord.populate(record, {
        path: "verifiedBy",
        select: ["nickName", "role", "staffId"],
      }),
    );

    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_selected_dangoteCollection_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

//?

// get product categories
export const get_product_categories = async (req, res) => {
  try {
    const categories = await ProductCategory.find({});
    res.json({ categories });
  } catch (error) {
    console.log("Error in get_product_categories controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// // Get production request record

// ! SETTERS

// Add/update products
export const add_update_product = async (req, res) => {
  // get values from body
  const {
    id,
    name,
    code,
    category,
    quantity,
    restockLimit,
    storePrice,
    onlinePrice,
    isAvailable,
    isOnline,
  } = req.body;

  // verify fields
  if (!name || !category || !storePrice || !onlinePrice) {
    return res.status(500).json({ message: "Enter all required fields" });
  }

  const findCategory = await ProductCategory.findOne({ category });

  if (!findCategory) {
    return res.status(500).json({ message: "Category not found" });
  }

  const sort = findCategory.sort;

  try {
    // if id is undefined CREATE
    if (!id) {
      const productExists = await Product.findOne({ name });

      // if name already exist return error
      if (productExists) {
        return res.status(500).json({ message: "Product already exist" });
      }

      const product = await Product.create({
        name,
        code,
        category,
        quantity,
        restockLimit,
        storePrice,
        onlinePrice,
        isAvailable,
        isOnline,
        sort,
      });

      res.json({ message: "Product Created Successfully", product });
    }

    // else UPDATE
    else {
      // check if _id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "ID not valid" });
      }

      // Check if product exist
      const productExists = await Product.findById(id);
      if (!productExists) {
        return res.status(500).json({ message: "Product does not exist" });
      }

      const nameExists = await Product.findOne({ name });

      // if name already exist return error
      if (nameExists && nameExists._id != id) {
        return res.status(500).json({ message: "Product already exist" });
      }

      const product = await Product.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            name,
            code,
            category,
            quantity,
            restockLimit,
            storePrice,
            onlinePrice,
            isAvailable,
            isOnline,
            sort,
          },
        },
        { new: true },
      );
      res.json({ message: "Product Updated Successfully", product });
    }

    // update products
    io.emit("Product");
  } catch (error) {
    console.log("Error in add_update_products: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

//? Enter production record
export const enter_production_record = async (req, res) => {
  // get values from body
  const { id, producer, products, shortNote, editedBy, date } = req.body;

  // verify all fields
  if (!producer || !products || !date) {
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

  // verify products
  if (products.length < 1) {
    return res.status(500).json({ message: "No Products" });
  }

  // Verfiy each product field
  for (let i = 0; i < products.length; i++) {
    if (!products[i].product || !products[i].quantity) {
      return res.status(500).json({ message: "Invalid Product Entry" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(products[i].product)) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // Check if product exist
    const productExists = await Product.findById(products[i].product);
    if (!productExists) {
      return res.status(500).json({ message: "Invalid Product Entry" });
    }
  }

  // get total quantity
  const totalQuantity = products.reduce((acc, product) => {
    return acc + product.quantity;
  }, 0);

  try {
    // if id is undefined CREATE
    if (!id) {
      const record = await ProductionRecord.create({
        producer,
        products,
        shortNote,
        totalQuantity,
        recordDate: recordDate.toISOString(),
        recordId: generate_record_id(),
      });

      res.json({ message: "Production Entry Submitted", record });
    }

    // else UPDATE
    else {
      // check if id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "Record ID not valid" });
      }

      // Check if product exist
      const recordFind = await ProductionRecord.findById(id);
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
      const record = await ProductionRecord.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            producer,
            products,
            shortNote,
            totalQuantity,
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
      res.json({ message: "Production Entry Updated", record });
    }

    //? emit
    io.emit("ProductionRecord");
  } catch (error) {
    console.log("Error in enter_production_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Verify production record
export const verify_production_record = async (req, res) => {
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
  const record = await ProductionRecord.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // Check if record is verified
  if (record.verified) {
    return res.status(500).json({ message: "Record verified already" });
  }

  //  get products
  const products = record.products;

  // verify products
  if (!products || products.length < 1) {
    return res.status(500).json({ message: "Record contains No products" });
  }

  // verify each product
  for (let index = 0; index < products.length; index++) {
    const product = products[index];

    if (!product.product || !product.quantity) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(product.product)) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // Check if product exist
    const productExists = await Product.findById(product.product);
    if (!productExists) {
      return res.status(500).json({ message: "Invalid product found" });
    }
  }

  // map products for daily record update
  const daily_rec_products = products.map((product) => {
    return {
      id: product.product,
      quantity: product.quantity,
    };
  });

  // update daily record ( added )
  try {
    const response = await enter_daily_store_record({
      date: record.recordDate.toISOString(),
      field: "added",
      products: daily_rec_products,
    });

    if (response.error) {
      return res
        .status(500)
        .json({ message: response.error, error: response.error });
    }
  } catch (error) {
    console.log("Error in enter_daily_store_record: ", error);
    return res.status(500).json({ message: error, error: error });
  }

  // Update all products (increase quantity)
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    await update_product_quantity(product.product, product.quantity, true);
  }

  const date = new Date();
  // convert date to local timezone
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  // Update record
  try {
    const record = await ProductionRecord.findOneAndUpdate(
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
    io.emit("Product");
    io.emit("ProductionRecord");

    res.json({ message: "Production Entry Verified", record });
  } catch (error) {
    console.log("Error in verify_production_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

//? Enter product received record
export const enter_product_received_record = async (req, res) => {
  // get values from body
  const { id, receiver, supplier, products, shortNote, editedBy, date } =
    req.body;

  // verify all fields
  if (!receiver || !products || !date) {
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

  // verify products
  if (products.length < 1) {
    return res.status(500).json({ message: "No Products" });
  }

  // Verfiy each product field
  for (let i = 0; i < products.length; i++) {
    if (!products[i].product || !products[i].quantity) {
      return res.status(500).json({ message: "Invalid Product Entry" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(products[i].product)) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // Check if product exist
    const productExists = await Product.findById(products[i].product);
    if (!productExists) {
      return res.status(500).json({ message: "Invalid Product Entry" });
    }
  }

  // get total quantity
  const totalQuantity = products.reduce((acc, product) => {
    return acc + product.quantity;
  }, 0);

  try {
    // if id is undefined CREATE
    if (!id) {
      const record = await ProductReceived.create({
        receiver,
        supplier,
        products,
        shortNote,
        totalQuantity,
        recordDate: recordDate.toISOString(),
        recordId: generate_record_id(),
      });

      res.json({ message: "Product Received Entry Submitted", record });
    }

    // else UPDATE
    else {
      // check if id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "Record ID not valid" });
      }

      // Check if product exist
      const recordFind = await ProductReceived.findById(id);
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
      const record = await ProductReceived.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            receiver,
            supplier,
            products,
            shortNote,
            totalQuantity,
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
      res.json({ message: "Product Received Entry Updated", record });
    }

    //? emit
    io.emit("ProductReceived");
  } catch (error) {
    console.log("Error in enter_product_received_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Verify product received record
export const verify_product_received_record = async (req, res) => {
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
  const record = await ProductReceived.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // Check if record is verified
  if (record.verified) {
    return res.status(500).json({ message: "Record verified already" });
  }

  //  get products
  const products = record.products;

  // verify products
  if (!products || products.length < 1) {
    return res.status(500).json({ message: "Record contains No products" });
  }

  // verify each product
  for (let index = 0; index < products.length; index++) {
    const product = products[index];

    if (!product.product || !product.quantity) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(product.product)) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // Check if product exist
    const productExists = await Product.findById(product.product);
    if (!productExists) {
      return res.status(500).json({ message: "Invalid product found" });
    }
  }

  // map products for daily record update
  const daily_rec_products = products.map((product) => {
    return {
      id: product.product,
      quantity: product.quantity,
    };
  });

  // update daily record ( added )
  try {
    const response = await enter_daily_store_record({
      date: record.recordDate.toISOString(),
      field: "added",
      products: daily_rec_products,
    });

    if (response.error) {
      return res
        .status(500)
        .json({ message: response.error, error: response.error });
    }
  } catch (error) {
    console.log("Error in enter_daily_store_record: ", error);
    return res.status(500).json({ message: error, error: error });
  }

  // Update all products (increase quantity)
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    await update_product_quantity(product.product, product.quantity, true);
  }

  const date = new Date();
  // convert date to local timezone
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  // Update record
  try {
    const record = await ProductReceived.findOneAndUpdate(
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
    io.emit("Product");
    io.emit("ProductReceived");

    res.json({ message: "Product Received Entry Verified", record });
  } catch (error) {
    console.log("Error in verify_product_received_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

//? Enter product request record
export const enter_product_request_record = async (req, res) => {
  // get values from body
  const { id, requestedBy, products, shortNote, editedBy, date } = req.body;

  // verify all fields
  if (!requestedBy || !products || !date) {
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

  // verify products
  if (products.length < 1) {
    return res.status(500).json({ message: "No Products" });
  }

  // Verfiy each product field
  for (let i = 0; i < products.length; i++) {
    if (!products[i].product || !products[i].quantity) {
      return res.status(500).json({ message: "Invalid Product Entry" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(products[i].product)) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // Check if product exist
    const productExists = await Product.findById(products[i].product);
    if (!productExists) {
      return res.status(500).json({ message: "Invalid Product Entry" });
    }
  }

  // get total quantity
  const totalQuantity = products.reduce((acc, product) => {
    return acc + product.quantity;
  }, 0);

  try {
    // if id is undefined CREATE
    if (!id) {
      const record = await ProductRequest.create({
        requestedBy,
        products,
        shortNote,
        totalQuantity,
        recordDate: recordDate.toISOString(),
        recordId: generate_record_id(),
      });

      res.json({ message: "Product Request Entry Submitted", record });
    }

    // else UPDATE
    else {
      // check if id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "Record ID not valid" });
      }

      // Check if record exist
      const recordFind = await ProductRequest.findById(id);
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
      const record = await ProductRequest.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            requestedBy,
            products,
            shortNote,
            totalQuantity,
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
      res.json({ message: "Product Request Entry Updated", record });
    }

    //? emit
    io.emit("ProductRequest");
  } catch (error) {
    console.log("Error in enter_product_request_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Verify product request record
export const verify_product_request_record = async (req, res) => {
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
  const record = await ProductRequest.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // Check if record is verified
  if (record.verified) {
    return res.status(500).json({ message: "Record verified already" });
  }

  //  get products
  const products = record.products;

  // verify products
  if (!products || products.length < 1) {
    return res.status(500).json({ message: "Record contains No products" });
  }

  // verify each product
  for (let index = 0; index < products.length; index++) {
    const product = products[index];

    if (!product.product || !product.quantity) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(product.product)) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // Check if product exist
    const productExists = await Product.findById(product.product);
    if (!productExists) {
      return res.status(500).json({ message: "Invalid product found" });
    }
  }

  // map products for daily record update
  const daily_rec_products = products.map((product) => {
    return {
      id: product.product,
      quantity: product.quantity,
    };
  });

  // update daily record ( request )
  try {
    const response = await enter_daily_store_record({
      date: record.recordDate.toISOString(),
      field: "request",
      products: daily_rec_products,
    });

    if (response.error) {
      return res
        .status(500)
        .json({ message: response.error, error: response.error });
    }
  } catch (error) {
    console.log("Error in enter_daily_store_record: ", error);
    return res.status(500).json({ message: error, error: error });
  }

  // Update all products (decrease quantity)
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    await update_product_quantity(product.product, product.quantity, false);
  }

  const date = new Date();
  // convert date to local timezone
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  // Update record
  try {
    const record = await ProductRequest.findOneAndUpdate(
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
    io.emit("Product");
    io.emit("ProductRequest");

    res.json({ message: "Product Request Entry Verified", record });
  } catch (error) {
    console.log("Error in verify_product_request_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

//? Enter product takeOut record
export const enter_product_takeOut_record = async (req, res) => {
  // get values from body
  const { id, takenBy, products, shortNote, editedBy, date } = req.body;

  // verify all fields
  if (!takenBy || !products || !date) {
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

  // verify products
  if (products.length < 1) {
    return res.status(500).json({ message: "No Products" });
  }

  // Verfiy each product field
  for (let i = 0; i < products.length; i++) {
    if (!products[i].product || !products[i].quantity) {
      return res.status(500).json({ message: "Invalid Product Entry" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(products[i].product)) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // Check if product exist
    const productExists = await Product.findById(products[i].product);
    if (!productExists) {
      return res.status(500).json({ message: "Invalid Product Entry" });
    }
  }

  // get total quantity
  const totalQuantity = products.reduce((acc, product) => {
    return acc + product.quantity;
  }, 0);

  try {
    // if id is undefined CREATE
    if (!id) {
      const record = await ProductTakeOut.create({
        takenBy,
        products,
        shortNote,
        totalQuantity,
        recordDate: recordDate.toISOString(),
        recordId: generate_record_id(),
      });

      res.json({ message: "Product TakeOut Entry Submitted", record });
    }

    // else UPDATE
    else {
      // check if id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "Record ID not valid" });
      }

      // Check if record exist
      const recordFind = await ProductTakeOut.findById(id);
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
      const record = await ProductTakeOut.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            takenBy,
            products,
            shortNote,
            totalQuantity,
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
      res.json({ message: "Product TakeOut Entry Updated", record });
    }

    //? emit
    io.emit("ProductTakeOut");
  } catch (error) {
    console.log("Error in enter_product_takeOut_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Verify product takeOut record
export const verify_product_takeOut_record = async (req, res) => {
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
  const record = await ProductTakeOut.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // Check if record is verified
  if (record.verified) {
    return res.status(500).json({ message: "Record verified already" });
  }

  //  get products
  const products = record.products;

  // verify products
  if (!products || products.length < 1) {
    return res.status(500).json({ message: "Record contains No products" });
  }

  // verify each product
  for (let index = 0; index < products.length; index++) {
    const product = products[index];

    if (!product.product || !product.quantity) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(product.product)) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // Check if product exist
    const productExists = await Product.findById(product.product);
    if (!productExists) {
      return res.status(500).json({ message: "Invalid product found" });
    }
  }

  // map products for daily record update
  const daily_rec_products = products.map((product) => {
    return {
      id: product.product,
      quantity: product.quantity,
    };
  });

  // update daily record ( takeOut )
  try {
    const response = await enter_daily_store_record({
      date: record.recordDate.toISOString(),
      field: "takeOut",
      products: daily_rec_products,
    });

    if (response.error) {
      return res
        .status(500)
        .json({ message: response.error, error: response.error });
    }
  } catch (error) {
    console.log("Error in enter_daily_store_record: ", error);
    return res.status(500).json({ message: error, error: error });
  }

  // Update all products (decrease quantity)
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    await update_product_quantity(product.product, product.quantity, false);
  }

  const date = new Date();
  // convert date to local timezone
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  // Update record
  try {
    const record = await ProductTakeOut.findOneAndUpdate(
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
    io.emit("Product");
    io.emit("ProductTakeOut");

    res.json({ message: "Product TakeOut Entry Verified", record });
  } catch (error) {
    console.log("Error in verify_product_takeOut_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

//? Enter product return record
export const enter_product_return_record = async (req, res) => {
  // get values from body
  const { id, returnedBy, products, shortNote, editedBy, date } = req.body;

  // verify all fields
  if (!returnedBy || !products || !date) {
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

  // verify products
  if (products.length < 1) {
    return res.status(500).json({ message: "No Products" });
  }

  // Verfiy each product field
  for (let i = 0; i < products.length; i++) {
    if (!products[i].product || !products[i].quantity) {
      return res.status(500).json({ message: "Invalid Product Entry" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(products[i].product)) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // Check if product exist
    const productExists = await Product.findById(products[i].product);
    if (!productExists) {
      return res.status(500).json({ message: "Invalid Product Entry" });
    }
  }

  // get total quantity
  const totalQuantity = products.reduce((acc, product) => {
    return acc + product.quantity;
  }, 0);

  try {
    // if id is undefined CREATE
    if (!id) {
      const record = await ProductReturn.create({
        returnedBy,
        products,
        shortNote,
        totalQuantity,
        recordDate: recordDate.toISOString(),
        recordId: generate_record_id(),
      });

      res.json({ message: "Product Return Entry Submitted", record });
    }

    // else UPDATE
    else {
      // check if id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "Record ID not valid" });
      }

      // Check if product exist
      const recordFind = await ProductReturn.findById(id);
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
      const record = await ProductReturn.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            returnedBy,
            products,
            shortNote,
            totalQuantity,
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
      res.json({ message: "Product Return Entry Updated", record });
    }

    //? emit
    io.emit("ProductReturn");
  } catch (error) {
    console.log("Error in enter_product_return_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Verify product_return record
export const verify_product_return_record = async (req, res) => {
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
  const record = await ProductReturn.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // Check if record is verified
  if (record.verified) {
    return res.status(500).json({ message: "Record verified already" });
  }

  //  get products
  const products = record.products;

  // verify products
  if (!products || products.length < 1) {
    return res.status(500).json({ message: "Record contains No products" });
  }

  // verify each product
  for (let index = 0; index < products.length; index++) {
    const product = products[index];

    if (!product.product || !product.quantity) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(product.product)) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // Check if product exist
    const productExists = await Product.findById(product.product);
    if (!productExists) {
      return res.status(500).json({ message: "Invalid product found" });
    }
  }

  // map products for daily record update
  const daily_rec_products = products.map((product) => {
    return {
      id: product.product,
      quantity: product.quantity,
    };
  });

  // update daily record ( return )
  try {
    const response = await enter_daily_store_record({
      date: record.recordDate.toISOString(),
      field: "return",
      products: daily_rec_products,
    });

    if (response.error) {
      return res
        .status(500)
        .json({ message: response.error, error: response.error });
    }
  } catch (error) {
    console.log("Error in enter_daily_store_record: ", error);
    return res.status(500).json({ message: error, error: error });
  }

  // Update all products (increase quantity)
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    await update_product_quantity(product.product, product.quantity, true);
  }

  const date = new Date();
  // convert date to local timezone
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  // Update record
  try {
    const record = await ProductReturn.findOneAndUpdate(
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
    io.emit("Product");
    io.emit("ProductReturn");

    res.json({ message: "Product Return Entry Verified", record });
  } catch (error) {
    console.log("Error in verify_product_return_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

//? Enter bad product record
export const enter_bad_product_record = async (req, res) => {
  const { id, staffResponsible, products, shortNote, editedBy, date } =
    req.body;

  // verify all fields
  if (!staffResponsible || !products || !date) {
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

  recordDate.setMinutes(
    recordDate.getMinutes() - recordDate.getTimezoneOffset(),
  );

  // verify products
  if (products.length < 1) {
    return res.status(500).json({ message: "No Products" });
  }

  // Verfiy each product field
  for (let i = 0; i < products.length; i++) {
    if (!products[i].product || !products[i].quantity) {
      return res.status(500).json({ message: "Invalid Product Entry" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(products[i].product)) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // Check if product exist
    const productExists = await Product.findById(products[i].product);
    if (!productExists) {
      return res.status(500).json({ message: "Invalid Product Entry" });
    }
  }

  // get total quantity
  const totalQuantity = products.reduce((acc, product) => {
    return acc + product.quantity;
  }, 0);

  try {
    // if id is undefined CREATE
    if (!id) {
      const record = await BadProduct.create({
        staffResponsible,
        products,
        shortNote,
        totalQuantity,
        recordDate: recordDate.toISOString(),
        recordId: generate_record_id(),
      });

      res.json({ message: "Bad Product Entry Submitted", record });
    }

    // else UPDATE
    else {
      // check if _id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "Record ID not valid" });
      }

      // Check if record exist
      const recordFind = await BadProduct.findById(id);
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

      //   Edit Record
      const record = await BadProduct.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            staffResponsible,
            products,
            shortNote,
            totalQuantity,
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
      res.json({ message: "Bad Product Entry Updated", record });
    }

    //? emit
    io.emit("BadProduct");
  } catch (error) {
    console.log("Error in enter_bad_product_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Verify Bad product record
export const verify_bad_product_record = async (req, res) => {
  const { id, verifiedBy } = req.body;

  // verify all input
  if (!id || !verifiedBy) {
    return res.status(500).json({ message: "Invalid Verification" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Record ID not valid" });
  }

  // Check if product exist
  const record = await BadProduct.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // Check if record is verified
  if (record.verified) {
    return res.status(500).json({ message: "Record verified already" });
  }

  // get all products
  const products = record.products;

  // verify products
  if (!products || products.length < 1) {
    return res.status(500).json({ message: "Record contains No products" });
  }

  // verify each products
  for (let index = 0; index < products.length; index++) {
    const product = products[index];

    if (!product.product || !product.quantity) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(product.product)) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // Check if product exist
    const productExists = await Product.findById(product.product);
    if (!productExists) {
      return res.status(500).json({ message: "Invalid product found" });
    }
  }

  // map products for daily record update
  const daily_rec_products = products.map((product) => {
    return {
      id: product.product,
      quantity: product.quantity,
    };
  });

  // update daily record ( badProduct )
  try {
    const response = await enter_daily_store_record({
      date: record.recordDate.toISOString(),
      field: "badProduct",
      products: daily_rec_products,
    });

    if (response.error) {
      return res
        .status(500)
        .json({ message: response.error, error: response.error });
    }
  } catch (error) {
    console.log("Error in enter_daily_store_record: ", error);
    return res.status(500).json({ message: error, error: error });
  }

  // Update all products (decrease quantity)
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    await update_product_quantity(product.product, product.quantity, false);
  }

  const date = new Date();
  // convert date to local timezone
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  try {
    const record = await BadProduct.findOneAndUpdate(
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
    io.emit("Product");
    io.emit("BadProduct");

    res.json({ message: "Bad Product Entry Verified", record });
  } catch (error) {
    console.log("Error in verify_bad_product_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

//? Enter outlet collection record
export const enter_outletCollection_record = async (req, res) => {
  const {
    id,
    staffResponsible,
    products,
    shortNote,
    editedBy,
    collectionType,
    date,
  } = req.body;

  // verify all fields
  if (!staffResponsible || !products || !collectionType || !date) {
    return res.status(500).json({ message: "Invalid Entry" });
  }

  // verify collection type
  if (collectionType !== "Collected" && collectionType !== "Returned") {
    return res.status(500).json({ message: "Invalid Collection Type" });
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

  // verify products
  if (products.length < 1) {
    return res.status(500).json({ message: "No Products" });
  }

  // Verfiy each product field
  for (let i = 0; i < products.length; i++) {
    if (!products[i].product || !products[i].quantity) {
      return res.status(500).json({ message: "Invalid Product Entry" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(products[i].product)) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // Check if product exist
    const productExists = await Product.findById(products[i].product);
    if (!productExists) {
      return res.status(500).json({ message: "Invalid Product Entry" });
    }
  }

  // get total quantity
  const totalQuantity = products.reduce((acc, product) => {
    return acc + product.quantity;
  }, 0);

  try {
    // if id is undefined CREATE
    if (!id) {
      const record = await OutletCollectionRecord.create({
        staffResponsible,
        products,
        shortNote,
        totalQuantity,
        collectionType,
        recordDate: recordDate.toISOString(),
        recordId: generate_record_id(),
      });

      res.json({ message: "Outlet Collection Entry Submitted", record });
    }

    // else UPDATE
    else {
      // check if _id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "Record ID not valid" });
      }

      // Check if record exist
      const recordFind = await OutletCollectionRecord.findById(id);
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

      //   Edit Record
      const record = await OutletCollectionRecord.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            staffResponsible,
            products,
            shortNote,
            totalQuantity,
            collectionType,
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
      res.json({ message: "Outlet Collection Entry Updated", record });
    }

    //? emit
    io.emit("OutletCollectionRecord");
  } catch (error) {
    console.log("Error in enter_outletCollection_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Verify outlet collection record
export const verify_outletCollection_record = async (req, res) => {
  const { id, verifiedBy } = req.body;

  // verify all input
  if (!id || !verifiedBy) {
    return res.status(500).json({ message: "Invalid Verification" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Record ID not valid" });
  }

  // Check if product exist
  const record = await OutletCollectionRecord.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // Check if record is verified
  if (record.verified) {
    return res.status(500).json({ message: "Record verified already" });
  }

  // get all products
  const products = record.products;

  // verify products
  if (!products || products.length < 1) {
    return res.status(500).json({ message: "Record contains No products" });
  }

  // verify each products
  for (let index = 0; index < products.length; index++) {
    const product = products[index];

    if (!product.product || !product.quantity) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(product.product)) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // Check if product exist
    const productExists = await Product.findById(product.product);
    if (!productExists) {
      return res.status(500).json({ message: "Invalid product found" });
    }
  }

  // map products for daily record update
  const daily_rec_products = products.map((product) => {
    return {
      id: product.product,
      quantity: product.quantity,
    };
  });

  // update daily record ( outletCollected | outletReturn )
  const field =
    record.collectionType == "Collected"
      ? "outletCollected"
      : "outletReturn";
  try {
    const response = await enter_daily_store_record({
      date: record.recordDate.toISOString(),
      field,
      products: daily_rec_products,
    });

    if (response.error) {
      return res
        .status(500)
        .json({ message: response.error, error: response.error });
    }
  } catch (error) {
    console.log("Error in enter_daily_store_record: ", error);
    return res.status(500).json({ message: error, error: error });
  }

  // update outlet daily record ( collected | returned )
  const outletField =
    record.collectionType == "Collected" ? "collected" : "returned";
  try {
    const response = await enter_outlet_daily_sales_record({
      date: record.recordDate.toISOString(),
      field: outletField,
      products: daily_rec_products,
    });

    if (response.error) {
      return res
        .status(500)
        .json({ message: response.error, error: response.error });
    }
  } catch (error) {
    console.log("Error in enter_outlet_daily_sales_record: ", error);
    return res.status(500).json({ message: error, error: error });
  }

  // Update all products (increase | decrease quantity)
  const increase = record.collectionType == "Collected" ? false : true;
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    await update_product_quantity(product.product, product.quantity, increase);
  }

  // Update all outlet products (decrease quantity)
  const increaseOutlet = record.collectionType == "Collected" ? true : false;
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    await update_outlet_product_quantity(
      product.product,
      product.quantity,
      increaseOutlet,
    );
  }

  const date = new Date();
  // convert date to local timezone
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  try {
    const record = await OutletCollectionRecord.findOneAndUpdate(
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
    io.emit("Product");
    io.emit("OutletProduct");
    io.emit("OutletCollectionRecord");

    res.json({ message: "Outlet Collection Entry Verified", record });
  } catch (error) {
    console.log("Error in verify_outletCollection_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

//? Enter terminal collection record
export const enter_terminalCollection_record = async (req, res) => {
  const {
    id,
    staffResponsible,
    products,
    shortNote,
    editedBy,
    collectionType,
    date,
  } = req.body;

  // verify all fields
  if (!staffResponsible || !products || !collectionType || !date) {
    return res.status(500).json({ message: "Invalid Entry" });
  }

  // verify collection type
  if (collectionType !== "Collected" && collectionType !== "Returned") {
    return res.status(500).json({ message: "Invalid Collection Type" });
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

  // verify products
  if (products.length < 1) {
    return res.status(500).json({ message: "No Products" });
  }

  // Verfiy each product field
  for (let i = 0; i < products.length; i++) {
    if (!products[i].product || !products[i].quantity) {
      return res.status(500).json({ message: "Invalid Product Entry" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(products[i].product)) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // Check if product exist
    const productExists = await Product.findById(products[i].product);
    if (!productExists) {
      return res.status(500).json({ message: "Invalid Product Entry" });
    }
  }

  // get total quantity
  const totalQuantity = products.reduce((acc, product) => {
    return acc + product.quantity;
  }, 0);

  try {
    // if id is undefined CREATE
    if (!id) {
      const record = await TerminalCollectionRecord.create({
        staffResponsible,
        products,
        shortNote,
        totalQuantity,
        collectionType,
        recordDate: recordDate.toISOString(),
        recordId: generate_record_id(),
      });

      res.json({ message: "Terminal Collection Entry Submitted", record });
    }

    // else UPDATE
    else {
      // check if _id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "Record ID not valid" });
      }

      // Check if record exist
      const recordFind = await TerminalCollectionRecord.findById(id);
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

      //   Edit Record
      const record = await TerminalCollectionRecord.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            staffResponsible,
            products,
            shortNote,
            totalQuantity,
            collectionType,
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
      res.json({ message: "Terminal Collection Entry Updated", record });
    }

    //? emit
    io.emit("TerminalCollectionRecord");
  } catch (error) {
    console.log("Error in enter_terminalCollection_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Verify terminal collection record
export const verify_terminalCollection_record = async (req, res) => {
  const { id, verifiedBy } = req.body;

  // verify all input
  if (!id || !verifiedBy) {
    return res.status(500).json({ message: "Invalid Verification" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Record ID not valid" });
  }

  // Check if product exist
  const record = await TerminalCollectionRecord.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // Check if record is verified
  if (record.verified) {
    return res.status(500).json({ message: "Record verified already" });
  }

  // get all products
  const products = record.products;

  // verify products
  if (!products || products.length < 1) {
    return res.status(500).json({ message: "Record contains No products" });
  }

  // verify each products
  for (let index = 0; index < products.length; index++) {
    const product = products[index];

    if (!product.product || !product.quantity) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(product.product)) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // Check if product exist
    const productExists = await Product.findById(product.product);
    if (!productExists) {
      return res.status(500).json({ message: "Invalid product found" });
    }
  }

  // map products for daily record update
  const daily_rec_products = products.map((product) => {
    return {
      id: product.product,
      quantity: product.quantity,
    };
  });

  // update daily record ( terminalCollected | terminalReturn )
  const field =
    record.collectionType == "Collected"
      ? "terminalCollected"
      : "terminalReturn";
  try {
    const response = await enter_daily_store_record({
      date: record.recordDate.toISOString(),
      field,
      products: daily_rec_products,
    });

    if (response.error) {
      return res
        .status(500)
        .json({ message: response.error, error: response.error });
    }
  } catch (error) {
    console.log("Error in enter_daily_store_record: ", error);
    return res.status(500).json({ message: error, error: error });
  }

  // update terminal daily record ( collected | returned )
  const terminalField =
    record.collectionType == "Collected" ? "collected" : "returned";
  try {
    const response = await enter_terminal_daily_sales_record({
      date: record.recordDate.toISOString(),
      field: terminalField,
      products: daily_rec_products,
    });

    if (response.error) {
      return res
        .status(500)
        .json({ message: response.error, error: response.error });
    }
  } catch (error) {
    console.log("Error in enter_terminal_daily_sales_record: ", error);
    return res.status(500).json({ message: error, error: error });
  }

  // Update all products (increase | decrease quantity)
  const increase = record.collectionType == "Collected" ? false : true;
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    await update_product_quantity(product.product, product.quantity, increase);
  }

  // Update all terminal products (decrease quantity)
  const increaseTerminal = record.collectionType == "Collected" ? true : false;
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    await update_terminal_product_quantity(
      product.product,
      product.quantity,
      increaseTerminal,
    );
  }

  const date = new Date();
  // convert date to local timezone
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  try {
    const record = await TerminalCollectionRecord.findOneAndUpdate(
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
    io.emit("Product");
    io.emit("TerminalProduct");
    io.emit("TerminalCollectionRecord");

    res.json({ message: "Terminal Collection Entry Verified", record });
  } catch (error) {
    console.log("Error in verify_terminalCollection_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

//? Enter dangote collection record
export const enter_dangoteCollection_record = async (req, res) => {
  const {
    id,
    staffResponsible,
    products,
    shortNote,
    editedBy,
    collectionType,
    date,
  } = req.body;

  // verify all fields
  if (!staffResponsible || !products || !collectionType || !date) {
    return res.status(500).json({ message: "Invalid Entry" });
  }

  // verify collection type
  if (collectionType !== "Collected" && collectionType !== "Returned") {
    return res.status(500).json({ message: "Invalid Collection Type" });
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

  // verify products
  if (products.length < 1) {
    return res.status(500).json({ message: "No Products" });
  }

  // Verfiy each product field
  for (let i = 0; i < products.length; i++) {
    if (!products[i].product || !products[i].quantity) {
      return res.status(500).json({ message: "Invalid Product Entry" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(products[i].product)) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // Check if product exist
    const productExists = await Product.findById(products[i].product);
    if (!productExists) {
      return res.status(500).json({ message: "Invalid Product Entry" });
    }
  }

  // get total quantity
  const totalQuantity = products.reduce((acc, product) => {
    return acc + product.quantity;
  }, 0);

  try {
    // if id is undefined CREATE
    if (!id) {
      const record = await DangoteCollectionRecord.create({
        staffResponsible,
        products,
        shortNote,
        totalQuantity,
        collectionType,
        recordDate: recordDate.toISOString(),
        recordId: generate_record_id(),
      });

      res.json({ message: "Dangote Collection Entry Submitted", record });
    }

    // else UPDATE
    else {
      // check if _id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "Record ID not valid" });
      }

      // Check if record exist
      const recordFind = await DangoteCollectionRecord.findById(id);
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

      //   Edit Record
      const record = await DangoteCollectionRecord.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            staffResponsible,
            products,
            shortNote,
            totalQuantity,
            collectionType,
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
      res.json({ message: "Dangote Collection Entry Updated", record });
    }

    //? emit
    io.emit("DangoteCollectionRecord");
  } catch (error) {
    console.log("Error in enter_dangoteCollection_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Verify dangote collection record
export const verify_dangoteCollection_record = async (req, res) => {
  const { id, verifiedBy } = req.body;

  // verify all input
  if (!id || !verifiedBy) {
    return res.status(500).json({ message: "Invalid Verification" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Record ID not valid" });
  }

  // Check if product exist
  const record = await DangoteCollectionRecord.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // Check if record is verified
  if (record.verified) {
    return res.status(500).json({ message: "Record verified already" });
  }

  // get all products
  const products = record.products;

  // verify products
  if (!products || products.length < 1) {
    return res.status(500).json({ message: "Record contains No products" });
  }

  // verify each products
  for (let index = 0; index < products.length; index++) {
    const product = products[index];

    if (!product.product || !product.quantity) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(product.product)) {
      return res.status(500).json({ message: "Invalid product found" });
    }

    // Check if product exist
    const productExists = await Product.findById(product.product);
    if (!productExists) {
      return res.status(500).json({ message: "Invalid product found" });
    }
  }

  // map products for daily record update
  const daily_rec_products = products.map((product) => {
    return {
      id: product.product,
      quantity: product.quantity,
    };
  });

  // update daily record ( dangoteCollected | dangoteReturn )
  const field =
    record.collectionType == "Collected" ? "dangoteCollected" : "dangoteReturn";
  try {
    const response = await enter_daily_store_record({
      date: record.recordDate.toISOString(),
      field,
      products: daily_rec_products,
    });

    if (response.error) {
      return res
        .status(500)
        .json({ message: response.error, error: response.error });
    }
  } catch (error) {
    console.log("Error in enter_daily_store_record: ", error);
    return res.status(500).json({ message: error, error: error });
  }

  // update dangote daily record ( collected | returned )
  const dangoteField =
    record.collectionType == "Collected" ? "collected" : "returned";
  try {
    const response = await enter_dangote_daily_sales_record({
      date: record.recordDate.toISOString(),
      field: dangoteField,
      products: daily_rec_products,
    });

    if (response.error) {
      return res
        .status(500)
        .json({ message: response.error, error: response.error });
    }
  } catch (error) {
    console.log("Error in enter_dangote_daily_sales_record: ", error);
    return res.status(500).json({ message: error, error: error });
  }

  // Update all products (increase | decrease quantity)
  const increase = record.collectionType == "Collected" ? false : true;
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    await update_product_quantity(product.product, product.quantity, increase);
  }

  // Update all dangote products (decrease quantity)
  const increaseDangote = record.collectionType == "Collected" ? true : false;
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    await update_dangote_product_quantity(
      product.product,
      product.quantity,
      increaseDangote,
    );
  }

  const date = new Date();
  // convert date to local timezone
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  try {
    const record = await DangoteCollectionRecord.findOneAndUpdate(
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
    io.emit("Product");
    io.emit("DangoteProduct");
    io.emit("DangoteCollectionRecord");

    res.json({ message: "Dangote Collection Entry Verified", record });
  } catch (error) {
    console.log("Error in verify_dangoteCollection_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

//?

// Add/update product category
export const add_update_product_category = async (req, res) => {
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
      const categoryExists = await ProductCategory.findOne({ category });

      // if category already exist
      if (categoryExists) {
        return res.status(500).json({ message: "Category already exist" });
      }

      const sortExists = await ProductCategory.findOne({ sort });

      // if category already exist
      if (sortExists) {
        return res.status(500).json({ message: "Sort already exist" });
      }

      const newCategory = await ProductCategory.create({
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
      const categoryExists = await ProductCategory.findById(id);
      if (!categoryExists) {
        return res.status(500).json({ message: "Category does not exist" });
      }

      const sortExists = await ProductCategory.findOne({ sort });

      // if category already exist
      if (sortExists && sortExists._id != id) {
        return res.status(500).json({ message: "Sort already exist" });
      }

      const newCategory = await ProductCategory.findOneAndUpdate(
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
    io.emit("ProductCategory");
  } catch (error) {
    console.log("Error in add_update_product_category: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// // Enter production request record

//  ! REMOVALS

// Delete product
export const delete_product = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(500).json({ message: "Product ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Product ID not valid" });
  }

  // Check if product exist
  const productExists = await Product.findById(id);
  if (!productExists) {
    return res.status(500).json({ message: "Product does not exist" });
  }

  try {
    await Product.findByIdAndDelete(id);

    //? emit
    io.emit("Product");

    res.json({ message: "Product deleted Sucessfully" });
  } catch (error) {
    console.log("Error in delete_product: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

//?

// Delete Production record
export const delete_production_record = async (req, res) => {
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
  const record = await ProductionRecord.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // check if record is verified
  if (record.verified) {
    const products = record.products;
    // Check is user is permitted
    if (!isAllowed) {
      return res.status(500).json({ message: "Unathorized to Delete" });
    }

    // User allowed to delete
    else {
      // map products for daily record update
      const daily_rec_products = products.map((product) => {
        return {
          id: product.product,
          quantity: -product.quantity,
        };
      });

      // update daily record ( added )
      try {
        const response = await enter_daily_store_record({
          date: record.recordDate.toISOString(),
          field: "added",
          products: daily_rec_products,
        });

        if (response.error) {
          return res
            .status(500)
            .json({ message: response.error, error: response.error });
        }
      } catch (error) {
        console.log("Error in enter_daily_store_record: ", error);
        return res.status(500).json({ message: error, error: error });
      }

      // Update all products (decrease quantity)
      for (let index = 0; index < products.length; index++) {
        const product = products[index];
        await update_product_quantity(product.product, product.quantity, false);
      }

      //? emit
      io.emit("Product");
    }
  }

  // delete record
  try {
    await ProductionRecord.findByIdAndDelete(id);

    //? emit
    io.emit("ProductionRecord");

    res.json({ message: "Record deleted Sucessfully" });
  } catch (error) {
    console.log("Error in delete_production_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Delete product received record
export const delete_product_received_record = async (req, res) => {
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
  const record = await ProductReceived.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // check if record is verified
  if (record.verified) {
    const products = record.products;
    // Check is user is permitted
    if (!isAllowed) {
      return res.status(500).json({ message: "Unathorized to Delete" });
    }

    // User allowed to delete
    else {
      // map products for daily record update
      const daily_rec_products = products.map((product) => {
        return {
          id: product.product,
          quantity: -product.quantity,
        };
      });

      // update daily record ( added )
      try {
        const response = await enter_daily_store_record({
          date: record.recordDate.toISOString(),
          field: "added",
          products: daily_rec_products,
        });

        if (response.error) {
          return res
            .status(500)
            .json({ message: response.error, error: response.error });
        }
      } catch (error) {
        console.log("Error in enter_daily_store_record: ", error);
        return res.status(500).json({ message: error, error: error });
      }

      // Update all products (decrease quantity)
      for (let index = 0; index < products.length; index++) {
        const product = products[index];
        await update_product_quantity(product.product, product.quantity, false);
      }

      //? emit
      io.emit("Product");
    }
  }

  // delete record
  try {
    await ProductReceived.findByIdAndDelete(id);

    //? emit
    io.emit("ProductReceived");

    res.json({ message: "Record deleted Sucessfully" });
  } catch (error) {
    console.log("Error in delete_product_received_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Delete product request record
export const delete_product_request_record = async (req, res) => {
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
  const record = await ProductRequest.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // check if record is verified
  if (record.verified) {
    const products = record.products;
    // Check is user is permitted
    if (!isAllowed) {
      return res.status(500).json({ message: "Unathorized to Delete" });
    }

    // User allowed to delete
    else {
      // map products for daily record update
      const daily_rec_products = products.map((product) => {
        return {
          id: product.product,
          quantity: -product.quantity,
        };
      });

      // update daily record ( request )
      try {
        const response = await enter_daily_store_record({
          date: record.recordDate.toISOString(),
          field: "request",
          products: daily_rec_products,
        });

        if (response.error) {
          return res
            .status(500)
            .json({ message: response.error, error: response.error });
        }
      } catch (error) {
        console.log("Error in enter_daily_store_record: ", error);
        return res.status(500).json({ message: error, error: error });
      }

      // Update all products (increase quantity)
      for (let index = 0; index < products.length; index++) {
        const product = products[index];
        await update_product_quantity(product.product, product.quantity, true);
      }

      //? emit
      io.emit("Product");
    }
  }

  // delete record
  try {
    await ProductRequest.findByIdAndDelete(id);

    //? emit
    io.emit("ProductRequest");

    res.json({ message: "Record deleted Sucessfully" });
  } catch (error) {
    console.log("Error in delete_product_request_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Delete product takeOut record
export const delete_product_takeOut_record = async (req, res) => {
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
  const record = await ProductTakeOut.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // check if record is verified
  if (record.verified) {
    const products = record.products;
    // Check is user is permitted
    if (!isAllowed) {
      return res.status(500).json({ message: "Unathorized to Delete" });
    }

    // User allowed to delete
    else {
      // map products for daily record update
      const daily_rec_products = products.map((product) => {
        return {
          id: product.product,
          quantity: -product.quantity,
        };
      });

      // update daily record ( takeOut )
      try {
        const response = await enter_daily_store_record({
          date: record.recordDate.toISOString(),
          field: "takeOut",
          products: daily_rec_products,
        });

        if (response.error) {
          return res
            .status(500)
            .json({ message: response.error, error: response.error });
        }
      } catch (error) {
        console.log("Error in enter_daily_store_record: ", error);
        return res.status(500).json({ message: error, error: error });
      }

      // Update all products (increase quantity)
      for (let index = 0; index < products.length; index++) {
        const product = products[index];
        await update_product_quantity(product.product, product.quantity, true);
      }

      //? emit
      io.emit("Product");
    }
  }

  // delete record
  try {
    await ProductTakeOut.findByIdAndDelete(id);

    //? emit
    io.emit("ProductTakeOut");

    res.json({ message: "Record deleted Sucessfully" });
  } catch (error) {
    console.log("Error in delete_product_takeOut_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Delete product return record
export const delete_product_return_record = async (req, res) => {
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
  const record = await ProductReturn.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // check if record is verified
  if (record.verified) {
    const products = record.products;
    // Check is user is permitted
    if (!isAllowed) {
      return res.status(500).json({ message: "Unathorized to Delete" });
    }

    // User allowed to delete
    else {
      // map products for daily record update
      const daily_rec_products = products.map((product) => {
        return {
          id: product.product,
          quantity: -product.quantity,
        };
      });

      // update daily record ( return )
      try {
        const response = await enter_daily_store_record({
          date: record.recordDate.toISOString(),
          field: "return",
          products: daily_rec_products,
        });

        if (response.error) {
          return res
            .status(500)
            .json({ message: response.error, error: response.error });
        }
      } catch (error) {
        console.log("Error in enter_daily_store_record: ", error);
        return res.status(500).json({ message: error, error: error });
      }

      // Update all products (decrease quantity)
      for (let index = 0; index < products.length; index++) {
        const product = products[index];
        await update_product_quantity(product.product, product.quantity, false);
      }

      //? emit
      io.emit("Product");
    }
  }

  // delete record
  try {
    await ProductReturn.findByIdAndDelete(id);

    //? emit
    io.emit("ProductReturn");

    res.json({ message: "Record deleted Sucessfully" });
  } catch (error) {
    console.log("Error in delete_product_return_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Delete Bad product record
export const delete_bad_product_record = async (req, res) => {
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
  const record = await BadProduct.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // check if record is verified
  if (record.verified) {
    const products = record.products;
    // Check is user is permitted
    if (!isAllowed) {
      return res.status(500).json({ message: "Unathorized to Delete" });
    }

    // User allowed to delete
    else {
      // map products for daily record update
      const daily_rec_products = products.map((product) => {
        return {
          id: product.product,
          quantity: -product.quantity,
        };
      });

      // update daily record ( badProduct )
      try {
        const response = await enter_daily_store_record({
          date: record.recordDate.toISOString(),
          field: "badProduct",
          products: daily_rec_products,
        });

        if (response.error) {
          return res
            .status(500)
            .json({ message: response.error, error: response.error });
        }
      } catch (error) {
        console.log("Error in enter_daily_store_record: ", error);
        return res.status(500).json({ message: error, error: error });
      }

      // Update all products (increase quantity)
      for (let index = 0; index < products.length; index++) {
        const product = products[index];
        await update_product_quantity(product.product, product.quantity, true);
      }

      //? emit
      io.emit("Product");
    }
  }

  // delete record
  try {
    await BadProduct.findByIdAndDelete(id);

    //? emit
    io.emit("BadProduct");

    res.json({ message: "Record deleted Sucessfully" });
  } catch (error) {
    console.log("Error in delete_bad_product_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Delete outlet collection record
export const delete_outletCollection_record = async (req, res) => {
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
  const record = await OutletCollectionRecord.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // check if record is verified
  if (record.verified) {
    const products = record.products;
    // Check is user is permitted
    if (!isAllowed) {
      return res.status(500).json({ message: "Unathorized to Delete" });
    }

    // User allowed to delete
    else {
      // map products for daily record update
      const daily_rec_products = products.map((product) => {
        return {
          id: product.product,
          quantity: -product.quantity,
        };
      });

      // update daily record ( outletCollected | outletReturn )
      const field =
        record.collectionType == "Collected"
          ? "outletCollected"
          : "outletReturn";
      try {
        const response = await enter_daily_store_record({
          date: record.recordDate.toISOString(),
          field,
          products: daily_rec_products,
        });

        if (response.error) {
          return res
            .status(500)
            .json({ message: response.error, error: response.error });
        }
      } catch (error) {
        console.log("Error in enter_daily_store_record: ", error);
        return res.status(500).json({ message: error, error: error });
      }

      // update outlet daily record ( collected | returned )
      const outletField =
        record.collectionType == "Collected" ? "collected" : "returned";
      try {
        const response = await enter_outlet_daily_sales_record({
          date: record.recordDate.toISOString(),
          field: outletField,
          products: daily_rec_products,
        });

        if (response.error) {
          return res
            .status(500)
            .json({ message: response.error, error: response.error });
        }
      } catch (error) {
        console.log("Error in enter_outlet_daily_sales_record: ", error);
        return res.status(500).json({ message: error, error: error });
      }

      // Update all products (incearse | decrease quantity)
      const increase = record.collectionType == "Collected" ? true : false;
      for (let index = 0; index < products.length; index++) {
        const product = products[index];
        await update_product_quantity(
          product.product,
          product.quantity,
          increase,
        );
      }

      // Update all outlet products (decrease quantity)
      const increaseOutlet =
        record.collectionType == "Collected" ? false : true;
      for (let index = 0; index < products.length; index++) {
        const product = products[index];
        await update_outlet_product_quantity(
          product.product,
          product.quantity,
          increaseOutlet,
        );
      }

      //? emit
      io.emit("Product");
      io.emit("OutletProduct");
    }
  }

  // delete record
  try {
    await OutletCollectionRecord.findByIdAndDelete(id);

    //? emit
    io.emit("OutletCollectionRecord");

    res.json({ message: "Record deleted Sucessfully" });
  } catch (error) {
    console.log("Error in delete_outletCollection_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Delete terminal collection record
export const delete_terminalCollection_record = async (req, res) => {
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
  const record = await TerminalCollectionRecord.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // check if record is verified
  if (record.verified) {
    const products = record.products;
    // Check is user is permitted
    if (!isAllowed) {
      return res.status(500).json({ message: "Unathorized to Delete" });
    }

    // User allowed to delete
    else {
      // map products for daily record update
      const daily_rec_products = products.map((product) => {
        return {
          id: product.product,
          quantity: -product.quantity,
        };
      });

      // update daily record ( terminalCollected | terminalReturn )
      const field =
        record.collectionType == "Collected"
          ? "terminalCollected"
          : "terminalReturn";
      try {
        const response = await enter_daily_store_record({
          date: record.recordDate.toISOString(),
          field,
          products: daily_rec_products,
        });

        if (response.error) {
          return res
            .status(500)
            .json({ message: response.error, error: response.error });
        }
      } catch (error) {
        console.log("Error in enter_daily_store_record: ", error);
        return res.status(500).json({ message: error, error: error });
      }

      // update terminal daily record ( collected | returned )
      const terminalField =
        record.collectionType == "Collected" ? "collected" : "returned";
      try {
        const response = await enter_terminal_daily_sales_record({
          date: record.recordDate.toISOString(),
          field: terminalField,
          products: daily_rec_products,
        });

        if (response.error) {
          return res
            .status(500)
            .json({ message: response.error, error: response.error });
        }
      } catch (error) {
        console.log("Error in enter_terminal_daily_sales_record: ", error);
        return res.status(500).json({ message: error, error: error });
      }

      // Update all products (incearse | decrease quantity)
      const increase = record.collectionType == "Collected" ? true : false;
      for (let index = 0; index < products.length; index++) {
        const product = products[index];
        await update_product_quantity(
          product.product,
          product.quantity,
          increase,
        );
      }

      // Update all terminal products (decrease quantity)
      const increaseTerminal =
        record.collectionType == "Collected" ? false : true;
      for (let index = 0; index < products.length; index++) {
        const product = products[index];
        await update_terminal_product_quantity(
          product.product,
          product.quantity,
          increaseTerminal,
        );
      }

      //? emit
      io.emit("Product");
      io.emit("TerminalProduct");
    }
  }

  // delete record
  try {
    await TerminalCollectionRecord.findByIdAndDelete(id);

    //? emit
    io.emit("TerminalCollectionRecord");

    res.json({ message: "Record deleted Sucessfully" });
  } catch (error) {
    console.log("Error in delete_terminalCollection_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Delete dangote collection record
export const delete_dangoteCollection_record = async (req, res) => {
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
  const record = await DangoteCollectionRecord.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // check if record is verified
  if (record.verified) {
    const products = record.products;
    // Check is user is permitted
    if (!isAllowed) {
      return res.status(500).json({ message: "Unathorized to Delete" });
    }

    // User allowed to delete
    else {
      // map products for daily record update
      const daily_rec_products = products.map((product) => {
        return {
          id: product.product,
          quantity: -product.quantity,
        };
      });

      // update daily record ( dangoteCollected | dangoteReturn )
      const field =
        record.collectionType == "Collected"
          ? "dangoteCollected"
          : "dangoteReturn";
      try {
        const response = await enter_daily_store_record({
          date: record.recordDate.toISOString(),
          field,
          products: daily_rec_products,
        });

        if (response.error) {
          return res
            .status(500)
            .json({ message: response.error, error: response.error });
        }
      } catch (error) {
        console.log("Error in enter_daily_store_record: ", error);
        return res.status(500).json({ message: error, error: error });
      }

      // update dangote daily record ( collected | returned )
      const dangoteField =
        record.collectionType == "Collected" ? "collected" : "returned";
      try {
        const response = await enter_dangote_daily_sales_record({
          date: record.recordDate.toISOString(),
          field: dangoteField,
          products: daily_rec_products,
        });

        if (response.error) {
          return res
            .status(500)
            .json({ message: response.error, error: response.error });
        }
      } catch (error) {
        console.log("Error in enter_dangote_daily_sales_record: ", error);
        return res.status(500).json({ message: error, error: error });
      }

      // Update all products (incearse | decrease quantity)
      const increase = record.collectionType == "Collected" ? true : false;
      for (let index = 0; index < products.length; index++) {
        const product = products[index];
        await update_product_quantity(
          product.product,
          product.quantity,
          increase,
        );
      }

      // Update all dangote products (decrease quantity)
      const increaseDangote =
        record.collectionType == "Collected" ? false : true;
      for (let index = 0; index < products.length; index++) {
        const product = products[index];
        await update_dangote_product_quantity(
          product.product,
          product.quantity,
          increaseDangote,
        );
      }

      //? emit
      io.emit("Product");
      io.emit("DangoteProduct");
    }
  }

  // delete record
  try {
    await DangoteCollectionRecord.findByIdAndDelete(id);

    //? emit
    io.emit("DangoteCollectionRecord");

    res.json({ message: "Record deleted Sucessfully" });
  } catch (error) {
    console.log("Error in delete_dangoteCollection_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

//?

// Delete product category
export const delete_product_category = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(500).json({ message: "Category ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Category ID not valid" });
  }

  // Check if product exist
  const categoryExists = await ProductCategory.findById(id);
  if (!categoryExists) {
    return res.status(500).json({ message: "Category does not exist" });
  }

  try {
    await ProductCategory.findByIdAndDelete(id);

    //? emit
    io.emit("ProductCategory");

    res.json({ message: "Category deleted Sucessfully" });
  } catch (error) {
    console.log("Error in delete_product_category: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// // Delete production request record

// ! Utils

// get all products
export const get_all_products = async () => {
  try {
    const products = await Product.find({});
    return products;
  } catch (error) {
    console.log("Error in get_all_products utils:", error.message);
    return { error: error.message };
  }
};

// get outlet products
export const get_all_outlet_products = async () => {
  try {
    const products = await OutletProduct.find({});
    return products;
  } catch (error) {
    console.log("Error in get_outlet_products utils:", error.message);
    return { error: error.message };
  }
};

// get terminal products
export const get_all_terminal_products = async () => {
  try {
    const products = await TerminalProduct.find({});
    return products;
  } catch (error) {
    console.log("Error in get_terminal_products utils:", error.message);
    return { error: error.message };
  }
};

// get dangote products
export const get_all_dangote_products = async () => {
  try {
    const products = await DangoteProduct.find({});
    return products;
  } catch (error) {
    console.log("Error in get_dangote_products utils:", error.message);
    return { error: error.message };
  }
};

//?

// update product quantity
export const update_product_quantity = async (id, quantity, increament) => {
  if (increament === undefined) {
    return { error: "No increament attribute" };
  }

  const finalQuantity = increament ? quantity : -quantity;

  // check if _id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { error: "Product ID not valid" };
  }

  // Check if product exist
  const productExists = await Product.findById(id);
  if (!productExists) {
    return { error: "Product does not exist" };
  }

  try {
    const product = await Product.findOneAndUpdate(
      { _id: id },
      {
        $inc: {
          quantity: finalQuantity,
        },
      },
      { new: true },
    );

    return { message: "Product updated" };
  } catch (error) {
    console.log("Error in update_product_quantity: ", error.message);
    return { error: error.message };
  }
};

// update outlet product quantity
export const update_outlet_product_quantity = async (
  id,
  quantity,
  increament,
) => {
  if (increament === undefined) {
    return { error: "No increament attribute" };
  }

  const finalQuantity = increament ? quantity : -quantity;

  // check if _id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { error: "Product ID not valid" };
  }

  // Check if product exist
  const productExists = await OutletProduct.findById(id);
  if (!productExists) {
    const newP = await Product.findById(id);

    const product = await OutletProduct.create({
      _id: newP._id,
      name: newP.name,
      code: newP.code,
      category: newP.category,
      quantity: finalQuantity,
      storePrice: newP.storePrice,
      isAvailable: newP.isAvailable,
      sort: newP.sort,
    });
  } else {
    try {
      const product = await OutletProduct.findOneAndUpdate(
        { _id: id },
        {
          $inc: {
            quantity: finalQuantity,
          },
        },
        { new: true },
      );

      return { message: "Product updated" };
    } catch (error) {
      console.log("Error in update_outlet_product_quantity: ", error.message);
      return { error: error.message };
    }
  }
};

// update terminal product quantity
export const update_terminal_product_quantity = async (
  id,
  quantity,
  increament,
) => {
  if (increament === undefined) {
    return { error: "No increament attribute" };
  }

  const finalQuantity = increament ? quantity : -quantity;

  // check if _id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { error: "Product ID not valid" };
  }

  // Check if product exist
  const productExists = await TerminalProduct.findById(id);
  if (!productExists) {
    const newP = await Product.findById(id);

    const product = await TerminalProduct.create({
      _id: newP._id,
      name: newP.name,
      code: newP.code,
      category: newP.category,
      quantity: finalQuantity,
      storePrice: newP.storePrice,
      isAvailable: newP.isAvailable,
      sort: newP.sort,
    });
  } else {
    try {
      const product = await TerminalProduct.findOneAndUpdate(
        { _id: id },
        {
          $inc: {
            quantity: finalQuantity,
          },
        },
        { new: true },
      );

      return { message: "Product updated" };
    } catch (error) {
      console.log("Error in update_terminal_product_quantity: ", error.message);
      return { error: error.message };
    }
  }
};

// update dangote product quantity
export const update_dangote_product_quantity = async (
  id,
  quantity,
  increament,
) => {
  if (increament === undefined) {
    return { error: "No increament attribute" };
  }

  const finalQuantity = increament ? quantity : -quantity;

  // check if _id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { error: "Product ID not valid" };
  }

  // Check if product exist
  const productExists = await DangoteProduct.findById(id);
  if (!productExists) {
    const newP = await Product.findById(id);

    const product = await DangoteProduct.create({
      _id: newP._id,
      name: newP.name,
      code: newP.code,
      category: newP.category,
      quantity: finalQuantity,
      storePrice: newP.storePrice,
      isAvailable: newP.isAvailable,
      sort: newP.sort,
    });
  } else {
    try {
      const product = await DangoteProduct.findOneAndUpdate(
        { _id: id },
        {
          $inc: {
            quantity: finalQuantity,
          },
        },
        { new: true },
      );

      return { message: "Product updated" };
    } catch (error) {
      console.log("Error in update_dangote_product_quantity: ", error.message);
      return { error: error.message };
    }
  }
};

// generate record Id
export const generate_record_id = () => {
  return "" + nanoid(11);
};
