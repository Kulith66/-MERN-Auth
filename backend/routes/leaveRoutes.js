import express,{Router} from "express";
import {leaveApplyController} from "../controllers/leaveController.js";
const router = express.Router();

router.post("/applyLeave",leaveApplyController);

export default router;