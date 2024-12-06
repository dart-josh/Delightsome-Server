import express from "express"
import { get_online_users, login, reset_password } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/get_online_users", get_online_users)
router.post('/login', login)
router.post('/reset_password/:id', reset_password)

export default router;