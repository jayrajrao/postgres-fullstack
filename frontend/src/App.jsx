import { useState } from "react";
import Register from "./components/Register";
import Login from "./components/Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
const [isEditing, setIsEditing] = useState(false);

const [profileForm, setProfileForm] = useState({
  name: "",
  email: "",
  age: "",
});

const [saving, setSaving] = useState(false);
const [selectedImage, setSelectedImage] = useState(null);
const [uploadingImage, setUploadingImage] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setMessage("");
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/users/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      setUser(data);
      setProfileForm({
  name: data.name || "",
  email: data.email || "",
  age: data.age || "",
});
    } catch (error) {
      console.error(error);
      setMessage("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };
const handleProfileChange = (e) => {
  setProfileForm({
    ...profileForm,
    [e.target.name]: e.target.value,
  });
};
const handleProfileUpdate = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");

  setSaving(true);
  setMessage("");

  try {
    const response = await fetch(
      "http://localhost:5000/users/profile",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileForm.name,
          email: profileForm.email,
          age: profileForm.age,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message);
      return;
    }

    setUser(data.user);

    setProfileForm({
      name: data.user.name || "",
      email: data.user.email || "",
      age: data.user.age || "",
    });

    setIsEditing(false);

    setMessage("Profile updated successfully");

  } catch (error) {
    console.error(error);
    setMessage("Failed to update profile");
  } finally {
    setSaving(false);
  }
};

const handleImageChange = (e) => {
  const file = e.target.files[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    setMessage("Please select an image file");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setMessage("Image size must be less than 5MB");
    return;
  }

  setSelectedImage(file);
  setMessage("");
};

