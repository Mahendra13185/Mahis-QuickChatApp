import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext";

const MAX_IMAGE_SIZE = 1024 * 1024;

const ProfilePage = () => {
  const { authUser, updateUserProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedImg, setSelectedImg] = useState(null);
  const [loading, setLoading] = useState(false); // ✅ NEW

  useEffect(() => {
    if (authUser) {
      setName(authUser.fullName || "");
      setBio(authUser.bio || "");
    }
  }, [authUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // ✅ START LOADING

    if (selectedImg && selectedImg.size > MAX_IMAGE_SIZE) {
      toast.error("Image must be less than 1MB");
      setLoading(false);
      return;
    }

    const payload = { fullName: name, bio };

    if (selectedImg) {
      const reader = new FileReader();

      reader.onload = async () => {
        payload.profilePic = reader.result;

        const ok = await updateUserProfile(payload);
        setLoading(false);

        if (ok) navigate("/");
      };

      reader.onerror = () => {
        toast.error("Image read failed");
        setLoading(false);
      };

      reader.readAsDataURL(selectedImg);
    } else {
      const ok = await updateUserProfile(payload);
      setLoading(false);

      if (ok) navigate("/");
    }
  };

  if (!authUser) return null;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border border-gray-600 rounded-lg flex max-sm:flex-col-reverse">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-10 flex-1">
          <h3 className="text-lg">Profile details</h3>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="file"
              hidden
              accept=".png,.jpg,.jpeg"
              onChange={(e) => setSelectedImg(e.target.files[0])}
            />
            <img
              src={
                selectedImg
                  ? URL.createObjectURL(selectedImg)
                  : authUser.profilePic || assets.avatar_icon
              }
              className="w-12 h-12 rounded-full"
              alt=""
            />
            Upload Profile Picture
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="p-2 border border-gray-500 rounded-md"
          />

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            required
            className="p-2 border border-gray-500 rounded-md"
          />

          <button
            type="submit"
            disabled={loading}
            className={`p-2 rounded-full text-white ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-400 to-violet-600"
            }`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>

        <img
          src={authUser?.profilePic || assets.logo_icon}
          alt=""
          className={` flex items-center max-w-49 h-49  aspect-square rounded-full m-10  max-sm:mt-10 ${selectedImg 
            && 'rounded-full'
          }`}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
