const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      max: 100,
    },
    img: {
      type: Buffer,
    },
    likes: {
      type: Array,
      default: [],
    },
    filePresent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.methods.toJSON = function () {
  const post = this;
  const postObject = post.toObject();

  delete postObject.img;
  return postObject;
};

module.exports = mongoose.model("Post", postSchema);
