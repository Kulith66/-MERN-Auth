import express,{Router} from "express";
import { emergencyAttachment } from "../controllers/attachmentController.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();


router.post('/emergency-upload/:nic', upload.single('file'), emergencyAttachment);


export default router;