// MUST be first – ESM-safe dotenv
import "dotenv/config";

import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./lib/db.js";
import userRouter from "./routes/UserRoutes.js";
import messageRouter from "./routes/messageRouter.js";

const app = express();
const server = http.createServer(app);

/* =========================
   BODY PARSER
========================= */
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

/* =========================
   CORS
========================= */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

/* =========================
   SOCKET.IO
========================= */
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

export const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    if (userId) delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

/* =========================
   ROUTES
========================= */
app.get("/api/status", (req, res) => {
  res.json({ success: true, message: "Server is live" });
});

app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Image size exceeds 5MB limit",
    });
  }

  console.error(err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  });
