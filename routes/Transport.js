const express = require('express')
const router = express.Router()
const authJwt = require('../middleware/authJwt')
const db = require('../lib/db.js')

router.get('/transport', (req, res) => {
    db.query(`select * from transport`, (err, data) => {
        if (err) {
            return res.status(401).send(err);
        } else {
            return res.status(200).send(data);
        }
    })
})

router.post('/transport', [authJwt.verifyToken, authJwt.isAdmin], (req, res) => {
    const transport_name = req.body.transport_name

    db.query(`insert into transport (transport_name) values ('${transport_name}')`, (err, result) => {
        if (err) {
            return res.status(401).send(err);
        } else {
            return res.status(201).send({
                message: 'insert successfully'
            })
        }
    })
})

module.exports = router