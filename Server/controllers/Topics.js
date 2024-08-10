import Topic from "../models/TopicModel.js";
import User from "../models/UserModel.js";
import Division from "../models/DivisionModel.js";
import { Op } from "sequelize";

export const getTopics = async (req, res) => {
  try {
    let response;
    if (req.role === "admin") {
      response = await Topic.findAll({
        attributes: ["uuid", "name", "description"],
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
        ],
      });
    } else {
      response = await Topic.findAll({
        attributes: ["uuid", "name", "description"],
        where: {
          userId: req.userId,
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
        ],
      });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getTopicByFilter = async (req, res) => {
  const divisionName = req.query.division;

  let query = {};
  if (divisionName) {
    const division = await Division.findOne({ where: { name: divisionName } });
    if (division) {
      query.divisionId = division.id;
    }
  }
  const topics = await Topic.findAll({
    where: query,
    include: [{ model: Division, as: "division" }],
  });
  res.json(topics);
};

export const getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!topic) return res.status(404).json({ msg: "Data tidak ditemukan" });
    let response;
    if (req.role === "admin") {
      response = await Topic.findOne({
        attributes: ["uuid", "name", "description"],
        where: {
          id: topic.id,
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
        ],
      });
    } else {
      response = await Topic.findOne({
        attributes: ["uuid", "name", "description"],
        where: {
          [Op.and]: [{ id: Topic.id }, { userId: req.userId }],
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
        ],
      });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createTopic = async (req, res) => {
  const { name, description, divisionName } = req.body;

  const division = await Division.findOne({ where: { name: divisionName } });
  if (!division) return res.status(400).json({ message: "Invalid Division" });
  try {
    await Topic.create({
      name: name,
      description: description,
      divisionId: division.id,
      userId: req.userId,
    });
    res.status(201).json({ msg: "Topic Created Successfuly" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const updateTopic = async (req, res) => {
  try {
    const Topic = await Topic.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!Topic) return res.status(404).json({ msg: "Data tidak ditemukan" });
    const { name, description, divisionName } = req.body;
    const division = await Division.findOne({ where: { name: divisionName } });
    if (!division) return res.status(400).json({ message: "Invalid Division" });

    if (req.role === "admin") {
      await Topic.update(
        { name, description, divisionId: division.id },
        {
          where: {
            id: Topic.id,
          },
        }
      );
    } else {
      if (req.userId !== Topic.userId)
        return res.status(403).json({ msg: "Akses terlarang" });
      await Topic.update(
        { name, description },
        {
          where: {
            [Op.and]: [{ id: Topic.id }, { userId: req.userId }],
          },
        }
      );
    }
    res.status(200).json({ msg: "Topic updated successfuly" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const deleteTopic = async (req, res) => {
  try {
    const Topic = await Topic.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!Topic) return res.status(404).json({ msg: "Data tidak ditemukan" });
    const { name, description } = req.body;
    if (req.role === "admin") {
      await Topic.destroy({
        where: {
          id: Topic.id,
        },
      });
    } else {
      if (req.userId !== Topic.userId)
        return res.status(403).json({ msg: "Akses terlarang" });
      await Topic.destroy({
        where: {
          [Op.and]: [{ id: Topic.id }, { userId: req.userId }],
        },
      });
    }
    res.status(200).json({ msg: "Topic deleted successfuly" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
