import { Router } from "express";
import { getMyConnections, sendRequest, acceptRequest, rejectRequest, removeConnection } from "../controllers/connectionController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { idParams, userIdParams } from "../validators/common.js";

const router = Router();
router.use(protect, authorize("student", "alumni"));
router.get("/", getMyConnections);
router.post("/request/:userId", validate({ params: userIdParams }), sendRequest);
router.put("/:id/accept", validate({ params: idParams }), acceptRequest);
router.put("/:id/reject", validate({ params: idParams }), rejectRequest);
router.delete("/:id", validate({ params: idParams }), removeConnection);
export default router;
