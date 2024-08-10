import express from "express";
import {
  getTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
} from "../controllers/Topics.js";
import { verifyUser } from "../middlewares/AuthUser.js";

const router = express.Router();

router.get("/topics", verifyUser, getTopics);
router.get("/topics/:id", verifyUser, getTopicById);
router.post("/topics", verifyUser, createTopic);
router.patch("/topics/:id", verifyUser, updateTopic);
router.delete("/topics/:id", verifyUser, deleteTopic);

export default router;
