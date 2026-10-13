import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  { company: String, role: String, period: String, description: String },
  { _id: false }
);
const achievementSchema = new mongoose.Schema(
  { title: String, year: String, description: String },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["student", "alumni", "admin"], default: "student" },
    // students and admin are approved automatically; alumni start as "pending"
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },

    headline: { type: String, default: "" },
    location: { type: String, default: "" },
    department: { type: String, default: "" },
    graduationYear: Number,
    skills: { type: [String], default: [] },
    linkedin: { type: String, default: "" },
    bio: { type: String, default: "" },

    // Current company. Alumni edit it directly (they are admin-approved).
    // Students can only get it through an admin-verified request (companyRequest).
    companyName: { type: String, default: "" },
    jobTitle: { type: String, default: "" },
    companyVerified: { type: Boolean, default: false },
    companyRequest: {
      companyName: String,
      jobTitle: String,
      proof: String,
      status: { type: String, enum: ["pending", "approved", "rejected"] },
      requestedAt: Date,
    },

    internships: { type: [experienceSchema], default: [] }, // mainly students
    experience: { type: [experienceSchema], default: [] }, // mainly alumni
    achievements: { type: [achievementSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
