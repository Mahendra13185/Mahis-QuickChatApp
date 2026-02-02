import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const Sidebar = () => {
  const navigate = useNavigate();

  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages, // ✅ FIXED (THIS WAS MISSING)
  } = useContext(ChatContext);

  const { logout, onlineUsers = [] } = useContext(AuthContext);

  const [input, setInput] = useState("");

  /* ================= FETCH USERS ================= */
  useEffect(() => {
    getUsers();
  }, []);

  /* ================= SEARCH ================= */
  const filteredUsers = input
    ? users.filter((user) =>
        user.fullName.toLowerCase().includes(input.toLowerCase())
      )
    : users;

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      {/* ---------- HEADER ---------- */}
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-40" />

          <div className="relative py-2 group">
            <img
              src={assets.menu_icon}
              alt="Menu"
              className="max-h-5 cursor-pointer"
            />

            <div className="absolute top-full right-0 z-20 w-32 p-5 rounded bg-[#282142] border border-gray-400 text-gray-100 hidden group-hover:block">
              <p
                onClick={() => navigate("/profile")}
                className="cursor-pointer text-sm"
              >
                Edit Profile
              </p>

              <hr className="my-2 border-t border-gray-500" />

              <p
                onClick={logout}
                className="cursor-pointer text-sm text-red-400"
              >
                Logout
              </p>
            </div>
          </div>
        </div>

        {/* ---------- SEARCH ---------- */}
        <div className="bg-[#282142] rounded-full flex items-center gap-2 px-4 py-3 mt-5">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            className="bg-transparent outline-none text-white text-xs flex-1"
            placeholder="Search User..."
          />
        </div>
      </div>

      {/* ---------- USERS ---------- */}
      <div className="flex flex-col">
        {filteredUsers.length === 0 && (
          <p className="text-gray-400 text-sm text-center mt-10">
            No users found
          </p>
        )}

        {filteredUsers.map((user) => (
          <div
            key={user._id}
            onClick={() => {
              setSelectedUser(user);
              setUnseenMessages((prev) => ({
                ...prev,
                [user._id]: 0,
              }));
            }}
            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer ${
              selectedUser?._id === user._id
                ? "bg-[#282142]/50"
                : ""
            }`}
          >
            <img
              src={user.profilePic || assets.avatar_icon}
              alt="Avatar"
              className="w-[35px] aspect-square rounded-full"
            />

            <div className="flex flex-col leading-5">
              <p>{user.fullName}</p>
              {onlineUsers.includes(user._id) ? (
                <span className="text-green-400 text-xs">Online</span>
              ) : (
                <span className="text-gray-400 text-xs">Offline</span>
              )}
            </div>

            {unseenMessages[user._id] > 0 && (
              <span className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                {unseenMessages[user._id]}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
