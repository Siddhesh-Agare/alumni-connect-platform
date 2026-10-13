import Connection from "../models/Connection.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import asyncHandler from "../utils/asyncHandler.js";

const USER_FIELDS = "name role companyName jobTitle graduationYear";

// GET /api/connections -> every connection record involving me
export const getMyConnections = asyncHandler(async (req, res) => {
  const list = await Connection.find({ $or: [{ requester: req.user._id }, { recipient: req.user._id }] })
    .populate("requester recipient", USER_FIELDS)
    .sort({ updatedAt: -1 });
  res.json(list);
});

// POST /api/connections/request/:userId
export const sendRequest = asyncHandler(async (req, res) => {
  const to = req.params.userId;
  if (to === String(req.user._id)) { res.status(400); throw new Error("You cannot connect with yourself"); }
  const target = await User.findOne({ _id: to, status: "approved", role: { $in: ["student", "alumni"] } });
  if (!target) { res.status(404); throw new Error("User not found"); }

  const exists = await Connection.findOne({
    $or: [
      { requester: req.user._id, recipient: to },
      { requester: to, recipient: req.user._id },
    ],
  });
  if (exists) { res.status(409); throw new Error("A request or connection already exists"); }

  const connection = await Connection.create({ requester: req.user._id, recipient: to });
  res.status(201).json({ message: "Connection request sent", connection });
});

// PUT /api/connections/:id/accept
export const acceptRequest = asyncHandler(async (req, res) => {
  const conn = await Connection.findOne({ _id: req.params.id, recipient: req.user._id, status: "pending" });
  if (!conn) { res.status(404); throw new Error("Request not found"); }
  conn.status = "accepted";
  await conn.save();
  res.json({ message: "Connection accepted", connection: conn });
});

// PUT /api/connections/:id/reject
export const rejectRequest = asyncHandler(async (req, res) => {
  const conn = await Connection.findOneAndDelete({ _id: req.params.id, recipient: req.user._id, status: "pending" });
  if (!conn) { res.status(404); throw new Error("Request not found"); }
  res.json({ message: "Request rejected" });
});

// DELETE /api/connections/:id (cancel a sent request or remove a connection)
// Removing a connection also permanently deletes the chat between the two users.
export const removeConnection = asyncHandler(async (req, res) => {
  const conn = await Connection.findOneAndDelete({
    _id: req.params.id,
    $or: [{ requester: req.user._id }, { recipient: req.user._id }],
  });
  if (!conn) { res.status(404); throw new Error("Connection not found"); }

  const { deletedCount } = await Message.deleteMany({
    $or: [
      { sender: conn.requester, receiver: conn.recipient },
      { sender: conn.recipient, receiver: conn.requester },
    ],
  });
  res.json({ message: deletedCount ? "Connection and chat removed" : "Connection removed" });
});
