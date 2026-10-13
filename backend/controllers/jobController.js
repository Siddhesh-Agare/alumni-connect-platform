import Job from "../models/Job.js";
import asyncHandler from "../utils/asyncHandler.js";

// GET /api/jobs  -> approved jobs for everyone, plus the poster's own pending/rejected ones
export const getJobs = asyncHandler(async (req, res) => {
  const filter =
    req.user.role === "admin" ? {} : { $or: [{ status: "approved" }, { postedBy: req.user._id }] };
  res.json(await Job.find(filter).populate("postedBy", "name headline").sort({ createdAt: -1 }));
});

// GET /api/jobs/count  (approved jobs only)
export const getJobCount = asyncHandler(async (req, res) => {
  res.json({ total: await Job.countDocuments({ status: "approved" }) });
});

// POST /api/jobs (alumni only) -> waits for admin verification
export const createJob = asyncHandler(async (req, res) => {
  const { title, company, location, type, description, applyLink } = req.body;
  const pending = await Job.countDocuments({ postedBy: req.user._id, status: "pending" });
  if (pending >= 5) {
    res.status(429);
    throw new Error("You already have 5 jobs waiting for verification. Please wait for the admin to review them.");
  }
  const job = await Job.create({
    title, company, location, type, description, applyLink,
    postedBy: req.user._id,
    status: "pending",
  });
  res.status(201).json({ message: "Job submitted. It will appear after admin verification.", job });
});

// DELETE /api/jobs/:id (owner or admin)
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) { res.status(404); throw new Error("Job not found"); }
  if (req.user.role !== "admin" && String(job.postedBy) !== String(req.user._id)) {
    res.status(403); throw new Error("You can only delete your own posts");
  }
  await job.deleteOne();
  res.json({ message: "Job deleted" });
});
