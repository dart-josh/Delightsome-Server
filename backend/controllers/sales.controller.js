// ! GETTERS

import { DailySalesRecord } from "../models/saleModels/dailySales.model.js";
import SalesRecord from "../models/saleModels/sales.model.js";
import { DangoteDailySalesRecord, TerminalDailySalesRecord } from "../models/saleModels/terminalDailySales.model.js";
import TerminalSalesRecord, { DangoteSalesRecord } from "../models/saleModels/terminalSales.model.js";
import BadProduct from "../models/storeModels/badProduct.model.js";
import Product from "../models/storeModels/product.model.js";
import ProductionRecord from "../models/storeModels/productionRecord.model.js";
import ProductReceived from "../models/storeModels/productReceived.model.js";
import ProductRequest from "../models/storeModels/productRequest.model.js";
import TerminalCollectionRecord from "../models/storeModels/terminalCollection.model.js";
import TerminalProduct, { DangoteProduct } from "../models/storeModels/terminalProduct.model.js";
import {
  get_all_dangote_products,
  get_all_products,
  get_all_terminal_products,
  update_dangote_product_quantity,
  update_product_quantity,
  update_terminal_product_quantity,
} from "./store.controller.js";
import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { io } from "../socket/socket.js";
import ProductTakeOut from "../models/storeModels/productTakeOut.model.js";
import ProductReturn from "../models/storeModels/productReturn.model.js";

// ! GETTERS

