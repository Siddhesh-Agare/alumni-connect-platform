import { Router } from "express";
import { updateProfile, requestCompany, getDirectory, getUserById } from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { idParams } from "../validators/common.js";
import { profileBody, companyRequestBody, directoryQuery } from "../validators/userValidator.js";

const router = Router();
router.use(protect);
router.get("/", validate({ query: directoryQuery }), getDirectory);
router.put("/profile", validate({ body: profileBody }), updateProfile);
router.post("/company-request", authorize("student"), validate({ body: companyRequestBody }), requestCompany);
router.get("/:id", validate({ params: idParams }), getUserById);
export default router;
