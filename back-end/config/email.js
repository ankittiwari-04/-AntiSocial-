import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetEmail = async (email, resetUrl) => {
  const mailOptions = {
    from: `"AntiSocial" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset your AntiSocial password',
    html: `
      <div style="font-family: Inter, sans-serif; 
                  max-width: 500px; margin: 0 auto;
                  background: #0a0a0f; color: white;
                  padding: 40px; border-radius: 16px;">
        <h1 style="background: linear-gradient(135deg, #6366f1, #a855f7);
                   -webkit-background-clip: text;
                   -webkit-text-fill-color: transparent;
                   font-size: 28px; margin-bottom: 8px;">
          AntiSocial
        </h1>
        <h2 style="color: white; margin-bottom: 16px;">
          Reset your password
        </h2>
        <p style="color: #a1a1aa; margin-bottom: 24px;">
          Click the button below to reset your password.
          This link expires in 1 hour.
        </p>
        <a href="${resetUrl}"
           style="background: linear-gradient(135deg, #6366f1, #a855f7);
                  color: white; padding: 14px 28px;
                  border-radius: 50px; text-decoration: none;
                  font-weight: 600; display: inline-block;">
          Reset Password
        </a>
        <p style="color: #52525b; margin-top: 24px; font-size: 12px;">
          If you didn't request this, ignore this email.
          Your password won't change.
        </p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

export default transporter;
