import express from "express";
import { loginUser, registerUser } from "../Controllers/AuthController.js";

const router = express.Router();

//use of registerUser from /Controller/AuthController.js
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
