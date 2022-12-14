const jwt = require("jsonwebtoken");
const db = require("../lib/db.js");
require('dotenv').config();

verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({
      message: "Unknown Token",
    });
  }
  let token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!",
    });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized! Token is expire",
      });
    }
    req.user = decoded;
    next();
  });

};

isAdmin = async (req, res, next) => {
  try {
      if (req.user.role_name === "Admin" || req.user.role_name === "Teacher" || req.user.role_name === "admin" || req.user.role_name === "teacher") {
        return next();
      }
    return res.status(403).send({
      message: "Require Admin Role!",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Unable to validate User role!",
    });
  }
};

const authJwt = {
    verifyToken,
    isAdmin
};
module.exports = authJwt;