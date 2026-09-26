

import { useState, useEffect } from "react";
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
  const [friendRequests, setFriendRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [friendMessage, setFriendMessage] = useState("");

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userMessage, setUserMessage] = useState("");

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

    fetchFriendRequests();
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

  const fetchFriendRequests = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      setLoadingRequests(true);
      setFriendMessage("");

      const response = await fetch(
        "http://localhost:5000/friends/requests",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setFriendMessage(data.message);
        return;
      }

      setFriendRequests(data.requests);
    } catch (error) {
      console.error(error);
      setFriendMessage("Failed to fetch friend requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      setLoadingUsers(true);
      setUserMessage("");

      const response = await fetch("http://localhost:5000/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setUserMessage(data.message);
        return;
      }

      setUsers(data.users || data);
    } catch (error) {
      console.error(error);
      setUserMessage("Failed to fetch users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSendFriendRequest = async (userId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/friends/request/${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setUserMessage(data.message);
        return;
      }

      setUserMessage("Friend request sent successfully");
    } catch (error) {
      console.error(error);
      setUserMessage("Failed to send friend request");
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/friends/request/${requestId}/accept`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setFriendMessage(data.message);
        return;
      }

      setFriendMessage("Friend request accepted successfully");

      // list refresh
      fetchFriendRequests();
    } catch (error) {
      console.error(error);
      setFriendMessage("Failed to accept request");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/friends/request/${requestId}/reject`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setFriendMessage(data.message);
        return;
      }

      setFriendMessage("Friend request rejected");

      // list refresh
      fetchFriendRequests();
    } catch (error) {
      console.error(error);
      setFriendMessage("Failed to reject request");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    setUser(null);
    setIsLoggedIn(false);
    setMessage("");
  };

  // Small shared style tokens so every card / button looks consistent
  const card = "bg-white rounded-2xl p-6 md:p-7 shadow-sm border border-slate-200";
  const sectionHeading = "text-lg font-semibold text-slate-900";
  const sectionSubtext = "text-sm text-slate-500 mt-0.5";
  const btnPrimary =
    "px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed";
  const btnSecondary =
    "px-4 py-2.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed";
  const row =
    "flex items-center justify-between gap-4 py-3.5 px-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition";

  // LOGIN / REGISTER PAGE
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/30 mb-5">
              <span className="text-2xl text-white font-bold">J</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              My Full Stack App
            </h1>

            <p className="mt-3 text-slate-400">React + Node.js + PostgreSQL</p>
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

                <h2 className="text-2xl font-bold text-slate-900 mt-2">Sign In</h2>

                <p className="text-sm text-slate-500 mt-1">
                  Login to access your account.
                </p>
              </div>

              <Login onLoginSuccess={handleLoginSuccess} />
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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase() || "J"}
              </span>
            </div>

            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                User Dashboard
              </h1>
              <p className="text-xs text-slate-500 leading-tight">
                Manage your account
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Dashboard */}
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Welcome back
          </h2>
          <p className="text-slate-500 mt-1">
            View your account information below.
          </p>
        </div>

        {/* Friend Requests */}
        <div className={card}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={sectionHeading}>Friend Requests</h3>
              <p className={sectionSubtext}>
                Manage your incoming friend requests
              </p>
            </div>

            <button
              onClick={fetchFriendRequests}
              disabled={loadingRequests}
              className={btnSecondary}
            >
              {loadingRequests ? "Loading..." : "Refresh"}
            </button>
          </div>

          {friendMessage && (
            <p className="mb-4 text-sm font-medium text-indigo-600">
              {friendMessage}
            </p>
          )}

          {loadingRequests ? (
            <p className="text-slate-500 text-sm py-4">
              Loading friend requests...
            </p>
          ) : friendRequests.length === 0 ? (
            <div className="py-10 text-center">
              <div className="text-3xl mb-3">👥</div>
              <p className="text-slate-500 text-sm">
                No pending friend requests
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {friendRequests.map((request) => (
                <div key={request.id} className={row}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold shrink-0">
                      {request.sender_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {request.sender_name}
                      </p>
                      <p className="text-sm text-slate-500 truncate">
                        {request.sender_email}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="px-3.5 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="px-3.5 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Users */}
        <div className={card}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={sectionHeading}>Users</h3>
              <p className={sectionSubtext}>
                Find people and send friend requests
              </p>
            </div>

            <button
              onClick={fetchUsers}
              disabled={loadingUsers}
              className={btnSecondary}
            >
              {loadingUsers ? "Loading..." : "Load Users"}
            </button>
          </div>

          {userMessage && (
            <p className="mb-4 text-sm font-medium text-indigo-600">
              {userMessage}
            </p>
          )}

          {users.length === 0 ? (
            <div className="py-10 text-center">
              <div className="text-3xl mb-3">🔍</div>
              <p className="text-slate-500 text-sm">No users found</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {users.map((item) => (
                <div key={item.id} className={row}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-semibold shrink-0">
                      {item.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-sm text-slate-500 truncate">
                        {item.email}
                      </p>
                    </div>
                  </div>

                  {item.id !== user?.id && (
                    <button
                      onClick={() => handleSendFriendRequest(item.id)}
                      className={`${btnPrimary} shrink-0`}
                    >
                      Add Friend
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        {!user ? (
          <div className={`${card} max-w-xl`}>
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center mb-5">
              <span className="text-2xl">👤</span>
            </div>

            <h3 className="text-xl font-bold text-slate-900">Your Profile</h3>

            <p className="text-slate-500 mt-2 mb-6">
              Load your account information from the server.
            </p>

            <button onClick={fetchProfile} disabled={loading} className={btnPrimary}>
              {loading ? "Loading..." : "Load Profile"}
            </button>

            {message && (
              <p className="mt-4 text-sm text-red-500">{message}</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Summary */}
            <div className={`${card} flex flex-col items-center text-center`}>
              {/* Profile Image */}
              <div className="w-28 h-28 rounded-full overflow-hidden bg-indigo-600 flex items-center justify-center mb-4 ring-4 ring-indigo-50">
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

              <p className="font-semibold text-slate-900">{user.name}</p>
              <p className="text-sm text-slate-500 mb-5">{user.email}</p>

              {/* Image Input */}
              <label className="cursor-pointer">
                <span className={btnSecondary}>Choose Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {/* Selected Image */}
              {selectedImage && (
                <p className="text-xs text-slate-500 mt-2 text-center truncate max-w-full">
                  {selectedImage.name}
                </p>
              )}

              {/* Upload Button */}
              {selectedImage && (
                <button
                  onClick={handleImageUpload}
                  disabled={uploadingImage}
                  className={`${btnPrimary} mt-3`}
                >
                  {uploadingImage ? "Uploading..." : "Upload Image"}
                </button>
              )}
            </div>

            {/* Details */}
            <div className={`md:col-span-2 ${card}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={sectionHeading}>Account Information</h3>

                {!isEditing && (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setMessage("");
                    }}
                    className={btnPrimary}
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleProfileUpdate} className="space-y-5">
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
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
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
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
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
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={saving} className={btnPrimary}>
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
                      className={btnSecondary}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="divide-y divide-slate-100">
                  <div className="flex items-center justify-between py-4">
                    <span className="text-slate-500 text-sm">Full Name</span>
                    <span className="font-semibold text-slate-900">
                      {user.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <span className="text-slate-500 text-sm">Email</span>
                    <span className="font-semibold text-slate-900">
                      {user.email}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <span className="text-slate-500 text-sm">Age</span>
                    <span className="font-semibold text-slate-900">
                      {user.age}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <span className="text-slate-500 text-sm">Account Type</span>
                    <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                      {user.role || "user"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <span className="text-slate-500 text-sm">
                      Account Status
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
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