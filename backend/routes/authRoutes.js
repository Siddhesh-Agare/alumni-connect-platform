import { Router } from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { registerBody, loginBody } from "../validators/authValidator.js";

const router = Router();
router.post("/register", validate({ body: registerBody }), register);
router.post("/login", validate({ body: loginBody }), login);
router.get("/me", protect, getMe);
export default router;
