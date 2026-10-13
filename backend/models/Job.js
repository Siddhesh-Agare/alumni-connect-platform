import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, default: "" },
    type: { type: String, enum: ["Full-time", "Part-time", "Internship", "Contract"], default: "Full-time" },
    description: { type: String, required: true },
    applyLink: { type: String, default: "" },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // every job must be verified by an admin before students can see it
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
