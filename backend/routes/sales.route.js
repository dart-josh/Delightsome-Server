import express from "express";
import {
  delete_store_sale_record,
  delete_outlet_sale_record,
  delete_terminal_sale_record,
  delete_dangote_sale_record,
  enter_new_store_sale,
  enter_new_outlet_sale,
  enter_new_terminal_sale,
  enter_new_dangote_sale,
  get_daily_store_record,
  get_outlet_daily_sales_record,
  get_terminal_daily_sales_record,
  get_dangote_daily_sales_record,
  get_store_sales_record,
  get_outlet_sales_record,
  get_terminal_sales_record,
  get_dangote_sales_record,
  get_selected_store_sales_record,
  get_selected_outlet_sales_record,
  get_selected_terminal_sales_record,
  get_selected_dangote_sales_record,
  get_selected_daily_store_record,
  get_selected_outlet_daily_sales_record,
  get_selected_terminal_daily_sales_record,
  get_selected_dangote_daily_sales_record,
} from "../controllers/sales.controller.js";
import {
  admin_verification,
  user_verification,
} from "../middleware/userProtect.js";

const router = express.Router();

// Sales
router.post(
  "/get_store_sales_record",
  user_verification,
  get_store_sales_record,
);
router.post(
  "/get_selected_store_sales_record",
  user_verification,
  get_selected_store_sales_record,
);
router.post(
  "/get_daily_store_record",
  user_verification,
  get_daily_store_record,
);
router.post(
  "/get_selected_daily_store_record",
  user_verification,
  get_selected_daily_store_record,
);

router.post("/enter_new_store_sale", user_verification, enter_new_store_sale);
router.delete(
  "/delete_store_sale_record/:id",
  user_verification,
  admin_verification,
  delete_store_sale_record,
);

// Outlet Sales
router.post(
  "/get_outlet_sales_record",
  user_verification,
  get_outlet_sales_record,
);
router.post(
  "/get_selected_outlet_sales_record",
  user_verification,
  get_selected_outlet_sales_record,
);
router.post(
  "/get_outlet_daily_sales_record",
  user_verification,
  get_outlet_daily_sales_record,
);
router.post(
  "/get_selected_outlet_daily_sales_record",
  user_verification,
  get_selected_outlet_daily_sales_record,
);

router.post(
  "/enter_new_outlet_sale",
  user_verification,
  enter_new_outlet_sale,
);
router.delete(
  "/delete_outlet_sale_record/:id",
  user_verification,
  admin_verification,
  delete_outlet_sale_record,
);

// Terminal Sales
router.post(
  "/get_terminal_sales_record",
  user_verification,
  get_terminal_sales_record,
);
router.post(
  "/get_selected_terminal_sales_record",
  user_verification,
  get_selected_terminal_sales_record,
);
router.post(
  "/get_terminal_daily_sales_record",
  user_verification,
  get_terminal_daily_sales_record,
);
router.post(
  "/get_selected_terminal_daily_sales_record",
  user_verification,
  get_selected_terminal_daily_sales_record,
);

router.post(
  "/enter_new_terminal_sale",
  user_verification,
  enter_new_terminal_sale,
);
router.delete(
  "/delete_terminal_sale_record/:id",
  user_verification,
  admin_verification,
  delete_terminal_sale_record,
);

// Dangote Sales
router.post(
  "/get_dangote_sales_record",
  user_verification,
  get_dangote_sales_record,
);
router.post(
  "/get_selected_dangote_sales_record",
  user_verification,
  get_selected_dangote_sales_record,
);
router.post(
  "/get_dangote_daily_sales_record",
  user_verification,
  get_dangote_daily_sales_record,
);
router.post(
  "/get_selected_dangote_daily_sales_record",
  user_verification,
  get_selected_dangote_daily_sales_record,
);

router.post(
  "/enter_new_dangote_sale",
  user_verification,
  enter_new_dangote_sale,
);
router.delete(
  "/delete_dangote_sale_record/:id",
  user_verification,
  admin_verification,
  delete_dangote_sale_record,
);

export default router;
