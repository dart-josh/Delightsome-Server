import express from "express"
import { check_password, check_pin, check_staff_id, create_password, create_pin, get_active_staff, get_online_users, login, reset_password, reset_pin } from "../controllers/auth.controller.js";

const router = express.Router();

router.post('/login', login)
router.post('/check_staff_id', check_staff_id)
router.post('/check_password', check_password)
router.post('/check_pin', check_pin)
router.post('/create_password', create_password)
router.post('/create_pin', create_pin)
router.post('/reset_password/:id', reset_password)
router.post('/reset_pin/:id', reset_pin)

router.get("/get_online_users", get_online_users)
router.get('/get_active_staff/:id', get_active_staff)

export default router;