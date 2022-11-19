const express = require("express");
const path = require("path");
const cors = require("cors");
const saucesRouter = require("./routes/sauces.router");
const userRouter = require("./routes/user.router");
const app = express();

app.use(
  cors({
    origin: "*",
  })
);
app.use(
  express.static(path.join(__dirname, "..", "client", "dist", "hot-takes"))
);
app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "client", "dist", "hot-takes", "index.html")
  );
});
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/api/auth", userRouter);
app.use("/api/sauces", saucesRouter);

module.exports = app;
