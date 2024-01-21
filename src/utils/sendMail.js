const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.SENDING_SERVICE,
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

exports.sendEmail = async (options) => {
  try {
    return await transporter.sendMail({
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      html: options.message,
    });
  } catch (error) {
    console.log(error);
  }
};
