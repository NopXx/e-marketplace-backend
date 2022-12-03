const jwt = require("jsonwebtoken");
const db = require("../lib/db.js");
require('dotenv').config();

verifyToken = (req, res, next) => {
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

const authJwt = {
    verifyToken
};
module.exports = authJwt;