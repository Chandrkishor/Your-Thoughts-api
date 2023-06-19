const sharp = require("sharp");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

//! Function to convert HEIC to JPEG
//? how to use above function to convert
// const jpegBuffer = await convertHeicToJpeg(heicBuffer);
async function convertHeicToJpeg(heicBuffer) {
  try {
    const jpegBuffer = await sharp(heicBuffer).jpeg().toBuffer();

    return jpegBuffer;
  } catch (error) {
    console.error("Error converting HEIC to JPEG:", error);
    throw error;
  }
}

//!
// const isMatch = await bcrypt.compare(password, hashPassword);
// const salt = crypto.randomBytes(16).toString("hex");
async function salting() {
  try {
    const salt = await crypto.randomBytes(16).toString("hex");
    return salt;
  } catch (error) {
    console.error("Salting failed:", error);
    throw error;
  }
}

async function compareAndHashPasswords(password, passwordHash, type = null) {
  try {
    if (type === "hashPassword") {
      const salt = await salting();
      //? bcrypt.hashSync()	Hashes the password immediately and returns the hash.	where bcrypt.hash() Hashes the password asynchronously and returns a promise.
      const hashPassword = await bcrypt.hashSync(password, 12, salt);
      return hashPassword;
    } else {
      const match = await bcrypt.compare(password, passwordHash);
      return match;
    }
  } catch (error) {
    console.error("Error comparing passwords:", error);
    throw error;
    // return false;
  }
}

const verifyToken = async (req, res, next) => {
  const secretKey = process.env.SECRET_KEY;
  const authHeader = req?.headers?.authorization;
  token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }

  try {
    const decodedToken = await jwt.verify(token, secretKey);
    const remainingTime = decodedToken.exp * 1000 - Date.now();

    // Token has expired
    if (remainingTime < 0) {
      // res.redirect("/login");
      return res.status(401).json({ message: "Token expired" });
    }
    req.user = decodedToken;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  convertHeicToJpeg,
  compareAndHashPasswords,
  verifyToken,
};
