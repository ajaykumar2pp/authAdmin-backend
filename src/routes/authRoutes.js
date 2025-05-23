import express from "express";
import { register, login , verify2FA, logout, generate2FA, getUserProfile} from "../controllers/authController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/2fa/generate", isAuthenticated, generate2FA);
router.post("/2fa/verify",isAuthenticated, verify2FA);
router.get("/me", isAuthenticated, getUserProfile);
router.post("/logout", logout);

export default router;
