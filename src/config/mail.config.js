import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER, // Email của bạn (vd: moimovies@gmail.com)
    pass: process.env.MAIL_PASS, // Mật khẩu ứng dụng (App Password)
  },
});

export const sendResetEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: '"MoiMovies Security" <no-reply@moimovies.com>',
    to: toEmail,
    subject: "Mã xác nhận khôi phục mật khẩu",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Yêu cầu đặt lại mật khẩu</h2>
        <p>Mã xác nhận (OTP) của bạn là:</p>
        <h1 style="color: #e50914; letter-spacing: 5px;">${otp}</h1>
        <p>Mã này sẽ hết hạn sau 10 phút.</p>
        <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
      </div>
    `,
  };
  return transporter.sendMail(mailOptions);
};