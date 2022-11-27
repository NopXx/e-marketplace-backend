const express = require('express');
const app = express();

const port = 3000

app.get('/', (req, res) => {
    res.send('Hello, world')
})

app.get('/api', (req, res) => {
    res.send('first api')
})

app.listen(port, () => {
    console.log('server on port http://localhost:' + port);
})
    