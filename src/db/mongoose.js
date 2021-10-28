const mongoose = require("mongoose");
const db = mongoose.connection;
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
});

db.on("error", (err) => console.log("Could not connect to database"));
db.once("open", () => console.log("Connected to database"));
