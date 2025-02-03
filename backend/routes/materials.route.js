import express from "express";
import { admin_verification, user_verification } from "../middleware/userProtect.js";
import {
  add_update_product_materials,
  add_update_product_materials_category,
  add_update_raw_materials,
  add_update_raw_materials_category,
  delete_product_materials,
  delete_product_materials_category,
  delete_product_materials_request_record,
  delete_product_materials_return_record,
  delete_raw_materials,
  delete_raw_materials_category,
  delete_raw_materials_request_record,
  delete_restock_product_materials_record,
  delete_restock_raw_materials_record,
  enter_product_materials_request_record,
  enter_product_materials_return_record,
  enter_raw_materials_request_record,
  enter_restock_product_materials_record,
  enter_restock_raw_materials_record,
  get_product_materials,
  get_product_materials_categories,
  get_product_materials_request_record,
  get_product_materials_return_record,
  get_raw_materials,
  get_raw_materials_categories,
  get_raw_materials_request_record,
  get_restock_product_materials_record,
  get_restock_raw_materials_record,
  get_selected_product_materials_request_record,
  get_selected_product_materials_return_record,
  get_selected_raw_materials_request_record,
  get_selected_restock_product_materials_record,
  get_selected_restock_raw_materials_record,
  verify_product_materials_request_record,
  verify_product_materials_return_record,
  verify_raw_materials_request_record,
  verify_restock_product_materials_record,
  verify_restock_raw_materials_record,
} from "../controllers/materials.controller.js";

const router = express.Router();

// GETTERS
router.post("/get_product_materials", user_verification, get_product_materials);
router.post("/get_raw_materials", user_verification, get_raw_materials);
router.post(
  "/get_restock_product_materials_record", user_verification,
  get_restock_product_materials_record,
);
router.post(
  "/get_restock_raw_materials_record", user_verification,
  get_restock_raw_materials_record,
);
router.post(
  "/get_product_materials_request_record", user_verification,
  get_product_materials_request_record,
);
router.post(
  "/get_raw_materials_request_record", user_verification,
  get_raw_materials_request_record,
);
router.post(
  "/get_product_materials_return_record", user_verification,
  get_product_materials_return_record,
);
router.post(
  "/get_product_materials_categories", user_verification,
  get_product_materials_categories,
);
router.post("/get_raw_materials_categories", user_verification, get_raw_materials_categories);

router.post("/get_selected_restock_product_materials_record", user_verification, get_selected_restock_product_materials_record)
router.post("/get_selected_restock_raw_materials_record", user_verification, get_selected_restock_raw_materials_record)
router.post("/get_selected_product_materials_request_record", user_verification, get_selected_product_materials_request_record)
router.post("/get_selected_raw_materials_request_record", user_verification, get_selected_raw_materials_request_record)
router.post("/get_selected_product_materials_return_record", user_verification, get_selected_product_materials_return_record)

// SETTERS
router.post("/add_update_product_materials", user_verification, add_update_product_materials);
router.post("/add_update_raw_materials", user_verification, add_update_raw_materials);
router.post(
  "/enter_restock_product_materials_record", user_verification,
  enter_restock_product_materials_record,
);
router.post(
  "/verify_restock_product_materials_record", user_verification,
  verify_restock_product_materials_record,
);
router.post(
  "/enter_restock_raw_materials_record", user_verification,
  enter_restock_raw_materials_record,
);
router.post(
  "/verify_restock_raw_materials_record", user_verification,
  verify_restock_raw_materials_record,
);
router.post(
  "/enter_product_materials_request_record", user_verification,
  enter_product_materials_request_record,
);
router.post(
  "/verify_product_materials_request_record", user_verification,
  verify_product_materials_request_record,
);
router.post(
  "/enter_raw_materials_request_record", user_verification,
  enter_raw_materials_request_record,
);
router.post(
  "/verify_raw_materials_request_record", user_verification,
  verify_raw_materials_request_record,
);
router.post(
  "/enter_product_materials_return_record", user_verification,
  enter_product_materials_return_record,
);
router.post(
  "/verify_product_materials_return_record", user_verification,
  verify_product_materials_return_record,
);
router.post(
  "/add_update_product_materials_category", user_verification,
  add_update_product_materials_category,
);
router.post(
  "/add_update_raw_materials_category", user_verification,
  add_update_raw_materials_category,
);

// REMOVALS
router.delete(
  "/delete_product_materials/:id", user_verification,
  admin_verification,
  delete_product_materials,
);
router.delete(
  "/delete_raw_materials/:id", user_verification,
  admin_verification,
  delete_raw_materials,
);
router.delete(
  "/delete_restock_product_materials_record/:id", user_verification,
  admin_verification,
  delete_restock_product_materials_record,
);
router.delete(
  "/delete_restock_raw_materials_record/:id", user_verification,
  admin_verification,
  delete_restock_raw_materials_record,
);
router.delete(
  "/delete_product_materials_request_record/:id", user_verification,
  admin_verification,
  delete_product_materials_request_record,
);
router.delete(
  "/delete_raw_materials_request_record/:id", user_verification,
  admin_verification,
  delete_raw_materials_request_record,
);
router.delete(
  "/delete_product_materials_return_record/:id", user_verification,
  admin_verification,
  delete_product_materials_return_record,
);
router.delete(
  "/delete_product_materials_category/:id", user_verification,
  admin_verification,
  delete_product_materials_category,
);
router.delete(
  "/delete_raw_materials_category/:id", user_verification,
  admin_verification,
  delete_raw_materials_category,
);

export default router;