const handleImageUpload = async () => {
  if (!selectedImage) {
    setMessage("Please select an image first");
    return;
  }

  const token = localStorage.getItem("token");

  const formData = new FormData();

  formData.append("profileImage", selectedImage);

  setUploadingImage(true);
  setMessage("");

  try {
    const response = await fetch(
      "http://localhost:5000/users/profile/image",
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message);
      return;
    }

    setUser(data.user);
    setSelectedImage(null);

    setMessage("Profile image uploaded successfully");

  } catch (error) {
    console.error(error);
    setMessage("Failed to upload profile image");
  } finally {
    setUploadingImage(false);
  }
};
  const handleLogout = () => {
    localStorage.removeItem("token");

    setUser(null);
    setIsLoggedIn(false);
    setMessage("");
  };

  // LOGIN / REGISTER PAGE
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-4 py-10">

        <div className="w-full max-w-5xl">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/30 mb-5">
              <span className="text-2xl text-white font-bold">
                J
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              My Full Stack App
            </h1>

            <p className="mt-3 text-slate-400">
              React + Node.js + PostgreSQL
            </p>
          </div>

          {/* Auth Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Register */}
            <div className="bg-white rounded-3xl p-7 md:p-8 shadow-2xl shadow-black/20 border border-white/10">
              <div className="mb-7">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  New here?
                </span>

                <h2 className="text-2xl font-bold text-slate-900 mt-2">
                  Create Account
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Create your account to get started.
                </p>
              </div>

              <Register />
            </div>

            {/* Login */}
            <div className="bg-white rounded-3xl p-7 md:p-8 shadow-2xl shadow-black/20 border border-white/10">
              <div className="mb-7">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Welcome back
                </span>

                <h2 className="text-2xl font-bold text-slate-900 mt-2">
                  Sign In
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Login to access your account.
                </p>
              </div>

              <Login
                onLoginSuccess={handleLoginSuccess}
              />
            </div>

          </div>

          {/* Footer */}
          <p className="text-center text-slate-500 text-sm mt-8">
            Secure authentication powered by JWT
          </p>

        </div>
      </div>
    );
  }

  // USER DASHBOARD
  return (
    <div className="min-h-screen bg-slate-100">

      {/* Navbar */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              User Dashboard
            </h1>

            <p className="text-sm text-slate-500">
              Manage your account
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition"
          >
            Logout
          </button>

        </div>
      </header>

      {/* Dashboard */}
      <main className="max-w-6xl mx-auto px-5 py-10">

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Welcome back
          </h2>

          <p className="text-slate-500 mt-1">
            View your account information below.
          </p>
        </div>

        {!user ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 max-w-xl">

            <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center mb-5">
              <span className="text-2xl">
                👤
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              Your Profile
            </h3>

            <p className="text-slate-500 mt-2 mb-6">
              Load your account information from the server.
            </p>

            <button
              onClick={fetchProfile}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load Profile"}
            </button>

            {message && (
              <p className="mt-4 text-sm text-red-500">
                {message}
              </p>
            )}

          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Profile Summary */}
          <div className="flex flex-col items-center">

  {/* Profile Image */}

  <div className="w-28 h-28 rounded-full overflow-hidden bg-indigo-600 flex items-center justify-center mb-4">

    {user.profile_image ? (
      <img
        src={user.profile_image}
        alt="Profile"
        className="w-full h-full object-cover"
      />
    ) : (
      <span className="text-4xl text-white font-bold">
        {user.name?.charAt(0).toUpperCase()}
      </span>
    )}

  </div>

  {/* Image Input */}

  <label className="cursor-pointer">

    <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition">
      Choose Image
    </span>

    <input
      type="file"
      accept="image/*"
      onChange={handleImageChange}
      className="hidden"
    />

  </label>

  {/* Selected Image */}

  {selectedImage && (
    <p className="text-xs text-slate-500 mt-2 text-center">
      {selectedImage.name}
    </p>
  )}

  {/* Upload Button */}

  {selectedImage && (
    <button
      onClick={handleImageUpload}
      disabled={uploadingImage}
      className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
    >
      {uploadingImage
        ? "Uploading..."
        : "Upload Image"}
    </button>
  )}

</div>

            {/* Details */}
        {/* Details */}
<div className="md:col-span-2 bg-white rounded-3xl p-7 shadow-sm border border-slate-200">

  <div className="flex items-center justify-between mb-6">

    <h3 className="text-xl font-bold text-slate-900">
      Account Information
    </h3>

    {!isEditing && (
      <button
        onClick={() => {
          setIsEditing(true);
          setMessage("");
        }}
        className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
      >
        Edit Profile
      </button>
    )}

  </div>

  {isEditing ? (

    <form
      onSubmit={handleProfileUpdate}
      className="space-y-5"
    >

      {/* Name */}

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">
          Full Name
        </label>

        <input
          type="text"
          name="name"
          value={profileForm.name}
          onChange={handleProfileChange}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      {/* Email */}

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">
          Email
        </label>

        <input
          type="email"
          name="email"
          value={profileForm.email}
          onChange={handleProfileChange}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      {/* Age */}

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">
          Age
        </label>

        <input
          type="number"
          name="age"
          value={profileForm.age}
          onChange={handleProfileChange}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Buttons */}

      <div className="flex gap-3 pt-2">

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsEditing(false);

            setProfileForm({
              name: user.name || "",
              email: user.email || "",
              age: user.age || "",
            });

            setMessage("");
          }}
          className="px-5 py-3 rounded-xl bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition"
        >
          Cancel
        </button>

      </div>

    </form>

  ) : (

    <div className="space-y-4">

      <div className="flex items-center justify-between py-4 border-b border-slate-100">
        <span className="text-slate-500">
          Full Name
        </span>

        <span className="font-semibold text-slate-900">
          {user.name}
        </span>
      </div>

      <div className="flex items-center justify-between py-4 border-b border-slate-100">
        <span className="text-slate-500">
          Email
        </span>

        <span className="font-semibold text-slate-900">
          {user.email}
        </span>
      </div>

      <div className="flex items-center justify-between py-4 border-b border-slate-100">
        <span className="text-slate-500">
          Age
        </span>

        <span className="font-semibold text-slate-900">
          {user.age}
        </span>
      </div>

      <div className="flex items-center justify-between py-4 border-b border-slate-100">
        <span className="text-slate-500">
          Account Type
        </span>

        <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
          {user.role || "user"}
        </span>
      </div>

      <div className="flex items-center justify-between py-4">
        <span className="text-slate-500">
          Account Status
        </span>

        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            user.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {user.status}
        </span>
      </div>

    </div>

  )}

  {message && (
    <p
      className={`mt-5 text-sm font-medium ${
        message.includes("successfully")
          ? "text-green-600"
          : "text-red-500"
      }`}
    >
      {message}
    </p>
  )}

</div>

          </div>
        )}

      </main>
    </div>
  );
}

export default App;