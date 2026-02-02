import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

/* ======================
   AXIOS SETUP
====================== */
const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.token = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ======================
     CHECK AUTH
  ====================== */
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");

      if (data?.success && data?.user) {
        setAuthUser(data.user);
      } else {
        setAuthUser(null);
      }
    } catch {
      setAuthUser(null);
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     LOGIN / SIGNUP
  ====================== */
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);

      if (!data.success) {
        toast.error(data.message);
        return false;
      }

      localStorage.setItem("token", data.token);
      setAuthUser(data.userData);
      toast.success(data.message);
      return true;
    } catch {
      toast.error("Authentication failed");
      return false;
    }
  };

  /* ======================
     LOGOUT
  ====================== */
  const logout = () => {
    localStorage.removeItem("token");
    if (socket) socket.disconnect();
    setSocket(null);
    setAuthUser(null);
    setOnlineUsers([]);
    toast.success("Logged out Successfully");
  };

  /* ======================
     UPDATE PROFILE
  ====================== */
  const updateUserProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);

      if (!data?.success || !data?.user) {
        toast.error("Profile update failed");
        return false;
      }

      setAuthUser(data.user);
      toast.success("Profile updated successfully");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
      return false;
    }
  };

  /* ======================
     INIT SOCKET (AFTER LOGIN)
  ====================== */
  useEffect(() => {
    if (!authUser) return;

    const newSocket = io(backendUrl, {
      query: { userId: authUser._id },
    });

    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => newSocket.disconnect();
  }, [authUser]);

  /* ======================
     INIT AUTH ON LOAD
  ====================== */
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authUser,
        loading,
        login,
        logout,
        updateUserProfile,
        socket,
        onlineUsers,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
