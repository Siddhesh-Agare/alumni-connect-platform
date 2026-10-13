import { Router } from "express";
import {
  getAllUsers, approveUser, rejectUser, updateUser, deleteUser, getStats,
  getCompanyRequests, approveCompany, rejectCompany, getAllJobs, approveJob, rejectJob,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { idParams, statusQuery } from "../validators/common.js";
import { profileBody } from "../validators/userValidator.js";

const router = Router();
router.use(protect, authorize("admin"));
router.get("/stats", getStats);
router.get("/users", validate({ query: statusQuery }), getAllUsers);
router.put("/users/:id/approve", validate({ params: idParams }), approveUser);
router.put("/users/:id/reject", validate({ params: idParams }), rejectUser);
router.put("/users/:id", validate({ params: idParams, body: profileBody }), updateUser);
router.delete("/users/:id", validate({ params: idParams }), deleteUser);
router.get("/company-requests", getCompanyRequests);
router.put("/company-requests/:id/approve", validate({ params: idParams }), approveCompany);
router.put("/company-requests/:id/reject", validate({ params: idParams }), rejectCompany);
router.get("/jobs", validate({ query: statusQuery }), getAllJobs);
router.put("/jobs/:id/approve", validate({ params: idParams }), approveJob);
router.put("/jobs/:id/reject", validate({ params: idParams }), rejectJob);
export default router;
