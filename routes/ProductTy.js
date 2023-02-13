const express = require('express')
const router = express.Router()
const authJwt = require('../middleware/authJwt')
const db = require('../lib/db.js')

// get Product Type
router.get('/product-type', (req, res) => {
  db.query(`select product_type.*, db_image.image from product_type 
  LEFT JOIN db_image ON db_image.product_type_id = product_type.product_type_id;`, (err, data) => {
    if (err) {
      return res.status(401).send(err)
    } else {
      return res.status(200).send(data)
    }
  })
})

// get Product Type by id
router.get('/product-type/:id',[authJwt.verifyToken, authJwt.isAdmin], (req, res) => {
  db.query(`select product_type.*, db_image.image from product_type 
  LEFT JOIN db_image ON db_image.product_type_id = product_type.product_type_id
  where product_type.product_type_id = ${req.params.id};`, (err, data) => {
    if (err) {
      return res.status(401).send(err)
    } else {
      return res.status(200).send(data)
    }
  })
})

// search Product Type
router.get('/product-type/search', (req, res) => {
  const name = req.query.name
  db.query(
    `select * from product_type where product_type_name like '%${name}%';`,
    (err, data) => {
      if (err) {
        return res.status(401).send(err)
      } else {
        return res.status(200).send(data)
      }
    }
  )
})

// create Product Type
router.post(
  '/product-type',
  [authJwt.verifyToken, authJwt.isAdmin],
  (req, res) => {
    const name = req.body.name
    db.query(
      `select * from product_type where product_type_name = '${name}';`,
      (err, data) => {
        if (err) {
          return res.status(401).send(err)
        } else {
          if (data.length > 0) {
            return res.status(403).send({
              message: 'Product type is already'
            })
          } else {
            db.query(
              `insert into product_type (product_type_name) values ('${name}');`,
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
          }
        }
      }
    )
  }
)

// update Product type
router.patch(
  '/product-type/:id',
  [authJwt.verifyToken, authJwt.isAdmin],
  (req, res) => {
    const id = req.params.id
    const name = req.body.name
    console.log(req.body)
    db.query(
      `select * from product_type where product_type_id = ${id};`,
      (err, data) => {
        if (err) {
          return res.status(401).send(err)
        } else {
          if (data.length === 0) {
            return res.status(404).send({
              message: 'Product type id not found'
            })
          } else {
            db.query(
              `update product_type set product_type_name = '${name}' where product_type_id = ${id};`,
              (err, result) => {
                if (err) {
                  return res.status(401).send(err)
                } else {
                  return res.status(200).send({
                    message: 'Product type updated successfully'
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
