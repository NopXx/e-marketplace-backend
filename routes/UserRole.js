const express = require('express')
require('dotenv').config()
const router = express.Router()

const jwt = require('jsonwebtoken')
const db = require('../lib/db.js')
const authJwt = require('../middleware/authJwt')

router.post('/created_role/:user_id', (req, res) => {
  const user_id = req.params.user_id
  db.query(
    `INSERT INTO user_role (user_id, role_id) VALUES (${user_id}, 1);`,
    (err, result) => {
      if (err) {
        res.send(err)
      } else {
        return res.status(200).send({
          msg: 'insert succeeded'
        })
      }
    }
  )
})
