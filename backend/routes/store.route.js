import express from "express"
import { add_update_product, delete_bad_product_record, delete_product, delete_product_received_record, delete_product_request_record, delete_production_record, delete_terminalCollection_record, enter_bad_product_record, enter_product_received_record, enter_product_request_record, enter_production_record, enter_terminalCollection_record, get_bad_product_record, get_product_received_record, get_product_request_record, get_production_record, get_terminalCollection_record, get_products, verify_bad_product_record, verify_product_received_record, verify_product_request_record, verify_production_record, verify_terminalCollection_record, get_terminal_products, get_product_categories, add_update_product_category, delete_product_category, get_selected_production_record, get_selected_product_received_record, get_selected_product_request_record, get_selected_bad_product_record, get_selected_terminalCollection_record } from "../controllers/store.controller.js";
import { admin_verification } from "../middleware/userProtect.js";

const router = express.Router();

// product
router.get("/get_products", get_products)
router.post("/add_update_product", add_update_product)
router.delete("/delete_product/:id", admin_verification, delete_product)
router.get("/get_terminal_products", get_terminal_products)

// production record 
router.get("/get_production_record", get_production_record)
router.post("/get_selected_production_record", get_selected_production_record)
router.post("/enter_production_record", enter_production_record)
router.post("/verify_production_record", verify_production_record)
router.delete("/delete_production_record/:id", admin_verification, delete_production_record)

// product received record 
router.get("/get_product_received_record", get_product_received_record)
router.post("/get_selected_product_received_record", get_selected_product_received_record)
router.post("/enter_product_received_record", enter_product_received_record)
router.post("/verify_product_received_record", verify_product_received_record)
router.delete("/delete_product_received_record/:id", admin_verification, delete_product_received_record)

// product request record 
router.get("/get_product_request_record", get_product_request_record)
router.post("/get_selected_product_request_record", get_selected_product_request_record)
router.post("/enter_product_request_record", enter_product_request_record)
router.post("/verify_product_request_record", verify_product_request_record)
router.delete("/delete_product_request_record/:id", admin_verification, delete_product_request_record)

// bad product record
router.get("/get_bad_product_record", get_bad_product_record)
router.post("/get_selected_bad_product_record", get_selected_bad_product_record)
router.post("/enter_bad_product_record", enter_bad_product_record)
router.post("/verify_bad_product_record", verify_bad_product_record)
router.delete("/delete_bad_product_record/:id", admin_verification, delete_bad_product_record)

// terminal collection record
router.get("/get_terminalCollection_record", get_terminalCollection_record)
router.post("/get_selected_terminalCollection_record", get_selected_terminalCollection_record)
router.post("/enter_terminalCollection_record", enter_terminalCollection_record)
router.post("/verify_terminalCollection_record", verify_terminalCollection_record)
router.delete("/delete_terminalCollection_record/:id", admin_verification, delete_terminalCollection_record)

// product category
router.get("/get_product_categories", get_product_categories)
router.post("/add_update_product_category", add_update_product_category)
router.delete("/delete_product_category/:id", admin_verification, delete_product_category)

export default router;