import express from "express";
import { addAdmin, getAdmins } from "../controllers/adminController.js";

const router = express.Router();

router.post("/", addAdmin);
router.get("/", getAdmins);

export default router;
