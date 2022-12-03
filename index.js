const express = require('express');
const app = express();
require('dotenv').config()
const cors = require('cors');
const bodyParser = require('body-parser');

const port = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send('Hello, world')
})

app.get('/api', (req, res) => {
    res.send('first api')
})

app.listen(port, () => {
    console.log('server on port http://localhost:' + port);
})