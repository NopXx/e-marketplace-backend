const express = require('express')
const router = express.Router()
const authJwt = require('../middleware/authJwt')
const db = require('../lib/db.js')

// order by user
router.get('/order', [authJwt.verifyToken], (req, res) => {
  const user_id = req.user.user_id
  db.query(
    `SELECT ecom.order.*, order_detail.*, product.*, store.*, db_image.image, 
    (SELECT db_image.image FROM db_image WHERE db_image.store_id = product.store_id) as store_image
    FROM ecom.order 
    LEFT JOIN order_detail ON order_detail.order_id = ecom.order.order_id 
    LEFT JOIN product ON product.product_id = order_detail.product_id
    LEFT JOIN store ON store.store_id = product.store_id
    LEFT JOIN db_image ON db_image.product_id = product.product_id
    where ecom.order.user_id = ${user_id} AND db_image.default_image = 1`,
    (err, data) => {
      if (err) {
        return res.status(401).send(err)
      } else {
        return res.status(200).send(data)
      }
    }
  )
})

router.get('/order/:order_id', [authJwt.verifyToken], (req, res) => {
  const user_id = req.user.user_id
  const order_id = req.params.order_id
  db.query(
    `SELECT ecom.order.*, order_detail.*, product.*, store.*, db_image.image, transport.*, user_address.*
    FROM ecom.order 
    LEFT JOIN order_detail ON order_detail.order_id = ecom.order.order_id 
    LEFT JOIN product ON product.product_id = order_detail.product_id
    LEFT JOIN store ON store.store_id = product.store_id
    LEFT JOIN db_image ON db_image.product_id = product.product_id
    LEFT JOIN transport ON transport.transport_id = order_detail.transport_id
    LEFT JOIN user_address ON user_address.user_a_id = order_detail.user_a_id
    where ecom.order.order_id = ${order_id} and ecom.order.user_id = ${user_id} AND db_image.default_image = 1`,
    (err, data) => {
      if (err) {
        return res.status(401).send(err)
      } else {
        if (data.length > 0) {
          return res.status(200).send(data)
        } else {
          return res.status(404).send({
            message: 'Order not found'
          })
        }
      }
    }
  )
})

// order by store
router.get('/order/store/:id', [authJwt.verifyToken], (req, res) => {
  const store_id = req.params.id
  db.query(
    `SELECT ecom.order.*, order_detail.*, product.*, store.*, db_image.image, user_address.*
    FROM ecom.order 
    LEFT JOIN order_detail ON order_detail.order_id = ecom.order.order_id 
    LEFT JOIN product ON product.product_id = order_detail.product_id
    LEFT JOIN store ON store.store_id = product.store_id
    LEFT JOIN db_image ON db_image.product_id = product.product_id
    LEFT JOIN user_address ON user_address.user_a_id = order_detail.user_a_id
    where product.store_id = ${store_id} AND db_image.default_image = 1`,
    (err, data) => {
      if (err) {
        return res.status(401).send(err)
      } else {
        return res.status(200).send(data)
      }
    }
  )
})

router.get(
  '/order/store/detail/:order_id',
  [authJwt.verifyToken, authJwt.isStore],
  (req, res) => {
    const order_id = req.params.order_id
    db.query(
      `SELECT ecom.order.*, order_detail.*, product.*, store.*, db_image.image, transport.*, user_address.*
    FROM ecom.order 
    LEFT JOIN order_detail ON order_detail.order_id = ecom.order.order_id 
    LEFT JOIN product ON product.product_id = order_detail.product_id
    LEFT JOIN store ON store.store_id = product.store_id
    LEFT JOIN db_image ON db_image.product_id = product.product_id
    LEFT JOIN transport ON transport.transport_id = order_detail.transport_id
    LEFT JOIN user_address ON user_address.user_a_id = order_detail.user_a_id
    where ecom.order.order_id = ${order_id} AND db_image.default_image = 1`,
      (err, data) => {
        if (err) {
          return res.status(401).send(err)
        } else {
          if (data.length > 0) {
            return res.status(200).send(data)
          } else {
            return res.status(404).send({
              message: 'Order not found'
            })
          }
        }
      }
    )
  }
)

