const express = require("express");
const { authenticate } = require("../middleware/auth");
const saucesRouter = express.Router();
const multer = require("../middleware/multer-config");

const {
  getAllSauces,
  getOneSauce,
  createSauce,
  updateSauce,
  updateSauceLikeStatus,
  deleteSauce,
} = require("../controllers/sauces.controller");

saucesRouter.get("/", authenticate, getAllSauces);
saucesRouter.get("/:id", authenticate, getOneSauce);
saucesRouter.post("/", authenticate, multer, createSauce);
saucesRouter.put("/:id", authenticate, multer, updateSauce);
saucesRouter.post("/:id/like", authenticate, updateSauceLikeStatus);
saucesRouter.delete("/:id", authenticate, deleteSauce);

module.exports = saucesRouter;
