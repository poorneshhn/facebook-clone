const express = require("express");
const helmet = require("helmet");
const userRouter = require("./router/userRouter");
const regRouter = require("./router/auth");
const postRoute = require("./router/posts");
const path = require("path");
require("./db/mongoose");

const port = process.env.PORT || 8000;
const app = express();

//public
app.set(express.static(path.join(__dirname, "../public")));

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
// app.use(morgan("common"));

// routes
app.use("/api/users", userRouter);
app.use("/api/posts", postRoute);
app.use("/users", regRouter);
app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/client/build"), "index.html");
});

app.listen(port, () => {
  console.log("Server is running on Port", port);
});
