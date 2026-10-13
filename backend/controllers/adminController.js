import User from "../models/User.js";
import Job from "../models/Job.js";
import Connection from "../models/Connection.js";
import Message from "../models/Message.js";
import asyncHandler from "../utils/asyncHandler.js";
import { pickProfile } from "./userController.js";

const notFound = (res, what) => { res.status(404); throw new Error(`${what} not found`); };

// ---------- users ----------
// GET /api/admin/users?status=
export const getAllUsers = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  res.json(await User.find(filter).sort({ createdAt: -1 }));
});

const setStatus = (status) =>
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) notFound(res, "User");
    if (user.role === "admin") { res.status(400); throw new Error("Admin accounts cannot be approved or rejected"); }
    if (user.status === status) { res.status(400); throw new Error(`User is already ${status}`); }
    user.status = status;
    await user.save();
    res.json({ message: `User ${status}`, user });
  });
export const approveUser = setStatus("approved");
export const rejectUser = setStatus("rejected");

// PUT /api/admin/users/:id  (manage profile data, admin may set the company)
export const updateUser = asyncHandler(async (req, res) => {
  const data = pickProfile(req.body, { allowCompany: true });
  if (data.companyName) data.companyVerified = true;
  const target = await User.findById(req.params.id);
  if (!target) notFound(res, "User");
  if (target.role === "admin") { res.status(400); throw new Error("Admin profiles cannot be edited here"); }
  const user = await User.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  res.json({ message: "Profile updated", user });
});

// DELETE /api/admin/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) notFound(res, "User");
  if (user.role === "admin") { res.status(400); throw new Error("Admin accounts cannot be deleted"); }
  const id = user._id;
  await Promise.all([
    Job.deleteMany({ postedBy: id }),
    Connection.deleteMany({ $or: [{ requester: id }, { recipient: id }] }),
    Message.deleteMany({ $or: [{ sender: id }, { receiver: id }] }),
    user.deleteOne(),
  ]);
  res.json({ message: "User deleted" });
});

// ---------- student company verification ----------
// GET /api/admin/company-requests
export const getCompanyRequests = asyncHandler(async (req, res) => {
  res.json(await User.find({ "companyRequest.status": "pending" }).sort({ "companyRequest.requestedAt": 1 }));
});

// PUT /api/admin/company-requests/:id/approve
export const approveCompany = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user?.companyRequest?.status !== "pending") { res.status(400); throw new Error("There is no pending company request for this user"); }
  user.companyName = user.companyRequest.companyName;
  user.jobTitle = user.companyRequest.jobTitle;
  user.companyVerified = true;
  user.companyRequest.status = "approved";
  await user.save();
  res.json({ message: "Company verified", user });
});

// PUT /api/admin/company-requests/:id/reject
export const rejectCompany = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user?.companyRequest?.status !== "pending") { res.status(400); throw new Error("There is no pending company request for this user"); }
  user.companyRequest.status = "rejected";
  await user.save();
  res.json({ message: "Request rejected", user });
});

// ---------- job verification ----------
// GET /api/admin/jobs?status=
export const getAllJobs = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  res.json(await Job.find(filter).populate("postedBy", "name email companyName").sort({ createdAt: -1 }));
});

const setJobStatus = (status) =>
  asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);
    if (!job) notFound(res, "Job");
    if (job.status === status) { res.status(400); throw new Error(`Job is already ${status}`); }
    job.status = status;
    await job.save();
    res.json({ message: `Job ${status}`, job });
  });
export const approveJob = setJobStatus("approved");
export const rejectJob = setJobStatus("rejected");

// ---------- stats ----------
// GET /api/admin/stats
export const getStats = asyncHandler(async (req, res) => {
  const [students, alumni, pendingAlumni, pendingCompany, jobs, pendingJobs] = await Promise.all([
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "alumni", status: "approved" }),
    User.countDocuments({ status: "pending" }),
    User.countDocuments({ "companyRequest.status": "pending" }),
    Job.countDocuments({ status: "approved" }),
    Job.countDocuments({ status: "pending" }),
  ]);
  res.json({ students, alumni, pendingAlumni, pendingCompany, jobs, pendingJobs });
});