// create order by user
router.post('/order', [authJwt.verifyToken], (req, res) => {
  const user_id = req.user.user_id
  const cart_id = req.body.cart_id
  const user_a_id = req.body.user_address_id
  db.query(
    `select cart.*, product.* 
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
                const update_product_item =
                  data[0].product_number - data[0].item_number
                const product_id = data[0].product_id
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
                            db.query(
                              `update product set product_number = ${update_product_item} where product_id = ${product_id}`,
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
          )
        }
      }
    }
  )
})

// update order by user
router.patch(
  '/order/user/cancel-order/:id',
  [authJwt.verifyToken],
  (req, res) => {
    const order_id = req.params.id
    const cancel_order_detail = req.body.cancel_order_detail
    db.query(
      `select ecom.order.*, order_detail.*, product.* from ecom.order 
      LEFT JOIN order_detail ON order_detail.order_id = ecom.order.order_id
        LEFT JOIN product ON order_detail.product_id = product.product_id
        where ecom.order.order_id = ${order_id};`,
      (err, data) => {
        if (err) {
          return res.status(401).send(err)
        } else {
          if (data.length === 0) {
            return res.status(404).send({
              message: 'Order not found'
            })
          } else {
            db.query(
              `update ecom.order set order_user_cancel = 1 where order_id = ${order_id}`,
              (err, result) => {
                if (err) {
                  return res.status(401).send(err)
                } else {
                  db.query(
                    `update ecom.order_detail set order_cancel_detail = '${cancel_order_detail}' where order_id = ${order_id}`,
                    (err, result) => {
                      if (err) {
                        return res.status(401).send(err)
                      } else {
                        const update_product_item =
                          data[0].product_number + data[0].item_number
                        const product_id = data[0].product_id
                        db.query(
                          `update product set product_number = ${update_product_item} where product_id = ${product_id}`,
                          (err, result) => {
                            if (err) {
                              return res.status(401).send(err)
                            } else {
                              return res.status(200).send({
                                message: 'Order Cancel successfully'
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
  }
)

// update order by store
router.patch(
  '/order/store/confirm-order/:id',
  [authJwt.verifyToken],
  (req, res) => {
    const order_id = req.params.id
    db.query(
      `select * from ecom.order where order_id = ${order_id}`,
      (err, data) => {
        if (err) {
          return res.status(401).send(err)
        } else {
          if (data.length === 0) {
            return res.status(404).send({
              message: 'Order not found'
            })
          } else {
            let status = 0
            if (data[0].order_status === 0) {
              status = 1
            } else if (data[0].order_status === 1) {
              status = 2
            } else {
              status = 3
            }
            db.query(
              `update ecom.order set order_status = ${status} where order_id = ${order_id}`,
              (err, result) => {
                if (err) {
                  return res.status(401).send(err)
                } else {
                  return res.status(200).send({
                    message: 'Order Confirm successfully'
                  })
                }
              }
            )
          }
        }
      }
    )
  }
)

router.patch(
  '/order/store/cancel-order/:id',
  [authJwt.verifyToken, authJwt.isStore],
  (req, res) => {
    const order_id = req.params.id
    const cancel_order_detail = req.body.cancel_order_detail
    db.query(
      `select ecom.order.*, order_detail.*, product.* from ecom.order 
      LEFT JOIN order_detail ON order_detail.order_id = ecom.order.order_id
        LEFT JOIN product ON order_detail.product_id = product.product_id
        where ecom.order.order_id = ${order_id};`,
      (err, data) => {
        if (err) {
          return res.status(401).send(err)
        } else {
          if (data.length === 0) {
            return res.status(404).send({
              message: 'Order not found'
            })
          } else {
            db.query(
              `update ecom.order set order_store_cancel = 1 where order_id = ${order_id}`,
              (err, result) => {
                if (err) {
                  return res.status(401).send(err)
                } else {
                  db.query(
                    `update ecom.order_detail set order_cancel_detail = '${cancel_order_detail}' where order_id = ${order_id}`,
                    (err, result) => {
                      if (err) {
                        return res.status(401).send(err)
                      } else {
                        const update_product_item =
                          data[0].product_number + data[0].item_number
                        const product_id = data[0].product_id
                        db.query(
                          `update product set product_number = ${update_product_item} where product_id = ${product_id}`,
                          (err, result) => {
                            if (err) {
                              return res.status(401).send(err)
                            } else {
                              return res.status(200).send({
                                message: 'Order Cancel successfully'
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
  }
)

router.patch(
  '/order/store/order-tag/:id',
  [authJwt.verifyToken, authJwt.isStore],
  (req, res) => {
    const order_id = req.params.id
    const transport_id = req.body.transport_id
    const order_tag = req.body.order_tag
    db.query(
      `select * from ecom.order where order_id = ${order_id}`,
      (err, data) => {
        if (err) {
          return res.status(401).send(err)
        } else {
          if (data.length === 0) {
            return res.status(404).send({
              message: 'Order not found'
            })
          } else {
            db.query(
              `update ecom.order_detail set transport_id = '${transport_id}', order_tag = '${order_tag}' where order_id = ${order_id}`,
              (err, result) => {
                if (err) {
                  return res.status(401).send(err)
                } else {
                  return res.status(200).send({
                    message: 'Update Order successfully'
                  })
                }
              }
            )
          }
        }
      }
    )
  }
)

module.exports = router
