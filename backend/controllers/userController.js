import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

// what other users are allowed to see
export const PUBLIC_SELECT = "-email -companyRequest";

const clean = (v, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// keep only known text fields of each repeated item; the first field is mandatory
const cleanList = (arr, fields) =>
  Array.isArray(arr)
    ? arr
        .slice(0, 20)
        .map((item) => Object.fromEntries(fields.map(([k, max]) => [k, clean(item?.[k], max)])))
        .filter((item) => item[fields[0][0]])
    : [];

const WORK_FIELDS = [["company", 100], ["role", 100], ["period", 60], ["description", 600]];
const ACHIEVEMENT_FIELDS = [["title", 120], ["year", 10], ["description", 400]];

// allowCompany=false for students: they cannot type a company name themselves
export const pickProfile = (body, { allowCompany = false } = {}) => {
  const data = {};
  ["name", "headline", "location", "department", "linkedin"].forEach((f) => {
    if (body[f] !== undefined) data[f] = clean(body[f], 150);
  });
  if (body.bio !== undefined) data.bio = clean(body.bio, 1500);
  if (body.graduationYear !== undefined && body.graduationYear !== "") data.graduationYear = Number(body.graduationYear);

  if (body.skills !== undefined) {
    const list = Array.isArray(body.skills) ? body.skills : String(body.skills).split(",");
    data.skills = list.map((s) => clean(s, 40)).filter(Boolean).slice(0, 30);
  }
  if (body.internships !== undefined) data.internships = cleanList(body.internships, WORK_FIELDS);
  if (body.experience !== undefined) data.experience = cleanList(body.experience, WORK_FIELDS);
  if (body.achievements !== undefined) data.achievements = cleanList(body.achievements, ACHIEVEMENT_FIELDS);

  if (allowCompany) {
    if (body.companyName !== undefined) data.companyName = clean(body.companyName, 100);
    if (body.jobTitle !== undefined) data.jobTitle = clean(body.jobTitle, 100);
  }
  return data;
};

// PUT /api/users/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const data = pickProfile(req.body, { allowCompany: req.user.role === "alumni" });
  if (!data.name) delete data.name;
  const user = await User.findByIdAndUpdate(req.user._id, data, { new: true, runValidators: true });
  res.json(user);
});

// POST /api/users/company-request  (students ask the admin to verify their company)
export const requestCompany = asyncHandler(async (req, res) => {
  const companyName = clean(req.body.companyName, 100);
  const jobTitle = clean(req.body.jobTitle, 100);
  const proof = clean(req.body.proof, 300);
  if (req.user.companyRequest?.status === "pending") {
    res.status(409);
    throw new Error("You already have a pending request. Please wait for the admin to review it.");
  }
  if (req.user.companyVerified && req.user.companyName?.toLowerCase() === companyName.toLowerCase()) {
    res.status(409);
    throw new Error("This company is already verified on your profile");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { companyRequest: { companyName, jobTitle, proof, status: "pending", requestedAt: new Date() } },
    { new: true }
  );
  res.json({ message: "Request sent. An admin will verify it soon.", user });
});

// GET /api/users?search=&role=
export const getDirectory = asyncHandler(async (req, res) => {
  const { search, role } = req.query;
  const filter = { _id: { $ne: req.user._id }, status: "approved", role: { $in: ["student", "alumni"] } };
  if (role && ["student", "alumni"].includes(role)) filter.role = role;
  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: rx }, { companyName: rx }, { skills: rx }, { jobTitle: rx }, { headline: rx }, { department: rx }];
  }
  res.json(await User.find(filter).select(PUBLIC_SELECT).sort({ name: 1 }));
});

// GET /api/users/:id  (full public profile)
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, status: "approved" }).select(PUBLIC_SELECT);
  if (!user) { res.status(404); throw new Error("User not found"); }
  res.json(user);
});
