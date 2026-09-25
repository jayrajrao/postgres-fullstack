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

  // Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalUsers: 0,
    totalPages: 0,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // ADMIN LOGIN
  // =========================

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

  // =========================
  // FETCH USERS
  // =========================

  const fetchUsers = async (selectedPage = 1) => {
    const token = localStorage.getItem("adminToken");

    try {
      setMessage("");

      const response = await fetch(
        `http://localhost:5000/admin/users?page=${selectedPage}&limit=5`,
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

      // Backend response:
      // {
      //   users: [],
      //   pagination: {}
      // }

      setUsers(data.users);
      setPagination(data.pagination);
      setPage(selectedPage);

    } catch (error) {
      console.error(error);
      setMessage("Failed to fetch users");
    }
  };
const handleStatusChange = async (user) => {
  const token = localStorage.getItem("adminToken");

  const newStatus =
    user.status === "active"
      ? "inactive"
      : "active";

  try {
    const response = await fetch(
      `http://localhost:5000/admin/users/${user.id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message);
      return;
    }

    // Refresh current page
    fetchUsers(page);

  } catch (error) {
    console.error(error);
    setMessage("Failed to update user status");
  }
};

const handleDeleteUser = async (userId) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this user?"
  );

  if (!confirmed) {
    return;
  }

  const token = localStorage.getItem("adminToken");

  try {
    const response = await fetch(
      `http://localhost:5000/admin/users/${userId}`,
      {
        method: "DELETE",
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

    setMessage("");

    // Refresh current page
    fetchUsers(page);

  } catch (error) {
    console.error(error);

    setMessage("Failed to delete user");
  }
};
  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("adminToken");

    setIsLoggedIn(false);
    setUsers([]);
    setPage(1);
  };

  // =========================
  // LOGIN PAGE
  // =========================

  if (!isLoggedIn) {
    return (
      <div className="admin-page">

        <div className="admin-card">

          <div className="admin-header">
            <h1>Admin Panel</h1>

            <p>
              Login to access the admin dashboard
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="admin-form"
          >

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

  // =========================
  // ADMIN DASHBOARD
  // =========================

  return (
    <div className="dashboard">

      <header className="dashboard-header">

        <div>

          <h1>Admin Dashboard</h1>

          <p>
            Manage your application users
          </p>

        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </header>

      <main className="dashboard-content">

        {/* TOTAL USERS */}

        <div className="stats-card">

          <h3>Total Users</h3>

          <p>
            {pagination.totalUsers}
          </p>

        </div>

        {/* USERS */}

        <div className="users-section">

          <div className="section-header">

            <h2>Users</h2>

            <button
              className="load-button"
              onClick={() => fetchUsers(1)}
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

            <>
              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Age</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>

                  </thead>

                  <tbody>

                    {users.map((user) => (

                      <tr key={user.id}>

                        <td>
                          {user.id}
                        </td>

                        <td>
                          {user.name}
                        </td>

                        <td>
                          {user.email}
                        </td>

                        <td>
                          {user.age}
                        </td>

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

                        <td>

                          <span
                            className={
                              user.status === "active"
                                ? "status active"
                                : "status inactive"
                            }
                          >
                            {user.status}
                          </span>

                        </td>
                      
                      <td>
  <button
  onClick={() => handleStatusChange(user)}
  className={
    user.status === "active"
      ? "action-button deactivate"
      : "action-button activate"
  }
>
  {user.status === "active" ? "⏸ Deactivate" : "✓ Activate"}
</button>
<button
  onClick={() => handleDeleteUser(user.id)}
  className="action-button delete"
>
  Delete
</button>
</td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              {/* PAGINATION */}

              <div className="pagination">

                <button
                  disabled={page === 1}
                  onClick={() =>
                    fetchUsers(page - 1)
                  }
                >
                  Previous
                </button>

                <span>
                  Page {pagination.page} of{" "}
                  {pagination.totalPages}
                </span>

                <button
                  disabled={
                    page === pagination.totalPages
                  }
                  onClick={() =>
                    fetchUsers(page + 1)
                  }
                >
                  Next
                </button>

              </div>

            </>

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