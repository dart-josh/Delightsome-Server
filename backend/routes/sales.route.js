import express from "express"
import { delete_sale_record, delete_terminal_sale_record, enter_new_sale, enter_new_terminal_sale, get_daily_sales_record, get_sales_record, get_selected_daily_sales_record, get_selected_sales_record, get_selected_terminal_daily_sales_record, get_selected_terminal_sales_record, get_terminal_daily_sales_record, get_terminal_sales_record } from "../controllers/sales.controller.js";
import { admin_verification } from "../middleware/userProtect.js";

const router = express.Router();

// Sales
router.get("/get_sales_record", get_sales_record)
router.post("/get_selected_sales_record", get_selected_sales_record)
router.get("/get_daily_sales_record", get_daily_sales_record)
router.post("/get_selected_daily_sales_record", get_selected_daily_sales_record)

router.post("/enter_new_sale", enter_new_sale)
router.delete("/delete_sale_record/:id", admin_verification, delete_sale_record)

// Terminal Sales
router.get("/get_terminal_sales_record", get_terminal_sales_record)
router.post("/get_selected_terminal_sales_record", get_selected_terminal_sales_record)
router.get("/get_terminal_daily_sales_record", get_terminal_daily_sales_record)
router.post("/get_selected_terminal_daily_sales_record", get_selected_terminal_daily_sales_record)

router.post("/enter_new_terminal_sale", enter_new_terminal_sale)
router.delete("/delete_terminal_sale_record/:id", admin_verification, delete_terminal_sale_record)

export default router;