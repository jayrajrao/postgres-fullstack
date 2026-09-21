import { useState } from "react";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("adminToken")
  );

  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

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

      localStorage.setItem("adminToken", data.token);

      setIsLoggedIn(true);
      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem("adminToken");

    try {
      const response = await fetch(
        "http://localhost:5000/admin/users",
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

      setUsers(data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to fetch users");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsLoggedIn(false);
    setUsers([]);
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <div className="admin-header">
            <h1>Admin Panel</h1>
            <p>Login to access the admin dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="admin-form">
            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                name="email"
                placeholder="Admin Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit">
              Login as Admin
            </button>
          </form>

          {message && (
            <p className="message error">
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage your application users</p>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <div className="stats-card">
          <h3>Total Users</h3>
          <p>{users.length}</p>
        </div>

        <div className="users-section">
          <div className="section-header">
            <h2>Users</h2>

            <button
              className="load-button"
              onClick={fetchUsers}
            >
              Load Users
            </button>
          </div>

          {message && (
            <p className="message error">
              {message}
            </p>
          )}

          {users.length > 0 ? (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Age</th>
                    <th>Role</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.age}</td>
                      <td>
                        <span
                          className={
                            user.role === "admin"
                              ? "role admin"
                              : "role user"
                          }
                        >
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty">
              Click "Load Users" to fetch users.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;