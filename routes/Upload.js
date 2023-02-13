const express = require('express')
const router = express.Router()
const authJwt = require('../middleware/authJwt')
const db = require('../lib/db.js')
const cloudinary = require('../lib/cloudinary')
const upload = require('../lib/multer')

// upload product image
router.post(
  '/upload/product',
  upload.single('image'),
  [authJwt.verifyToken, authJwt.isStore],
  async (req, res) => {
    const product_id = req.body.product_id
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'image'
      })

      db.query(
        `select * from db_image where product_id = ${product_id};`,
        (err, result1) => {
          if (err) {
            return res.status(401).send(err)
          } else {
            if (result1.length === 0) {
              db.query(
                `insert into db_image (img_id, product_id, image, created_at, default_image) values ('${result.public_id}',${product_id}, '${result.url}', "${result.created_at}", 1);`,
                (err, result2) => {
                  if (err) {
                    return res.status(401).send(err)
                  } else {
                    return res.status(200).send({
                      message: 'inserted successfully'
                    })
                  }
                }
              )
            } else {
              db.query(
                `insert into db_image (img_id, product_id, image, created_at) values ('${result.public_id}',${product_id}, '${result.url}', "${result.created_at}");`,
                (err, result2) => {
                  if (err) {
                    return res.status(401).send(err)
                  } else {
                    return res.status(200).send({
                      message: 'inserted successfully'
                    })
                  }
                }
              )
            }
          }
        }
      )
    } catch (err) {
      console.error(err)
      res.status(500).json({ err: 'Something went wrong' })
    }
  }
)


// upload profile image
router.post(
  '/upload/profile',
  upload.single('image'),
  [authJwt.verifyToken],
  async (req, res) => {
    const user_id = req.user.user_id
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'image/profile'
      })
      db.query(
        `select * from db_image where user_id = ${user_id};`,
        async (err, result1) => {
          if (err) {
            return res.status(401).send(err)
          } else {
            if (result1.length === 0) {
              db.query(
                `insert into db_image (img_id, user_id, image, created_at, default_image) values ('${result.public_id}',${user_id}, '${result.url}', "${result.created_at}", 1);`,
                (err, result) => {
                  if (err) {
                    return res.status(401).send(err)
                  } else {
                    return res.status(200).send({
                      message: 'inserted successfully'
                    })
                  }
                }
              )
            } else {
              const result3 = await cloudinary.uploader.destroy(
                result1[0].img_id
              )
              db.query(
                `update db_image set img_id = '${result.public_id}', image = '${result.url}', created_at = "${result.created_at}" where user_id = ${user_id};`,
                (err, result) => {
                  if (err) {
                    return res.status(401).send(err)
                  } else {
                    return res.status(200).send({
                      message: 'inserted successfully'
                    })
                  }
                }
              )
            }
          }
        }
      )
    } catch (err) {
      console.error(err)
      res.status(500).json({ err: 'Something went wrong' })
    }
  }
)

// upload store image
router.post(
  '/upload/store/:store_id',
  upload.single('image'),
  [authJwt.verifyToken],
  async (req, res) => {
    const store_id = req.params.store_id
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'image/store'
      })
      db.query(
        `select * from db_image where store_id = ${store_id};`,
        async (err, result1) => {
          if (err) {
            return res.status(401).send(err)
          } else {
            if (result1.length === 0) {
              db.query(
                `insert into db_image (img_id, store_id, image, created_at, default_image) values ('${result.public_id}',${store_id}, '${result.url}', "${result.created_at}", 1);`,
                (err, result) => {
                  if (err) {
                    return res.status(401).send(err)
                  } else {
                    return res.status(200).send({
                      message: 'inserted successfully'
                    })
                  }
                }
              )
            } else {
              const result3 = await cloudinary.uploader.destroy(
                result1[0].img_id
              )
              db.query(
                `update db_image set img_id = '${result.public_id}', image = '${result.url}', created_at = "${result.created_at}" where store_id = ${store_id};`,
                (err, result) => {
                  if (err) {
                    return res.status(401).send(err)
                  } else {
                    return res.status(200).send({
                      message: 'inserted successfully'
                    })
                  }
                }
              )
            }
          }
        }
      )
    } catch (err) {
      console.error(err)
      res.status(500).json({ err: 'Something went wrong' })
    }
  }
)

// upload product type image
router.post(
  '/upload/product-type/:id',
  upload.single('image'),
  [authJwt.verifyToken],
  async (req, res) => {
    const ptype_id = req.params.id
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'image/ptype'
      })
      db.query(
        `select * from db_image where product_type_id = ${ptype_id};`,
        async (err, result1) => {
          if (err) {
            return res.status(401).send(err)
          } else {
            if (result1.length === 0) {
              db.query(
                `insert into db_image (img_id, product_type_id, image, created_at, default_image) values ('${result.public_id}',${ptype_id}, '${result.url}', "${result.created_at}", 1);`,
                (err, result) => {
                  if (err) {
                    return res.status(401).send(err)
                  } else {
                    return res.status(200).send({
                      message: 'inserted successfully'
                    })
                  }
                }
              )
            } else {
              const result3 = await cloudinary.uploader.destroy(
                result1[0].img_id
              )
              db.query(
                `update db_image set img_id = '${result.public_id}', image = '${result.url}', created_at = "${result.created_at}" where product_type_id = ${ptype_id};`,
                (err, result) => {
                  if (err) {
                    return res.status(401).send(err)
                  } else {
                    return res.status(200).send({
                      message: 'inserted successfully'
                    })
                  }
                }
              )
            }
          }
        }
      )
    } catch (err) {
      console.error(err)
      res.status(500).json({ err: 'Something went wrong' })
    }
  }
)

// get detail
router.post('/upload/product/detail', async (req, res) => {
  const id = req.body.id
  try {
    const result = await cloudinary.api.resource(id)
    console.log(result)
    res.status(200).json(result)
  } catch (err) {
    res.status(500).send({
      message: err
    })
  }
})

module.exports = router
