import { useState } from "react";

function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      localStorage.setItem("token", data.token);

      setMessage("Login successful!");

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Email
          </label>

          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>

            <button
              type="button"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              Forgot password?
            </button>
          </div>

          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-semibold shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.99] transition disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

      </form>

      {message && (
        <p
          className={`mt-4 text-sm text-center font-medium ${
            message.includes("successful")
              ? "text-emerald-600"
              : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}

    </div>
  );
}

export default Login;