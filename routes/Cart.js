const express = require('express')
const router = express.Router()
const authJwt = require('../middleware/authJwt')
const db = require('../lib/db.js')

router.get('/cart', [authJwt.verifyToken], (req, res) => {
  const user_id = req.user.user_id
  const limit = req.query.limit
  db.query(
    `select cart.cart_id, cart.item_number, cart.created_at, product.*, store.store_name, db_image.image 
    from cart 
      LEFT JOIN product ON cart.product_id = product.product_id 
      LEFT JOIN db_image ON db_image.product_id = product.product_id 
      LEFT JOIN store ON product.store_id = store.store_id
    where cart.user_id = ${user_id} AND db_image.default_image = 1 AND cart.cart_order_status = 0 ORDER BY cart.cart_id DESC`,
    (err, data) => {
      if (err) {
        return res.status(401).send(err)
      } else {
        if (!!limit) {
          let data1 = []
          for (let i = 0; i < data.length; i++) {
            data1.push(data[i])
          }
          return res.status(200).send(data1)
        } else {
          return res.status(200).send(data)
        }
      }
    }
  )
})

router.get('/cart/:product_id', [authJwt.verifyToken], (req, res) => {
  const user_id = req.user.user_id
  const product_id = req.params.product_id
  db.query(
    `select cart.cart_id, cart.item_number, cart.created_at, product.*, db_image.image 
    from cart 
      LEFT JOIN product ON cart.cart_id = product.product_id 
      LEFT JOIN db_image ON db_image.product_id = product.product_id 
    where cart.user_id = ${user_id} and cart.product_id = ${product_id} AND cart.cart_order_status = 0`,
    (err, data) => {
      if (err) {
        return res.status(401).send(err)
      } else {
        return res.status(200).send(data)
      }
    }
  )
})

router.post('/cart', [authJwt.verifyToken], (req, res) => {
  const user_id = req.user.user_id
  const product_id = req.body.product_id
  const item_number = req.body.item_number
  db.query(
    `insert into cart (user_id, product_id, item_number, created_at) values (${user_id}, ${product_id}, ${item_number}, now())`,
    (err, result) => {
      if (err) {
        return res.status(401).send(err)
      } else {
        return res.status(201).send({
          message: 'inserted successfully'
        })
      }
    }
  )
})

router.patch('/cart/:id', [authJwt.verifyToken], (req, res) => {
  const cart_id = req.params.id
  const item_number = req.body.item_number
  db.query(
    `update cart set item_number = ${item_number} where cart_id = ${cart_id}`,
    (err, result) => {
      if (err) {
        return res.status(401).send(err)
      } else {
        return res.status(200).send({
          message: 'updated cart successfully'
        })
      }
    }
  )
})

router.delete('/cart/:id', [authJwt.verifyToken], (req, res) => {
  const cart_id = req.params.id
  db.query(`delete from cart where cart_id = ${cart_id}`, (err, result) => {
    if (err) {
      return res.status(401).send(err)
    } else {
      return res.status(200).send({
        message: 'deleted cart successfully'
      })
    }
  })
})

module.exports = router
