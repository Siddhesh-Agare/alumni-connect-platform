import { Router } from "express";
import { getConversation, sendMessage } from "../controllers/messageController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { userIdParams } from "../validators/common.js";
import { sendMessageBody } from "../validators/messageValidator.js";

const router = Router();
router.use(protect, authorize("student", "alumni"));
router.get("/:userId", validate({ params: userIdParams }), getConversation);
router.post("/:userId", validate({ params: userIdParams, body: sendMessageBody }), sendMessage);
export default router;
