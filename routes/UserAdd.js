const express = require('express')
const router = express.Router()
const authJwt = require('../middleware/authJwt')
const db = require('../lib/db.js')
const verifyForm = require('../middleware/verifyForm')

router.get('/useradd', [authJwt.verifyToken], (req, res) => {
  const user_id = req.user.user_id
  db.query(
    `select * from user_address where user_id = ${user_id} ORDER BY user_address.address_default DESC`,
    (err, data) => {
      if (err) {
        return res.status(401).send(err)
      } else {
        return res.status(200).send(data)
      }
    }
  )
})

router.get('/useradd/:user_a_id', [authJwt.verifyToken], (req, res) => {
  const user_a_id = req.params.user_a_id
  db.query(
    `select * from user_address where user_a_id = ${user_a_id}`,
    (err, data) => {
      if (err) {
        return res.status(401).send(err)
      } else {
        if (data.length === 0) {
          return res.status(404).send({
            message: 'user_address_id not found'
          })
        }
        return res.status(200).send(data)
      }
    }
  )
})

router.post('/useradd', [authJwt.verifyToken], (req, res) => {
  const user_id = req.user.user_id
  const address_title = req.body.address_title
  const fullname = req.body.fullname
  const address = req.body.address
  const sub_district = req.body.sub_district
  const district = req.body.district
  const province = req.body.province
  const zipcode = req.body.zipcode
  const tel = req.body.tel
  db.query(
    `select * from user_address where 	user_id = ${user_id}`,
    (err, data) => {
      if (err) {
        return res.status(401).send(err)
      } else {
        if (data.length === 0) {
          db.query(
            `INSERT INTO user_address (user_id, address_title, fullname, address , sub_district, district, province, zipcode, tel, status, address_default) 
                      VALUES (${user_id}, '${address_title}', '${fullname}', '${address}', '${sub_district}', '${district}', '${province}',${zipcode}, '${tel}', 1, 1)`,
            (err, result) => {
              if (err) {
                return res.status(401).send(err)
              } else {
                return res.status(201).send({
                  message: 'insert succeeded step next verify otp',
                  user_address_id: parseInt(result.insertId)
                })
              }
            }
          )
        } else {
          db.query(
            `INSERT INTO user_address (user_id, address_title, fullname, address , sub_district, district, province, zipcode, tel, status) 
                      VALUES (${user_id}, '${address_title}', '${fullname}', '${address}', '${sub_district}', '${district}', '${province}',${zipcode}, '${tel}', 1)`,
            (err, result) => {
              if (err) {
                return res.status(401).send(err)
              } else {
                return res.status(201).send({
                  message: 'insert succeeded step next verify otp',
                  user_address_id: parseInt(result.insertId)
                })
              }
            }
          )
        }
      }
    }
  )
})

router.patch('/useradd/:user_address_id', [authJwt.verifyToken], (req, res) => {
  const user_a_id = req.params.user_address_id
  const address_title = req.body.address_title
  const user_id = req.user.user_id
  const fullname = req.body.fullname
  const address = req.body.address
  const sub_district = req.body.sub_district
  const district = req.body.district
  const province = req.body.province
  const zipcode = req.body.zipcode
  const tel = req.body.tel
  db.query(
    `select * from user_address where user_a_id = ${user_a_id};`,
    (err, result) => {
      if (err) {
        return res.status(401).send(err)
      } else {
        if (result.length === 0) {
          return res.status(404).send({
            message: 'user address not found'
          })
        } else {
          db.query(
            `update user_address set address_title = '${address_title}', fullname = '${fullname}', address = '${address}', sub_district = '${sub_district}',
   district = '${district}', province = '${province}',zipcode = ${zipcode}, tel = '${tel}' 
   where user_a_id = ${user_a_id} AND user_id = ${user_id};`,
            (err, result) => {
              if (err) {
                return res.status(401).send(err)
              } else {
                return res.status(200).send({
                  message: 'update succeed'
                })
              }
            }
          )
        }
      }
    }
  )
})

// set default address
router.patch(
  '/useradd/default/:user_address_id',
  [authJwt.verifyToken],
  (req, res) => {
    const user_a_id = req.params.user_address_id
    const user_id = req.user.user_id
    db.query(
      `select * from user_address where user_a_id = ${user_a_id} and user_id = ${user_id}`,
      (err, data) => {
        if (err) {
          return res.status(401).send(err)
        } else {
          if (data.length === 0) {
            return res.status(404).send({
              message: 'user address not found'
            })
          } else {
            db.query(
              `update user_address set address_default = 0 where user_id = ${user_id}`,
              (err, result) => {
                if (err) {
                  return res.status(401).send(err)
                } else {
                  db.query(
                    `update user_address set address_default = 1 where user_a_id = ${user_a_id} and user_id = ${user_id}`,
                    (err, result) => {
                      if (err) {
                        return res.status(401).send(err)
                      } else {
                        return res.status(200).send({
                          message: 'updated default address'
                        })
                      }
                    }
                  )
                }
              }
            )
          }
        }
      }
    )
  }
)

router.delete(
  '/useradd/:user_address_id',
  [authJwt.verifyToken, verifyForm.Useradd_del],
  (req, res) => {
    const user_a_id = req.params.user_address_id
    db.query(
      `select * from user_address where user_a_id = ${user_a_id};`,
      (err, result) => {
        if (err) {
          return res.status(401).send(err)
        } else {
          if (result.length === 0) {
            return res.status(404).send({
              message: 'user_address_id not found'
            })
          } else {
            if (result[0].address_default === 1) {
              return res.status(400).send({
                message: `address is default can't delete`
              })
            } else {
              db.query(
                `delete from user_address where user_a_id = ${user_a_id}`,
                (err, result) => {
                  if (err) {
                    return res.status(401).send(err)
                  } else {
                    return res.status(200).send({
                      message: 'delete succeeded'
                    })
                  }
                }
              )
            }
          }
        }
      }
    )
  }
)

module.exports = router
