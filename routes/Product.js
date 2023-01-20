const express = require('express')
const router = express.Router()
const authJwt = require('../middleware/authJwt')
const db = require('../lib/db.js')

// search product
router.get('/product/search', (req, res) => {
  const name = req.query.name
  const store_id = req.query.store_id
  db.query(
    `select * from product where product_name like '%${name}%' or store_id like '%${store_id}';`,
    (err, data) => {
      if (err) {
        return res.status(401).send({
          message: err.message
        })
      } else {
        return res.status(200).send({
          data,
          total: data.length
        })
      }
    }
  )
})

// get Product All
router.get('/product', (req, res) => {
  db.query(
    `select product.*, db_image.image from product LEFT JOIN db_image ON db_image.product_id = product.product_id;`,
    (err, data) => {
      if (err) {
        return res.status(401).send({
          message: err.message
        })
      } else {
        return res.status(200).json({
          data: data,
          total: data.length
        })
      }
    }
  )
})

// create Product
router.post('/product', [authJwt.verifyToken, authJwt.isStore], (req, res) => {
  const user_id = req.user.user_id
  const product_name = req.body.product_name
  const product_price = req.body.product_price
  const product_number = req.body.product_number
  let store_id = 0
  db.query(
    `select * from user_role where user_id = ${user_id} and role_id = 3;`,
    (err, data) => {
      if (err) {
        return res.status(401).send({
          message: err.message
        })
      } else {
        store_id = data[0].store_id
        db.query(
          `insert into product (product_name, product_price, store_id, product_number) values ('${product_name}', '${product_price}', ${store_id}, '${product_number}');`,
          (err, result) => {
            if (err) {
              return res.status(401).send({
                message: err.message,
                err
              })
            } else {
              return res.status(201).send({
                message: 'insert successfully',
                product_id: result.insertId
              })
            }
          }
        )
      }
    }
  )
})

// create Product Detail
router.post(
  '/product/detail/:product_id',
  [authJwt.verifyToken, authJwt.isStore],
  (req, res) => {
    const product_id = req.params.product_id
    const py_id = req.body.product_type_id
    const pd_description = req.body.product_detail
    db.query(
      `select * from product where product_id = ${product_id}`,
      (err, data) => {
        if (err) {
          return res.status(401).send({
            message: err.message
          })
        } else {
          if (data.length === 0) {
            return res.status(404).send({
              message: 'Product ID not found'
            })
          } else {
            db.query(
              `insert into product_detail (product_id, py_id, pd_description) values (${product_id}, ${py_id}, '${pd_description}');`,
              (err, data) => {
                if (err) {
                  return res.status(401).send({
                    message: err.message
                  })
                } else {
                  return res.status(201).send({
                    message: 'Create Product Detail successfully'
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

// Update Product
router.patch(
  `/product/:product_id`,
  [authJwt.verifyToken, authJwt.isStore],
  (req, res) => {
    const product_id = req.params.product_id
    const product_name = req.body.product_name
    const product_price = req.body.product_price
    const product_number = req.body.product_number
    db.query(
      `select * from product where product_id = ${product_id};`,
      (err, data) => {
        if (err) {
          return res.status(401).send({
            message: err.message
          })
        } else {
          if (data.length === 0) {
            return res.status(404).send({
              message: 'Product ID not found'
            })
          } else {
            db.query(
              `update product set product_name = '${product_name}', product_price = '${product_price}', product_number = ${product_number} where product_id = ${product_id}`,
              (err, result) => {
                if (err) {
                  return res.status(401).send({
                    message: err.message
                  })
                } else {
                  return res.status(200).send({
                    message: 'Updated successfully'
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

// Update Product Detail
router.patch(
  '/product/detail/:product_id',
  [authJwt.verifyToken, authJwt.isStore],
  (req, res) => {
    const product_id = req.params.product_id
    const py_id = req.body.product_type_id
    const pd_description = req.body.product_detail
    db.query(
      `select * from product where product_id = ${product_id};`,
      (err, data) => {
        if (err) {
          return res.status(401).send({
            message: err.message
          })
        } else {
          if (data.length === 0) {
            return res.status(404).send({
              message: 'Product ID not found'
            })
          } else {
            db.query(
              `update product_detail set py_id = ${py_id}, pd_description = '${pd_description}' where product_id = ${product_id};`,
              (err, result) => {
                if (err) {
                  return res.status(401).send({
                    message: err.message
                  })
                } else {
                  return res.status(200).send({
                    message: 'Updated successfully'
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
