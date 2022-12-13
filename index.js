const express = require('express');
const app = express();
require('dotenv').config()
const cors = require('cors');
const bodyParser = require('body-parser');

const port = process.env.PORT || 3000

app.use(bodyParser.json({ limit: "50mb" }));

app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: false,
    parameterLimit: 50000,
  })
);
app.use(
    cors({
        origin: "*",
        method: ["GET", "POST", "PATCH", "DELETE"],
    })
)
app.get('/', (req, res) => {
    res.send('Hello, world')
})

const auth = require("./routes/Auth.js");
const role = require("./routes/Role");
const user_add = require("./routes/UserAdd");
const otp = require("./routes/Otp")
app.use("/api/auth", auth);
app.use("/api", [role, user_add, otp]);

app.listen(port, () => {
    console.log('server on port http://localhost:' + port);
})