import { Router } from "express";
import {
  getProfile,
  loginCustomer,
  registerCustomer,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.get("/profile", getProfile);

export default router;
