const express = require('express')
const fs = require('fs')
const router = express.Router()
const db = require('../lib/db.js')
const excelJS = require('exceljs')
const authJwt = require('../middleware/authJwt')
var moment = require('moment') // require
const cloudinary = require('../lib/cloudinary')
moment.locale('th')

router.get('/report', [authJwt.verifyToken, authJwt.isStore], (req, res) => {
  const user_id = req.user.user_id

  const workbook = new excelJS.Workbook()
  const worksheet = workbook.addWorksheet('Order Report')
  const path = './files'

  worksheet.columns = [
    { header: 'No.', key: 'no', width: 10 },
    { header: 'ชื่อสินค้า', key: 'product_name', width: 50 },
    { header: 'วันที่สั่งซื้อ', key: 'created_at', width: 40 },
    { header: 'สถานะคำสั่ง', key: 'status', width: 30 },
    { header: 'เหตุผล', key: 'cancel_detail', width: 40 },
    { header: 'จำนวนสินค้า', key: 'item', width: 15 },
    { header: 'ราคารวม', key: 'price', width: 15 },
    { header: 'ชื่อ', key: 'f_name', width: 30 },
    { header: 'นามสกุล', key: 'l_name', width: 30 },
    { header: 'สถานะ', key: 'ok_status', width: 30 }
  ]

  let counter = 1

  db.query(
    `select store_id from user_role where user_id = ${user_id} and store_id`,
    (err, data) => {
      if (err) {
        return res.status(401).send(err)
      } else {
        if (data.length === 0) {
          return res.status(404).send({
            message: 'store_id not found'
          })
        } else {
          const store_id = data[0].store_id
          db.query(
            `SELECT orders.*, user.f_name, user.l_name, order_detail.*, product.*, store.*
            FROM orders 
            LEFT JOIN order_detail ON order_detail.order_id = orders.order_id 
            LEFT JOIN product ON product.product_id = order_detail.product_id
            left JOIN user ON user.user_id = orders.user_id
            LEFT JOIN store ON store.store_id = product.store_id
            where product.store_id = ${store_id}`,
            async (err, data1) => {
              if (err) {
                return res.status(401).send(err)
              } else {
                data1.forEach(user => {
                  user.no = counter
                  user.created_at = moment(user.created_at)
                    .add(543, 'year')
                    .format('D MMMM YYYY HH:mm:ss')
                  if (
                    user.order_user_cancel === 1 &&
                    user.order_store_cancel === 0
                  ) {
                    user.status = 'ลูกค้ายกเลิก'
                    user.cancel_detail = user.order_cancel_detail
                  } else if (
                    user.order_user_cancel === 0 &&
                    user.order_store_cancel === 1
                  ) {
                    user.status = 'ร้านค้ายกเลิก'
                    user.cancel_detail = user.order_cancel_detail
                  } else {
                    user.status = 'กำลังดำเนินการ'
                    user.item = user.item_number
                    user.price = user.order_price
                    user.cancel_detail = ''
                    if (user.order_status === 0) {
                      user.ok_status = 'รอยืนยัน'
                    } else if (user.order_status === 1) {
                      user.ok_status = 'กำลังจัดส่งสินค้า'
                    } else if (user.order_status === 2) {
                      user.ok_status = 'กำลังส่งสินค้า'
                    } else {
                      user.ok_status = 'คำสั่งสินค้าสำเร็จ'
                    }
                  }
                  worksheet.addRow(user)
                  counter++
                })
                worksheet.getRow(1).eachCell(cell => {
                  cell.font = { bold: true }
                })

                try {
                  const data = workbook.xlsx
                    .writeFile(`${path}/users_${user_id}.xlsx`)
                    .then(() => {
                      res.send({
                        status: 'success',
                        message: 'file successfully downloaded',
                        path: `${path}/users_${user_id}.xlsx`
                      })
                    })
                } catch (err) {
                  res.send({
                    status: 'error',
                    message: 'Something went wrong'
                  })
                }
              }
            }
          )
        }
      }
    }
  )
})

router.get('/download/files/:file', (req, res) => {
  const filePath = `./files/${req.params.file}`

  fs.readFile(filePath, (err, file) => {
    if (err) {
      console.log(err)
      return res.status(500).send('Could not download file')
    }

    res.send(file)
  })
})

module.exports = router
