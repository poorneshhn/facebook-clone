const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const regRouter = new express.Router();

regRouter.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 8);

    const user = await new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    await user.save();
    res.send(user);
  } catch (error) {
    res.status(500).send({ error });
  }
});

regRouter.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(404).json({ error: "user not found!" });

    if (await bcrypt.compare(req.body.password, user.password)) {
      res.json(user);
    } else res.status(404).send("Incorrect password!");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = regRouter;
