const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");
const friendRoutes = require("./routes/friend.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Backend is running",
  });
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/admin", adminRoutes);
app.use("/friends", friendRoutes);
module.exports = app;