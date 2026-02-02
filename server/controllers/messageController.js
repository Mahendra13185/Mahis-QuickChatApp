import User from "../models/User.js";
import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

/* =========================
   GET USERS FOR SIDEBAR
========================= */
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const users = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    const unseenMessages = {};

    const messages = await Message.find({
      receiver: loggedInUserId,
      seen: false,
    });

    messages.forEach((msg) => {
      unseenMessages[msg.sender] =
        (unseenMessages[msg.sender] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      users,
      unseenMessages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

/* =========================
   GET CHAT MESSAGES
========================= */
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: selectedUserId },
        { sender: selectedUserId, receiver: myId },
      ],
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      { sender: selectedUserId, receiver: myId },
      { seen: true }
    );

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   MARK MESSAGE AS SEEN
========================= */
export const markMessagesAsSeen = async (req, res) => {
  try {
    const { id } = req.params;

    await Message.findByIdAndUpdate(id, { seen: true });

    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   SEND MESSAGE (FIXED)
========================= */
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      sender: senderId,      // ✅ FIXED
      receiver: receiverId,  // ✅ FIXED
      text,
      image: imageUrl,
    });

    const receiverSocketId = userSocketMap[receiverId.toString()];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.json({
      success: true,
      newMessage,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
