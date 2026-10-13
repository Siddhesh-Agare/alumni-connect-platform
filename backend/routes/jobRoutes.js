import { Router } from "express";
import { getJobs, getJobCount, createJob, deleteJob } from "../controllers/jobController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { idParams } from "../validators/common.js";
import { createJobBody } from "../validators/jobValidator.js";

const router = Router();
router.use(protect);
router.get("/", getJobs);
router.get("/count", getJobCount);
router.post("/", authorize("alumni"), validate({ body: createJobBody }), createJob);
router.delete("/:id", authorize("alumni", "admin"), validate({ params: idParams }), deleteJob);
export default router;
