const express = require('express')
const router = express.Router()
const authJwt = require('../middleware/authJwt')
const db = require('../lib/db.js')

router.get('/getUserAdd', [authJwt.verifyToken], (req, res) => {
  const user_id = req.user.user_id
  db.query(
    `select * from user_addres where user_id = ${user_id}`,
    (err, data) => {
      if (err) {
        return res.status(400).send({
          message: err.code
        })
      } else {
        return res.status(200).send({
          data,
          totle: data.length
        })
      }
    }
  )
})

router.post('/useradd', [authJwt.verifyToken], (req, res) => {
  const user_id = req.user.user_id
  const address = req.body.address
  const sub_district = req.body.sub_district
  const district = req.body.district
  const province = req.body.province
  const tel = req.body.tel
  db.query(
    `INSERT INTO user_address (user_id, address , sub_district, district, province, tel) 
                VALUES (${user_id}, '${address}', '${sub_district}', '${district}', '${province}', ${tel})`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          message: err.code
        })
      } else {
        return res.status(200).send({
          message: 'insert succeeded step next verify otp',
          user_address_id: result.insertId
        })
      }
    }
  )
})

module.exports = router
