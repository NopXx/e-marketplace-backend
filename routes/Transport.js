const express = require('express')
const router = express.Router()
const authJwt = require('../middleware/authJwt')
const db = require('../lib/db.js')

router.get('/transport', (req, res) => {
  db.query(
    `SELECT transport.*, db_image.image FROM transport LEFT JOIN db_image ON db_image.transport_id = transport.transport_id`,
    (err, data) => {
      if (err) {
        return res.status(401).send(err)
      } else {
        return res.status(200).send(data)
      }
    }
  )
})
// get by id
router.get(
  '/transport/:id',
  [authJwt.verifyToken, authJwt.isAdmin],
  (req, res) => {
    db.query(
      `SELECT transport.*, db_image.image FROM transport 
      LEFT JOIN db_image ON db_image.transport_id = transport.transport_id 
      where transport.transport_id = ${req.params.id}`,
      (err, data) => {
        if (err) {
          return res.status(401).send(err)
        } else {
          return res.status(200).send(data)
        }
      }
    )
  }
)

// create transport
router.post(
  '/transport',
  [authJwt.verifyToken, authJwt.isAdmin],
  (req, res) => {
    const transport_name = req.body.name

    db.query(
      `insert into transport (transport_name) values ('${transport_name}')`,
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
)

router.patch(
  '/transport/:id',
  [authJwt.verifyToken, authJwt.isAdmin],
  (req, res) => {
    const transport_name = req.body.name

    db.query(
      `update transport set transport_name = '${transport_name}' where transport_id =${req.params.id}`,
      (err, result) => {
        if (err) {
          return res.status(401).send(err)
        } else {
          return res.status(200).send({
            message: 'update successfully'
          })
        }
      }
    )
  }
)

module.exports = router
