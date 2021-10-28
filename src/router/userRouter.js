const express = require("express");
const User = require("../models/user");
const userRouter = new express.Router();
const bcrypt = require("bcrypt");
const upload = require("../multer/multerFileValidation");
const toBufferAndResize = require("../multer/toBufferAndResize");
const user = require("../models/user");

// update user
userRouter.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      req.body.password = await bcrypt.hash(req.body.password, 8);

      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      if (!user) return res.status(404).send("No user found!");
      res.send("Successfully updated the user " + user);
    } catch (error) {
      res.status(500).send("unable to update the user");
      console.log(error);
    }
  } else
    return res
      .status(403)
      .send("you don't have permission to update this user");
});

// update profile
userRouter.patch(
  "/update/profile/:id",
  upload.any(),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      console.log(req.body);
      Object.keys(req.body).forEach((key) => (user[key] = req.body[key]));

      if (req.files[1]) {
        console.log(req.files);

        await Promise.all(
          req.files.map(async (file) => {
            user[file.fieldname] = await toBufferAndResize(file.buffer);
          })
        );
      } else if (req.files[0]) {
        user[req.files[0].fieldname] = await toBufferAndResize(
          req.files[0].buffer
        );
      }

      await user.save();

      res.send(user);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  },
  (error, req, res, next) => {
    if (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// serve user profile pic
userRouter.get("/profile/:id/image", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    res.set("Content-Type", "image/png");
    res.send(user.profilePicture);
  } catch (error) {
    res.status(500).send(error);
  }
});

// serve user cover pic
userRouter.get("/cover/:id/image", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    res.set("Content-Type", "image/png");
    res.send(user.coverPicture);
  } catch (error) {
    res.status(500).send(error);
  }
});

// delete user
userRouter.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).send("user not found!");

      res.send("successfully deleted" + user);
    } catch (error) {
      res.send({ error: error.message });
    }
  } else res.status(403).send("you don't have permission to delete this user");
});

// get a user
userRouter.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).send("No user found!");
    res.send(user);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// follow a user
userRouter.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      if (user.followers.includes(req.body.userId)) {
        return res.status(403).send("you are already following the user");
      } else {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({
          $push: { following: req.params.id },
        });

        res.send("you are now following the user");
      }
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  } else return res.send("you can't follow yourself!");
});

userRouter.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      if (!user.followers.includes(req.body.userId)) {
        return res.status(403).send("you do not follow this user");
      } else {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({
          $pull: { following: req.params.id },
        });

        res.send("you are now unfollowing the user");
      }
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  } else return res.send("you can't unfollow yourself!");
});

// get user friends/followings
userRouter.get("/followings/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const userFriends = await Promise.all(
      user.following.map((friend) => User.findById(friend))
    );
    const friendList = [];
    userFriends.map((friends) => {
      const { _id, username, email, createdAt, profileImagePresent } = friends;
      friendList.push({ _id, username, email, createdAt, profileImagePresent });
    });

    res.send(friendList);
  } catch (error) {
    res.status(500).json(error);
  }
});

// search for users through search field
userRouter.get("/search/users", async (req, res) => {
  if (req.query.q === null) return;

  try {
    const usernames = await User.find({
      username: new RegExp(req.query.q, "i"),
    }).limit(10);
    res.json(usernames);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = userRouter;
