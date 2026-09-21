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
    } catch (error) {
      console.error(error);
      setMessage("Failed to fetch profile");
    } finally {
      setLoading(false);
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
            <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-200">

              <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mb-5">
                <span className="text-2xl text-white font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                {user.name}
              </h3>

              <p className="text-slate-500 mt-1">
                {user.email}
              </p>

            </div>

            {/* Details */}
            <div className="md:col-span-2 bg-white rounded-3xl p-7 shadow-sm border border-slate-200">

              <h3 className="text-xl font-bold text-slate-900 mb-6">
                Account Information
              </h3>

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

                <div className="flex items-center justify-between py-4">
                  <span className="text-slate-500">
                    Account Type
                  </span>

                  <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
                    {user.role || "user"}
                  </span>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}

export default App;