import express from "express"
import { add_update_product, delete_bad_product_record, delete_product, delete_product_received_record, delete_product_request_record, delete_production_record, delete_terminalCollection_record, enter_bad_product_record, enter_product_received_record, enter_product_request_record, enter_production_record, enter_terminalCollection_record, get_bad_product_record, get_product_received_record, get_product_request_record, get_production_record, get_terminalCollection_record, get_products, verify_bad_product_record, verify_product_received_record, verify_product_request_record, verify_production_record, verify_terminalCollection_record, get_terminal_products, get_product_categories, add_update_product_category, delete_product_category, get_selected_production_record, get_selected_product_received_record, get_selected_product_request_record, get_selected_bad_product_record, get_selected_terminalCollection_record, get_product_takeOut_record, get_selected_product_takeOut_record, enter_product_takeOut_record, verify_product_takeOut_record, delete_product_takeOut_record, get_product_return_record, get_selected_product_return_record, enter_product_return_record, verify_product_return_record, delete_product_return_record, get_dangoteCollection_record, get_selected_dangoteCollection_record, enter_dangoteCollection_record, verify_dangoteCollection_record, delete_dangoteCollection_record, get_dangote_products } from "../controllers/store.controller.js";
import { admin_verification, user_verification } from "../middleware/userProtect.js";

const router = express.Router();

// product
router.post("/get_products", user_verification, get_products)
router.post("/add_update_product", user_verification, add_update_product)
router.delete("/delete_product/:id", user_verification, admin_verification, delete_product)
router.post("/get_terminal_products", user_verification, get_terminal_products)
router.post("/get_dangote_products", user_verification, get_dangote_products)

// production record 
router.post("/get_production_record", user_verification, get_production_record)
router.post("/get_selected_production_record", user_verification, get_selected_production_record)
router.post("/enter_production_record", user_verification, enter_production_record)
router.post("/verify_production_record", user_verification, verify_production_record)
router.delete("/delete_production_record/:id", user_verification, admin_verification, delete_production_record)

// product received record 
router.post("/get_product_received_record", user_verification, get_product_received_record)
router.post("/get_selected_product_received_record", user_verification, get_selected_product_received_record)
router.post("/enter_product_received_record", user_verification, enter_product_received_record)
router.post("/verify_product_received_record", user_verification, verify_product_received_record)
router.delete("/delete_product_received_record/:id", user_verification, admin_verification, delete_product_received_record)

// product request record 
router.post("/get_product_request_record", user_verification, get_product_request_record)
router.post("/get_selected_product_request_record", user_verification, get_selected_product_request_record)
router.post("/enter_product_request_record", user_verification, enter_product_request_record)
router.post("/verify_product_request_record", user_verification, verify_product_request_record)
router.delete("/delete_product_request_record/:id", user_verification, admin_verification, delete_product_request_record)

// product takeOut record 
router.post("/get_product_takeOut_record", user_verification, get_product_takeOut_record)
router.post("/get_selected_product_takeOut_record", user_verification, get_selected_product_takeOut_record)
router.post("/enter_product_takeOut_record", user_verification, enter_product_takeOut_record)
router.post("/verify_product_takeOut_record", user_verification, verify_product_takeOut_record)
router.delete("/delete_product_takeOut_record/:id", user_verification, admin_verification, delete_product_takeOut_record)

// product return record 
router.post("/get_product_return_record", user_verification, get_product_return_record)
router.post("/get_selected_product_return_record", user_verification, get_selected_product_return_record)
router.post("/enter_product_return_record", user_verification, enter_product_return_record)
router.post("/verify_product_return_record", user_verification, verify_product_return_record)
router.delete("/delete_product_return_record/:id", user_verification, admin_verification, delete_product_return_record)

// bad product record
router.post("/get_bad_product_record", user_verification, get_bad_product_record)
router.post("/get_selected_bad_product_record", user_verification, get_selected_bad_product_record)
router.post("/enter_bad_product_record", user_verification, enter_bad_product_record)
router.post("/verify_bad_product_record", user_verification, verify_bad_product_record)
router.delete("/delete_bad_product_record/:id", user_verification, admin_verification, delete_bad_product_record)

// terminal collection record
router.post("/get_terminalCollection_record", user_verification, get_terminalCollection_record)
router.post("/get_selected_terminalCollection_record", user_verification, get_selected_terminalCollection_record)
router.post("/enter_terminalCollection_record", user_verification, enter_terminalCollection_record)
router.post("/verify_terminalCollection_record", user_verification, verify_terminalCollection_record)
router.delete("/delete_terminalCollection_record/:id", user_verification, admin_verification, delete_terminalCollection_record)

// dangote collection record
router.post("/get_dangoteCollection_record", user_verification, get_dangoteCollection_record)
router.post("/get_selected_dangoteCollection_record", user_verification, get_selected_dangoteCollection_record)
router.post("/enter_dangoteCollection_record", user_verification, enter_dangoteCollection_record)
router.post("/verify_dangoteCollection_record", user_verification, verify_dangoteCollection_record)
router.delete("/delete_dangoteCollection_record/:id", user_verification, admin_verification, delete_dangoteCollection_record)

// product category
router.post("/get_product_categories", user_verification, get_product_categories)
router.post("/add_update_product_category", user_verification, add_update_product_category)
router.delete("/delete_product_category/:id", user_verification, admin_verification, delete_product_category)

export default router;