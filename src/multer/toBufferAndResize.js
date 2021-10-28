const sharp = require("sharp");

function toBufferAndResize(buffer) {
  return sharp(buffer).resize({ height: 500, width: 475 }).png().toBuffer();
}

module.exports = toBufferAndResize;
