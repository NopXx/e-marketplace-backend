const express = require('express')
const router = express.Router()
const authJwt = require('../middleware/authJwt')
const db = require('../lib/db.js')

router.get('/follow/product', [authJwt.verifyToken], (req, res) => {
  const user_id = req.user.user_id
  db.query(
    `SELECT product_u_follow.*, product.*, db_image.image
    FROM product_u_follow 
      LEFT JOIN product ON product_u_follow.product_id = product.product_id 
      LEFT JOIN db_image ON db_image.product_id = product.product_id
    WHERE product_u_follow.user_id = ${user_id} AND db_image.default_image = 1 AND product.product_show = 1`,
    (err, data) => {
      if (err) {
        return res.status(401).send(err)
      } else {
        return res.status(200).send(data)
      }
    }
  )
})

// get product follow by product_id
router.get('/follow/product/:id', [authJwt.verifyToken], (req, res) => {
  const id = req.params.id
  const user_id = req.user.user_id
  db.query(
    `select * from product_u_follow where user_id = ${user_id} AND product_id = ${id}`,
    (err, data) => {
      if (err) {
        return res.status(401).send(err)
      } else {
        return res.status(200).send(data)
      }
    }
  )
})
router.post('/follow/product/:id', [authJwt.verifyToken], (req, res) => {
  const id = req.params.id
  const user_id = req.user.user_id
  db.query(
    `select * from product_u_follow where user_id = ${user_id} AND product_id = ${id}`,
    (err, result) => {
      if (err) {
        return res.status(401).send({
          message: err.message
        })
      } else {
        if (result.length > 0) {
          return res.status(403).send({
            message: 'User is Like Product'
          })
        } else {
          db.query(
            `insert into product_u_follow (user_id, product_id) values (${user_id}, ${id})`,
            (err, result) => {
              if (err) {
                return res.status(err).send({
                  message: err.message
                })
              } else {
                return res.status(201).send({
                  message: 'inserted successfully'
                })
              }
            }
          )
        }
      }
    }
  )
})

router.delete('/follow/product/:id', [authJwt.verifyToken], (req, res) => {
  const id = req.params.id
  const user_id = req.user.user_id
  db.query(
    `select * from product_u_follow where user_id = ${user_id} AND product_id = ${id}`,
    (err, result) => {
      if (err) {
        return res.status(401).send(err)
      } else {
        if (result.length === 0) {
          return res.status(404).send({
            message: 'User is Like Product not found'
          })
        } else {
          db.query(
            `delete from product_u_follow where user_id = ${user_id} AND product_id = ${id}`,
            (err, result) => {
              if (err) {
                return res.status(401).send(err)
              } else {
                return res.status(200).send({
                  message: 'Un Like Product'
                })
              }
            }
          )
        }
      }
    }
  )
})

module.exports = router
