module.exports = {
  ReqOTP: (req, res, next) => {
    if (!req.body.tel && !req.body.user_address_id) {
      return res.status(400).send({
        message: 'Enter Tel and user_address_id'
      })
    } else if (!req.body.tel) {
      return res.status(400).send({
        message: 'Enter Tel'
      })
    } else if (!req.body.user_address_id) {
      return res.status(400).send({
        message: 'Enter user_address_id'
      })
    } else {
      next()
    }
  },
  verifyOTP: (req, res, next) => {
    if (!req.body.otp && !req.body.user_address_id) {
      return res.status(400).send({
        message: 'Enter OTP and user_address_id'
      })
    } else if (!req.body.otp) {
      return res.status(400).send({
        message: 'Enter OTP'
      })
    } else if (!req.body.user_address_id) {
      return res.status(400).send({
        message: 'Enter user_address_id'
      })
    } else {
      next()
    }
  }
}
