import React, { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
  } = useContext(ChatContext);

  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef(null);
  const [input, setInput] = useState("");

  /* ================= SEND TEXT ================= */
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    await sendMessage({ text: input.trim() });
    setInput("");
  };

  /* ================= SEND IMAGE ================= */
  const handleSendImage = async (e) => {
    const file = e.target.files[0];

    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  /* ================= LOAD MESSAGES ================= */
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= EMPTY STATE ================= */
  if (!selectedUser) {
    return (
      <div className="flex flex-col justify-center items-center text-gray-400 bg-white/10">
        <img src={assets.logo_icon} className="max-w-16" />
        <p className="text-lg text-white">Chat anytime, anywhere</p>
      </div>
    );
  }

  return (
    <div className="h-full relative backdrop-blur-lg">
      {/* ---------- HEADER ---------- */}
      <div className="flex items-center gap-3 py-3 px-4 border-b border-stone-500">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          className="w-8 rounded-full"
        />

        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers?.includes(selectedUser._id) && (
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          )}
        </p>

        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          className="md:hidden max-w-7 cursor-pointer"
        />
      </div>

      {/* ---------- CHAT ---------- */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-4">
        {messages.map((msg) => {
          const isMine = msg.sender?.toString() === authUser._id;

          return (
            <div
              key={msg._id}
              className={`flex items-end mb-4 ${
                isMine ? "justify-end" : "justify-start"
              }`}
            >
              {/* LEFT AVATAR (OTHER USER) */}
              {!isMine && (
                <img
                  src={selectedUser.profilePic || assets.avatar_icon}
                  className="w-7 h-7 rounded-full mr-2"
                />
              )}

              {/* MESSAGE + TIME */}
              <div
                className={`flex flex-col ${
                  isMine ? "items-end" : "items-start"
                } max-w-[70%]`}
              >
                {msg.image ? (
                  <img
                    src={msg.image}
                    className="rounded-lg max-w-[240px]"
                  />
                ) : (
                  <div
                    className={`px-3 py-2 text-white rounded-lg ${
                      isMine
                        ? "bg-violet-500/40 rounded-br-none"
                        : "bg-gray-500/40 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                )}

                <span className="text-xs text-gray-400 mt-1">
                  {formatMessageTime(msg.createdAt)}
                </span>
              </div>

              {/* RIGHT AVATAR (ME) */}
              {isMine && (
                <img
                  src={authUser.profilePic || assets.avatar_icon}
                  className="w-7 h-7 rounded-full ml-2"
                />
              )}
            </div>
          );
        })}
        <div ref={scrollEnd} />
      </div>

      {/* ---------- INPUT ---------- */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex flex-1 items-center bg-gray-100/10 px-3 rounded-full">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            type="text"
            placeholder="Send a message"
            className="flex-1 text-sm p-3 bg-transparent outline-none text-white"
          />

          <input
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            hidden
            onChange={handleSendImage}
          />

          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>

        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          className="w-7 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default ChatContainer;
