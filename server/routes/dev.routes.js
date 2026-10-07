const router = require('express').Router();
const nodemailer = require('nodemailer');
const transport = require('../config/mailer');

router.post('/test-mail', async (req, res) => {
  try {
    const info = await transport.sendMail({
      from: process.env.MAIL_FROM,
      to: req.body.to,
      subject: req.body.subject || 'smtp test',
      text: req.body.body || 'it works',
    });
    res.json({ messageId: info.messageId, preview: nodemailer.getTestMessageUrl(info) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;