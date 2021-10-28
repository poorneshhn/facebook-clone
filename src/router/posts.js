const express = require("express");
const Post = require("../models/post");
const User = require("../models/user");
const toBufferAndResize = require("../multer/toBufferAndResize");

const postRouter = new express.Router();

const upload = require("../multer/multerFileValidation");

// create post
postRouter.post("/", upload.single("file"), async (req, res) => {
  try {
    const post = await new Post({
      description: req.body.description,
      userId: req.body.userId,
    });

    if (req.file !== undefined) {
      const buffer = await toBufferAndResize(req.file.buffer);
      post.img = buffer;
      post.filePresent = req.body.filePresent;
    }
    await post.save();
    res.send("Successfully uploaded a post!");
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// update post
postRouter.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.send("Post is updated");
    } else return res.status(403).send("you can update only your posts");
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// delete post
postRouter.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.send("Post is deleted");
    } else return res.status(403).send("you can delete only your posts");
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// like/dislike a post
postRouter.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.send("Liked the post");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.send("post disliked");
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// get a post
postRouter.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.send({ data: "no posts found!" });
    res.send(post);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// post image route
postRouter.get("/:id/posts/images", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      throw new Error("Unable to fetch post image!");
    }
    res.set("Content-Type", "image/png");
    res.send(post.img);
  } catch (error) {
    console.log(error);
  }
});

// get timeline posts
postRouter.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);

    const userPosts = await Post.find({ userId: currentUser._id }).sort({
      createdAt: "desc",
    });

    const followingUsersPost = await Promise.all(
      currentUser.following.map((user) => Post.find({ userId: user }))
    );

    res
      .status(200)
      .json(
        userPosts
          .concat(...followingUsersPost)
          .sort((a, b) => b.createdAt - a.createdAt)
      );
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// get user posts
postRouter.get("/profile/:userId", async (req, res) => {
  try {
    const userPosts = await Post.find({ userId: req.params.userId }).sort({
      createdAt: "desc",
    });

    res.status(200).json(userPosts);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = postRouter;
