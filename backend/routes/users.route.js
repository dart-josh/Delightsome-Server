import express from "express"
import { add_update_customer, add_update_staff, delete_customer, delete_staff, get_all_customer, get_all_staff} from "../controllers/users.controller.js";

const router = express.Router();

router.get("/get_all_staff", get_all_staff)
router.get("/get_all_customer", get_all_customer)

router.post("/add_update_staff", add_update_staff)
router.post("/add_update_customer", add_update_customer)

router.delete("/delete_staff/:id", delete_staff)
router.delete("/delete_customer/:id", delete_customer)

export default router;