// Get sales record
export const get_sales_record = async (req, res) => {
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
    const record = await SalesRecord.find(query)
      .sort({ recordDate: -1 })
      .populate({
        path: "products.product",
        select: ["name", "code", "category", "sort"],
      })
      .populate({
        path: "customer",
        select: ["nickName", "fullname", "customerType"],
      })
      .populate({
        path: "soldBy",
        select: ["nickName", "role", "staffId"],
      });
    res.json({ record });
  } catch (error) {
    console.log("Error in get_sales_record controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// Get Terminal sales record
export const get_terminal_sales_record = async (req, res) => {
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
    const record = await TerminalSalesRecord.find(query)
      .sort({ recordDate: -1 })
      .populate({
        path: "products.product",
        select: ["name", "code", "category", "sort"],
      })
      .populate({
        path: "customer",
        select: ["nickName", "fullname", "customerType"],
      })
      .populate({
        path: "soldBy",
        select: ["nickName", "role", "staffId"],
      });
    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_terminal_sales_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// Get Dangote sales record
export const get_dangote_sales_record = async (req, res) => {
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
    const record = await DangoteSalesRecord.find(query)
      .sort({ recordDate: -1 })
      .populate({
        path: "products.product",
        select: ["name", "code", "category", "sort"],
      })
      .populate({
        path: "customer",
        select: ["nickName", "fullname", "customerType"],
      })
      .populate({
        path: "soldBy",
        select: ["nickName", "role", "staffId"],
      });
    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_dangote_sales_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

//? Get selected sales record
export const get_selected_sales_record = async (req, res) => {
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
    const record = await SalesRecord.aggregate([
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
      query,
      { $sort: { recordDate: -1 } },
    ]);

    await Promise.all(
      await SalesRecord.populate(record, {
        path: "products.product",
        select: ["name", "code", "category", "sort"],
      }),

      await SalesRecord.populate(record, {
        path: "customer",
        select: ["nickName", "fullname", "customerType"],
      }),

      await SalesRecord.populate(record, {
        path: "soldBy",
        select: ["nickName", "role", "staffId"],
      }),
    );

    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_selected_sales_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

//? Get selected terminal sales record
export const get_selected_terminal_sales_record = async (req, res) => {
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
    const record = await TerminalSalesRecord.aggregate([
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
      query,
      { $sort: { recordDate: -1 } },
    ]);

    await Promise.all(
      await TerminalSalesRecord.populate(record, {
        path: "products.product",
        select: ["name", "code", "category", "sort"],
      }),

      await TerminalSalesRecord.populate(record, {
        path: "customer",
        select: ["nickName", "fullname", "customerType"],
      }),

      await TerminalSalesRecord.populate(record, {
        path: "soldBy",
        select: ["nickName", "role", "staffId"],
      }),
    );

    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_selected_terminal_sales_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

//? Get selected dangote sales record
export const get_selected_dangote_sales_record = async (req, res) => {
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
    const record = await DangoteSalesRecord.aggregate([
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
      query,
      { $sort: { recordDate: -1 } },
    ]);

    await Promise.all(
      await DangoteSalesRecord.populate(record, {
        path: "products.product",
        select: ["name", "code", "category", "sort"],
      }),

      await DangoteSalesRecord.populate(record, {
        path: "customer",
        select: ["nickName", "fullname", "customerType"],
      }),

      await DangoteSalesRecord.populate(record, {
        path: "soldBy",
        select: ["nickName", "role", "staffId"],
      }),
    );

    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_selected_dangote_sales_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// Get daily sales record
export const get_daily_sales_record = async (req, res) => {
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
      { date: { $lte: formatDate(localDate.toISOString()) } },
      { date: { $gte: formatDate(threeMonthAgo.toISOString()) } },
    ],
  };

  try {
    const record = await DailySalesRecord.find(query)
      .sort({ date: -1 })
      // .limit(30)
      .populate({
        path: "products.product",
        select: [
          "name",
          "code",
          "category",
          "sort",
          "storePrice",
          "onlinePrice",
        ],
      });
    res.json({ record });
  } catch (error) {
    console.log("Error in get_daily_sales_record controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// Get terminal daily sales record
export const get_terminal_daily_sales_record = async (req, res) => {
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
      { date: { $lte: formatDate(localDate.toISOString()) } },
      { date: { $gte: formatDate(threeMonthAgo.toISOString()) } },
    ],
  };

  try {
    const record = await TerminalDailySalesRecord.find(query)
      .sort({ date: -1 })
      // .limit(30)
      .populate({
        path: "products.product",
        select: [
          "name",
          "code",
          "category",
          "sort",
          "storePrice",
          "onlinePrice",
        ],
      });
    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_terminal_daily_sales_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// Get dangote daily sales record
export const get_dangote_daily_sales_record = async (req, res) => {
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
      { date: { $lte: formatDate(localDate.toISOString()) } },
      { date: { $gte: formatDate(threeMonthAgo.toISOString()) } },
    ],
  };

  try {
    const record = await DangoteDailySalesRecord.find(query)
      .sort({ date: -1 })
      // .limit(30)
      .populate({
        path: "products.product",
        select: [
          "name",
          "code",
          "category",
          "sort",
          "storePrice",
          "onlinePrice",
        ],
      });
    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_dangote_daily_sales_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// Get selected daily sales record
export const get_selected_daily_sales_record = async (req, res) => {
  const { timeFrame, month, date } = req.body;

  let query = {};

  if (date) {
    query = { date: { $eq: date } };
  } else if (month) {
    query = { date: { $regex: `.*${month}.*` } };
  } else if (timeFrame) {
    if (!timeFrame || timeFrame.length < 2 || timeFrame.length > 2) {
      return res.status(500).json({ message: "Invalid Entry" });
    }

    const start = timeFrame[0];
    const end = timeFrame[1];

    query = { $and: [{ date: { $lte: start } }, { date: { $gte: end } }] };
  } else {
    return res.status(500).json({ message: "Invalid Entry" });
  }

  try {
    const record = await DailySalesRecord.find(query)
      .sort({ date: -1 })
      .populate({
        path: "products.product",
        select: [
          "name",
          "code",
          "category",
          "sort",
          "storePrice",
          "onlinePrice",
        ],
      });
    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_selected_daily_sales_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// Get selected terminal daily sales record
export const get_selected_terminal_daily_sales_record = async (req, res) => {
  const { timeFrame, month, date } = req.body;

  let query = {};

  if (date) {
    query = { date: { $eq: date } };
  } else if (month) {
    query = { date: { $regex: `.*${month}.*` } };
  } else if (timeFrame) {
    if (!timeFrame || timeFrame.length < 2 || timeFrame.length > 2) {
      return res.status(500).json({ message: "Invalid Entry" });
    }

    const start = timeFrame[0];
    const end = timeFrame[1];

    query = { $and: [{ date: { $lte: start } }, { date: { $gte: end } }] };
  } else {
    return res.status(500).json({ message: "Invalid Entry" });
  }

  try {
    const record = await TerminalDailySalesRecord.find(query)
      .sort({ date: -1 })
      .populate({
        path: "products.product",
        select: [
          "name",
          "code",
          "category",
          "sort",
          "storePrice",
          "onlinePrice",
        ],
      });
    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_selected_terminal_daily_sales_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// Get selected dangote daily sales record
export const get_selected_dangote_daily_sales_record = async (req, res) => {
  const { timeFrame, month, date } = req.body;

  let query = {};

  if (date) {
    query = { date: { $eq: date } };
  } else if (month) {
    query = { date: { $regex: `.*${month}.*` } };
  } else if (timeFrame) {
    if (!timeFrame || timeFrame.length < 2 || timeFrame.length > 2) {
      return res.status(500).json({ message: "Invalid Entry" });
    }

    const start = timeFrame[0];
    const end = timeFrame[1];

    query = { $and: [{ date: { $lte: start } }, { date: { $gte: end } }] };
  } else {
    return res.status(500).json({ message: "Invalid Entry" });
  }

  try {
    const record = await DangoteDailySalesRecord.find(query)
      .sort({ date: -1 })
      .populate({
        path: "products.product",
        select: [
          "name",
          "code",
          "category",
          "sort",
          "storePrice",
          "onlinePrice",
        ],
      });
    res.json({ record });
  } catch (error) {
    console.log(
      "Error in get_selected_dangote_daily_sales_record controller:",
      error.message,
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// ! SETTERS

// Enter new sale
export const enter_new_sale = async (req, res) => {
  // get values from body
  const {
    products,
    orderPrice,
    customer,
    shortNote,
    paymentMethod,
    splitPaymentMethod,
    discountPrice,
    soldBy,
    saleType,
    date,
  } = req.body;

  // verify all fields
  if (
    !products ||
    !orderPrice ||
    !paymentMethod ||
    !soldBy ||
    !saleType ||
    !date
  ) {
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
      return res.status(500).json({ message: "Invalid product Entry" });
    }

    // Check if product exist
    const productExists = await Product.findById(products[i].product);
    if (!productExists) {
      return res.status(500).json({ message: "Invalid Product Entry" });
    }
  }

  // Verify saleType
  if (saleType !== "online" && saleType !== "store") {
    return res.status(500).json({ message: "Invalid saleType" });
  }

  // Verify splitPaymentMethod
  if (
    splitPaymentMethod &&
    splitPaymentMethod.length > 0 &&
    (splitPaymentMethod.length < 2 || splitPaymentMethod.length > 3)
  ) {
    return res.status(500).json({ message: "Invalid splitPaymentMethod" });
  }

  // verify splitPaymentMethod fields
  if (splitPaymentMethod && splitPaymentMethod.length > 0) {
    for (let i = 0; i < splitPaymentMethod.length; i++) {
      if (
        !splitPaymentMethod[i].paymentMethod ||
        !splitPaymentMethod[i].amount
      ) {
        return res.status(500).json({ message: "Invalid splitPaymentMethod" });
      }
    }
  }

  // generate order Id
  const orderId = generate_order_id();

  // get total quantity
  const totalQuantity = products.reduce((acc, product) => {
    return acc + product.quantity;
  }, 0);

  // map products for daily record update
  const daily_rec_products = products.map((product) => {
    return {
      id: product.product,
      quantity: product.quantity,
    };
  });

  // update daily record ( online | quantitySold )
  const field = saleType === "online" ? "online" : "quantitySold";
  try {
    const response = await enter_daily_sales_record({
      date: recordDate.toISOString(),
      field,
      products: daily_rec_products,
    });

    if (response.error) {
      return res
        .status(500)
        .json({ message: response.error, error: response.error });
    }
  } catch (error) {
    console.log("Error in enter_daily_sales_record: ", error);
    return res.status(500).json({ message: error, error: error });
  }

  // Update all products (decrease quantity)
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    await update_product_quantity(product.product, product.quantity, false);
  }

  // Enter sale
  try {
    const newSale = new SalesRecord({
      recordDate,
      orderId,
      products,
      orderPrice,
      totalQuantity,
      customer,
      shortNote,
      paymentMethod,
      splitPaymentMethod,
      discountPrice,
      soldBy,
      saleType,
    });

    await newSale.save();

    //? emit
    io.emit("Product");
    io.emit("SalesRecord");

    res.json({ message: "Sale Entered Successfully", newSale });
  } catch (error) {
    console.log("Error in Enter new sales controller:", error.message);
    res.status(409).json({ message: error.message });
  }
};

// Enter new terminal Sales
export const enter_new_terminal_sale = async (req, res) => {
  // get values from body
  const {
    products,
    orderPrice,
    customer,
    shortNote,
    paymentMethod,
    splitPaymentMethod,
    discountPrice,
    soldBy,
    date,
  } = req.body;

  // verify all fields
  if (!products || !orderPrice || !paymentMethod || !soldBy || !date) {
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
      return res.status(500).json({ message: "Invalid product Entry" });
    }

    // Check if product exist
    const productExists = await Product.findById(products[i].product);
    if (!productExists) {
      return res.status(500).json({ message: "Invalid Product Entry" });
    }
  }

  // Verify splitPaymentMethod
  if (
    splitPaymentMethod &&
    splitPaymentMethod.length > 0 &&
    (splitPaymentMethod.length < 2 || splitPaymentMethod.length > 3)
  ) {
    return res.status(500).json({ message: "Invalid splitPaymentMethod" });
  }

  // verify splitPaymentMethod fields
  if (splitPaymentMethod && splitPaymentMethod.length > 0) {
    for (let i = 0; i < splitPaymentMethod.length; i++) {
      if (
        !splitPaymentMethod[i].paymentMethod ||
        !splitPaymentMethod[i].amount
      ) {
        return res.status(500).json({ message: "Invalid splitPaymentMethod" });
      }
    }
  }

  // generate order Id
  const orderId = generate_order_id();

  // get total quantity
  const totalQuantity = products.reduce((acc, product) => {
    return acc + product.quantity;
  }, 0);

  // map products for terminal daily record update
  const daily_rec_products = products.map((product) => {
    return {
      id: product.product,
      quantity: product.quantity,
    };
  });

  // update terminal daily record ( sold )
  try {
    const response = await enter_terminal_daily_sales_record({
      date: recordDate.toISOString(),
      field: "sold",
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

  // Update all terminal products (decrease quantity)
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    await update_terminal_product_quantity(
      product.product,
      product.quantity,
      false,
    );
  }

  // Enter sale
  try {
    const newSale = new TerminalSalesRecord({
      recordDate,
      orderId,
      products,
      orderPrice,
      totalQuantity,
      customer,
      shortNote,
      paymentMethod,
      splitPaymentMethod,
      discountPrice,
      soldBy,
    });

    await newSale.save();

    //? emit
    io.emit("TerminalProduct");
    io.emit("TerminalSalesRecord");

    res.json({ message: "Sale Entered Successfully", newSale });
  } catch (error) {
    console.log("Error in enter_new_terminal_sale controller:", error.message);
    res.status(409).json({ message: error.message });
  }
};

// Enter new dangote Sales
export const enter_new_dangote_sale = async (req, res) => {
  // get values from body
  const {
    products,
    orderPrice,
    customer,
    shortNote,
    paymentMethod,
    splitPaymentMethod,
    discountPrice,
    soldBy,
    date,
  } = req.body;

  // verify all fields
  if (!products || !orderPrice || !paymentMethod || !soldBy || !date) {
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
      return res.status(500).json({ message: "Invalid product Entry" });
    }

    // Check if product exist
    const productExists = await Product.findById(products[i].product);
    if (!productExists) {
      return res.status(500).json({ message: "Invalid Product Entry" });
    }
  }

  // Verify splitPaymentMethod
  if (
    splitPaymentMethod &&
    splitPaymentMethod.length > 0 &&
    (splitPaymentMethod.length < 2 || splitPaymentMethod.length > 3)
  ) {
    return res.status(500).json({ message: "Invalid splitPaymentMethod" });
  }

  // verify splitPaymentMethod fields
  if (splitPaymentMethod && splitPaymentMethod.length > 0) {
    for (let i = 0; i < splitPaymentMethod.length; i++) {
      if (
        !splitPaymentMethod[i].paymentMethod ||
        !splitPaymentMethod[i].amount
      ) {
        return res.status(500).json({ message: "Invalid splitPaymentMethod" });
      }
    }
  }

  // generate order Id
  const orderId = generate_order_id();

  // get total quantity
  const totalQuantity = products.reduce((acc, product) => {
    return acc + product.quantity;
  }, 0);

  // map products for dangote daily record update
  const daily_rec_products = products.map((product) => {
    return {
      id: product.product,
      quantity: product.quantity,
    };
  });

  // update dangote daily record ( sold )
  try {
    const response = await enter_dangote_daily_sales_record({
      date: recordDate.toISOString(),
      field: "sold",
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

  // Update all dangote products (decrease quantity)
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    await update_dangote_product_quantity(
      product.product,
      product.quantity,
      false,
    );
  }

  // Enter sale
  try {
    const newSale = new DangoteSalesRecord({
      recordDate,
      orderId,
      products,
      orderPrice,
      totalQuantity,
      customer,
      shortNote,
      paymentMethod,
      splitPaymentMethod,
      discountPrice,
      soldBy,
    });

    await newSale.save();

    //? emit
    io.emit("DangoteProduct");
    io.emit("DangoteSalesRecord");

    res.json({ message: "Sale Entered Successfully", newSale });
  } catch (error) {
    console.log("Error in enter_new_dangote_sale controller:", error.message);
    res.status(409).json({ message: error.message });
  }
};

// ! REMOVALS

// Delete Sale record
export const delete_sale_record = async (req, res) => {
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
  const record = await SalesRecord.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // Check is user is permitted
  if (!isAllowed) {
    return res.status(500).json({ message: "Unathorized to Delete" });
  }

  // Get products
  const products = record.products;

  // map products for daily record update
  const daily_rec_products = products.map((product) => {
    return {
      id: product.product,
      quantity: -product.quantity,
    };
  });

  // update daily record ( online | quantitySold )
  const field = record.saleType === "online" ? "online" : "quantitySold";
  try {
    const response = await enter_daily_sales_record({
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
    console.log("Error in enter_daily_sales_record: ", error);
    return res.status(500).json({ message: error, error: error });
  }

  // Update all products (increase quantity)
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    await update_product_quantity(product.product, product.quantity, true);
  }

  // delete record
  try {
    await SalesRecord.findByIdAndDelete(id);

    //? emit
    io.emit("Product");
    io.emit("SalesRecord");

    res.json({ message: "Record deleted Sucessfully" });
  } catch (error) {
    console.log("Error in delete_sale_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Delete Terminal Sale record
export const delete_terminal_sale_record = async (req, res) => {
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
  const record = await TerminalSalesRecord.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // Check is user is permitted
  if (!isAllowed) {
    return res.status(500).json({ message: "Unathorized to Delete" });
  }

  // Get products
  const products = record.products;

  // map products for daily record update
  const daily_rec_products = products.map((product) => {
    return {
      id: product.product,
      quantity: -product.quantity,
    };
  });

  // update terminal daily record ( sold )
  try {
    const response = await enter_terminal_daily_sales_record({
      date: record.recordDate.toISOString(),
      field: "sold",
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

  // Update all terminal products (increase quantity)
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    await update_terminal_product_quantity(
      product.product,
      product.quantity,
      true,
    );
  }

  // delete record
  try {
    await TerminalSalesRecord.findByIdAndDelete(id);

    //? emit
    io.emit("TerminalProduct");
    io.emit("TerminalSalesRecord");

    res.json({ message: "Record deleted Sucessfully" });
  } catch (error) {
    console.log("Error in delete_terminal_sale_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Delete Dangote Sale record
export const delete_dangote_sale_record = async (req, res) => {
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
  const record = await DangoteSalesRecord.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // Check is user is permitted
  if (!isAllowed) {
    return res.status(500).json({ message: "Unathorized to Delete" });
  }

  // Get products
  const products = record.products;

  // map products for daily record update
  const daily_rec_products = products.map((product) => {
    return {
      id: product.product,
      quantity: -product.quantity,
    };
  });

  // update dangote daily record ( sold )
  try {
    const response = await enter_dangote_daily_sales_record({
      date: record.recordDate.toISOString(),
      field: "sold",
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

  // Update all dangote products (increase quantity)
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    await update_dangote_product_quantity(
      product.product,
      product.quantity,
      true,
    );
  }

  // delete record
  try {
    await DangoteSalesRecord.findByIdAndDelete(id);

    //? emit
    io.emit("DangoteProduct");
    io.emit("DangoteSalesRecord");

    res.json({ message: "Record deleted Sucessfully" });
  } catch (error) {
    console.log("Error in delete_dangote_sale_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// ! DB FUNCTIONS

// Enter daily sales record
export const enter_daily_sales_record = async ({ date, field, products }) => {
  const db_date = formatDate(date);

  const record = await DailySalesRecord.findOne({ date: db_date });

  //   Open new record for this date
  if (!record) {
    const resonse = await open_daily_sales_record(db_date);
    if (resonse.error) {
      return { error: resonse.error };
    }

    console.log("New Daily record opened: ", db_date);
  }

  //   if no products in the data
  if (!products || products.length < 1) {
    return { error: "No products to add" };
  }

  //   Verify field
  if (
    field !== "added" &&
    field !== "request" &&
    field !== "takeOut" &&
    field !== "return" &&
    field !== "terminalCollected" &&
    field !== "terminalReturn" &&
    field !== "dangoteCollected" &&
    field !== "dangoteReturn" &&
    field !== "badProduct" &&
    field !== "online" &&
    field !== "quantitySold"
  ) {
    return { error: "Invalid field" };
  }

  //   Verify all products
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    if (!product.id || !product.quantity) {
      return { error: "Incomplete Product found" };
    }
  }

  // Check and update product fields
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    const product_exist = await DailySalesRecord.findOne({
      date: db_date,
      "products.product": product.id,
    });

    //   Add new product
    if (!product_exist) {
      const newP = await Product.findById(product.id);

      await DailySalesRecord.findOneAndUpdate(
        {
          date: db_date,
        },
        {
          $push: {
            products: get_value_from_field(field, product.quantity, newP),
          },
        },
      );
    }

    //   Update product
    else {
      await DailySalesRecord.findOneAndUpdate(
        {
          date: db_date,
          "products.product": product.id,
        },
        {
          $inc: get_query_from_field(field, product.quantity),
        },
      );
    }
  }

  //? emit
  io.emit("DailySalesRecord");

  return { message: "Daily Record updated" };
};

// Enter terminal daily sales record
export const enter_terminal_daily_sales_record = async ({
  date,
  field,
  products,
}) => {
  const db_date = formatDate(date);

  const record = await TerminalDailySalesRecord.findOne({ date: db_date });

  //   Open new record for this date
  if (!record) {
    const resonse = await open_terminal_daily_sales_record(db_date);
    if (resonse.error) {
      return { error: resonse.error };
    }

    console.log("New Terminal Daily record opened: ", db_date);
  }

  //   if no products in the data
  if (!products || products.length < 1) {
    return { error: "No products to add" };
  }

  //   Verify field
  if (field !== "collected" && field !== "returned" && field !== "sold") {
    return { error: "Invalid field" };
  }

  //   Verify all products
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    if (!product.id || !product.quantity) {
      return { error: "Incomplete Product found" };
    }
  }

  // Check and update product fields
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    const product_exist = await TerminalDailySalesRecord.findOne({
      date: db_date,
      "products.product": product.id,
    });

    //   Add new product
    if (!product_exist) {
      const newP = await TerminalProduct.findById(product.id);

      const openingQuantity = !newP ? 0 : newP.quantity;

      await TerminalDailySalesRecord.findOneAndUpdate(
        {
          date: db_date,
        },
        {
          $push: {
            products: get_value_from_terminal_field(
              field,
              product.quantity,
              openingQuantity,
              product.id,
            ),
          },
        },
      );
    }

    //   Update product
    else {
      await TerminalDailySalesRecord.findOneAndUpdate(
        {
          date: db_date,
          "products.product": product.id,
        },
        {
          $inc: get_query_from_terminal_field(field, product.quantity),
        },
      );
    }
  }

  //? emit
  io.emit("TerminalDailySalesRecord");

  return { message: "Terminal Daily Record updated" };
};

// Enter dangote daily sales record
export const enter_dangote_daily_sales_record = async ({
  date,
  field,
  products,
}) => {
  const db_date = formatDate(date);

  const record = await DangoteDailySalesRecord.findOne({ date: db_date });

  //   Open new record for this date
  if (!record) {
    const resonse = await open_dangote_daily_sales_record(db_date);
    if (resonse.error) {
      return { error: resonse.error };
    }

    console.log("New Dangote Daily record opened: ", db_date);
  }

  //   if no products in the data
  if (!products || products.length < 1) {
    return { error: "No products to add" };
  }

  //   Verify field
  if (field !== "collected" && field !== "returned" && field !== "sold") {
    return { error: "Invalid field" };
  }

  //   Verify all products
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    if (!product.id || !product.quantity) {
      return { error: "Incomplete Product found" };
    }
  }

  // Check and update product fields
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    const product_exist = await DangoteDailySalesRecord.findOne({
      date: db_date,
      "products.product": product.id,
    });

    //   Add new product
    if (!product_exist) {
      const newP = await DangoteProduct.findById(product.id);

      const openingQuantity = !newP ? 0 : newP.quantity;

      await DangoteDailySalesRecord.findOneAndUpdate(
        {
          date: db_date,
        },
        {
          $push: {
            products: get_value_from_terminal_field(
              field,
              product.quantity,
              openingQuantity,
              product.id,
            ),
          },
        },
      );
    }

    //   Update product
    else {
      await DangoteDailySalesRecord.findOneAndUpdate(
        {
          date: db_date,
          "products.product": product.id,
        },
        {
          $inc: get_query_from_terminal_field(field, product.quantity),
        },
      );
    }
  }

  //? emit
  io.emit("DangoteDailySalesRecord");

  return { message: "Dangote Daily Record updated" };
};

// Open daily sales record
export const open_daily_sales_record = async (date) => {
  //? check all record for no existing previous record

  const agg_find = [
    {
      $addFields: {
        d: { $dateToString: { format: "%Y-%m-%d", date: "$recordDate" } },
      },
    },
    {
      $addFields: {
        not_today: { $lt: ["$d", date] },
      },
    },
    { $match: { verified: false } },
    { $match: { not_today: true } },
  ];

  // ProductionRecord
  const production_record = await ProductionRecord.aggregate(agg_find);

  if (production_record.length > 0) {
    return { error: "Pending Production record" };
  }

  // ProductReceived
  const product_received = await ProductReceived.aggregate(agg_find);
  if (product_received.length > 0) {
    return { error: "Pending Product Received record" };
  }

  // ProductRequest
  const product_request = await ProductRequest.aggregate(agg_find);
  if (product_request.length > 0) {
    return { error: "Pending Product Request record" };
  }

  // ProductTakeOut
  const product_takeOut = await ProductTakeOut.aggregate(agg_find);
  if (product_takeOut.length > 0) {
    return { error: "Pending Product TakeOut record" };
  }

  // ProductReturn
  const product_return = await ProductReturn.aggregate(agg_find);
  if (product_return.length > 0) {
    return { error: "Pending Product Return record" };
  }

  // BadProduct
  const bad_product = await BadProduct.aggregate(agg_find);
  if (bad_product.length > 0) {
    return { error: "Pending Bad Product record" };
  }

  // TerminalCollectionRecord
  const terminalCollection_record =
    await TerminalCollectionRecord.aggregate(agg_find);
  if (terminalCollection_record.length > 0) {
    return { error: "Pending Terminal Collection record" };
  }

  const db_products = await get_all_products();

  const products = db_products.map((product) => {
    return {
      product: product._id,
      openingQuantity: product.quantity,
      storePrice: product.storePrice,
      onlinePrice: product.onlinePrice,
    };
  });

  try {
    const newRecord = new DailySalesRecord({ date, products });
    await newRecord.save();

    //? emit
    io.emit("DailySalesRecord");

    return { newRecord };
  } catch (error) {
    console.log("Error in open_daily_sales_record:", error.message);
    return { error };
  }
};

// Open terminal daily sales record
export const open_terminal_daily_sales_record = async (date) => {
  const db_products = await get_all_terminal_products();

  const products = db_products.map((product) => {
    return {
      product: product._id,
      openingQuantity: product.quantity,
      storePrice: product.storePrice,
    };
  });

  try {
    const newRecord = new TerminalDailySalesRecord({ date, products });
    await newRecord.save();

    //? emit
    io.emit("TerminalDailySalesRecord");

    return { newRecord };
  } catch (error) {
    console.log("Error in Open terminal daily sales record:", error.message);
    return { error };
  }
};

// Open dangote daily sales record
export const open_dangote_daily_sales_record = async (date) => {
  const db_products = await get_all_dangote_products();

  const products = db_products.map((product) => {
    return {
      product: product._id,
      openingQuantity: product.quantity,
      storePrice: product.storePrice,
    };
  });

  try {
    const newRecord = new DangoteDailySalesRecord({ date, products });
    await newRecord.save();

    //? emit
    io.emit("DangoteDailySalesRecord");

    return { newRecord };
  } catch (error) {
    console.log("Error in Open dangote daily sales record:", error.message);
    return { error };
  }
};

// ! UTILS

// generate order Id
export const generate_order_id = () => {
  return "" + nanoid(11);
};

// Format date
export const formatDate = (date) => {
  return date.slice(0, 10);
};

// Query for update products in daily sales record
const get_query_from_field = (field, quantity) => {
  switch (field) {
    case "added":
      return { "products.$.added": quantity };
    case "request":
      return { "products.$.request": quantity };
    case "takeOut":
      return { "products.$.takeOut": quantity };
    case "return":
      return { "products.$.return": quantity };
    case "terminalCollected":
      return { "products.$.terminalCollected": quantity };
    case "terminalReturn":
      return { "products.$.terminalReturn": quantity };
    case "dangoteCollected":
      return { "products.$.dangoteCollected": quantity };
    case "dangoteReturn":
      return { "products.$.dangoteReturn": quantity };
    case "badProduct":
      return { "products.$.badProduct": quantity };
    case "online":
      return { "products.$.online": quantity };
    case "quantitySold":
      return { "products.$.quantitySold": quantity };
  }
};

// Value for new product in daily sales record
const get_value_from_field = (field, quantity, product) => {
  switch (field) {
    case "added":
      return {
        product: product.id,
        openingQuantity: product.quantity,
        added: quantity,
      };
    case "request":
      return {
        product: product.id,
        openingQuantity: product.quantity,
        request: quantity,
      };
    case "takeOut":
      return {
        product: product.id,
        openingQuantity: product.quantity,
        takeOut: quantity,
      };
    case "return":
      return {
        product: product.id,
        openingQuantity: product.quantity,
        return: quantity,
      };
    case "terminalCollected":
      return {
        product: product.id,
        openingQuantity: product.quantity,
        terminalCollected: quantity,
      };
    case "terminalReturn":
      return {
        product: product.id,
        openingQuantity: product.quantity,
        terminalReturn: quantity,
      };
    case "dangoteCollected":
      return {
        product: product.id,
        openingQuantity: product.quantity,
        dangoteCollected: quantity,
      };
    case "dangoteReturn":
      return {
        product: product.id,
        openingQuantity: product.quantity,
        dangoteReturn: quantity,
      };
    case "badProduct":
      return {
        product: product.id,
        openingQuantity: product.quantity,
        badProduct: quantity,
      };
    case "online":
      return {
        product: product.id,
        openingQuantity: product.quantity,
        online: quantity,
      };
    case "quantitySold":
      return {
        product: product.id,
        openingQuantity: product.quantity,
        quantitySold: quantity,
      };
  }
};

// Query for update products in terminal daily sales record
const get_query_from_terminal_field = (field, quantity) => {
  switch (field) {
    case "collected":
      return { "products.$.collected": quantity };
    case "returned":
      return { "products.$.returned": quantity };
    case "sold":
      return { "products.$.sold": quantity };
  }
};

// Value for new product in terminal daily sales record
const get_value_from_terminal_field = (
  field,
  quantity,
  openingQuantity,
  product,
) => {
  switch (field) {
    case "collected":
      return {
        product,
        openingQuantity,
        collected: quantity,
      };
    case "returned":
      return {
        product,
        openingQuantity,
        returned: quantity,
      };
    case "sold":
      return {
        product,
        openingQuantity,
        sold: quantity,
      };
  }
};
