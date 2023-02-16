const mysql = require('mysql2')
require('dotenv').config()

// const connection = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     database: process.env.DB_NAME,
//     password: process.env.DB_PASSWORD,
//     port: process.env.DB_PORT,
// });

const connection = mysql.createConnection(process.env.DATABASE_URL)
console.log('Connected to PlanetScale!')
connection.connect(err => {
  if (err) {
    console.error(err)
  } else {
    console.log('connection successful')
  }
})

module.exports = connection
