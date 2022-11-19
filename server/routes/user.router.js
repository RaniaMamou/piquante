const express = require("express");
const userRouter = express.Router();
const { signUp, login } = require("../controllers/user.controller");

userRouter.post("/signup", signUp);
userRouter.post("/login", login);

module.exports = userRouter;
