import Message from "../models/Message.js";
import Connection from "../models/Connection.js";
import asyncHandler from "../utils/asyncHandler.js";

const ensureConnected = async (a, b) =>
  !!(await Connection.findOne({
    status: "accepted",
    $or: [{ requester: a, recipient: b }, { requester: b, recipient: a }],
  }));

// GET /api/messages/:userId
export const getConversation = asyncHandler(async (req, res) => {
  const other = req.params.userId;
  if (!(await ensureConnected(req.user._id, other))) { res.status(403); throw new Error("You can only chat with connections"); }
  const messages = await Message.find({
    $or: [{ sender: req.user._id, receiver: other }, { sender: other, receiver: req.user._id }],
  }).sort({ createdAt: 1 });
  res.json(messages);
});

// POST /api/messages/:userId
export const sendMessage = asyncHandler(async (req, res) => {
  const other = req.params.userId;
  const text = (req.body.text || "").trim();
  if (!text) { res.status(400); throw new Error("Message cannot be empty"); }
  if (!(await ensureConnected(req.user._id, other))) { res.status(403); throw new Error("You can only chat with connections"); }
  const msg = await Message.create({ sender: req.user._id, receiver: other, text });
  res.status(201).json(msg);
});
