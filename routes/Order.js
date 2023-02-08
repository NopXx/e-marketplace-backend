const express = require('express')
const router = express.Router()
const authJwt = require('../middleware/authJwt')
const db = require('../lib/db.js')

router.get('/order', [authJwt.verifyToken], (req, res) => {
  const user_id = req.user.user_id
  db.query(
    `SELECT order.*, order_detail.* 
    FROM order 
    LEFT JOIN order_detail ON order_detail.order_id = order.order_id 
    where order.user_id = ${user_id}`,
    (err, data) => {
      if (err) {
        return res.status(401).send(err)
      } else {
        return res.status(200).send(data)
      }
    }
  )
})

router.post('/order', [authJwt.verifyToken], (req, res) => {
  const user_id = req.user.user_id
  const cart_id = req.body.cart_id
  const user_a_id = req.body.user_address_id

  db.query(
    `select cart.*, product.product_price 
  from cart 
  LEFT JOIN product ON cart.product_id = product.product_id 
  where cart_id = ${cart_id};`,
    (err, data) => {
      if (err) {
        return res.status(401).send(err)
      } else {
        if (data.length === 0) {
          return res.status(404).send({
            message: 'Data is empty'
          })
        } else {
          db.query(
            `INSERT INTO ecom.order (user_id, payment_status, created_at) VALUES (${user_id}, 0, now())`,
            (err, result) => {
              if (err) {
                return res.status(401).send(err)
              } else {
                const order_id = result.insertId
                const order_price = data[0].item_number * data[0].product_price
                db.query(
                  `INSERT INTO ecom.order_detail (order_id, product_id, item_number, user_a_id, order_price) VALUES (${order_id}, ${data[0].product_id}, ${data[0].item_number}, ${user_a_id}, '${order_price}')`,
                  (err, result) => {
                    if (err) {
                      return res.status(401).send(err)
                    } else {
                      db.query(
                        `update cart set cart_order_status = 1 where cart_id = ${cart_id}`,
                        (err, result) => {
                          if (err) {
                            return res.status(401).send(err)
                          } else {
                            return res.status(201).send({
                              message: 'insert successfully'
                            })
                          }
                        }
                      )
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
})

module.exports = router
