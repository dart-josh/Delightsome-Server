import express from "express"
import { add_update_customer, add_update_staff, delete_customer, delete_staff, get_all_customer, get_all_staff} from "../controllers/users.controller.js";
import { user_verification } from "../middleware/userProtect.js";

const router = express.Router();

router.post("/get_all_staff", user_verification, get_all_staff)
router.post("/get_all_customer", user_verification, get_all_customer)

router.post("/add_update_staff", user_verification, add_update_staff)
router.post("/add_update_customer", user_verification, add_update_customer)

router.delete("/delete_staff/:id", user_verification, delete_staff)
router.delete("/delete_customer/:id", user_verification, delete_customer)

export default router;