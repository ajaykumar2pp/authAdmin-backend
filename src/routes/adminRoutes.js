import express from "express";
import { addAdmin, getAdmins, updateAdmin, deleteAdmin } from "../controllers/adminController.js";

const router = express.Router();

router.post("/", addAdmin);
router.get("/", getAdmins);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

export default router;
