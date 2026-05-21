import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendResetEmail = async (email, resetUrl) => {
  await resend.emails.send({
    from: 'AntiSocial <onboarding@resend.dev>',
    to: email,
    subject: 'Reset your AntiSocial password',
    html: `
      <div style="font-family:sans-serif;max-width:500px;
                  margin:0 auto;padding:40px">
        <h1 style="color:#6366f1">AntiSocial</h1>
        <h2>Reset your password</h2>
        <p>Click below to reset. Link expires in 1 hour.</p>
        <a href="${resetUrl}" 
           style="background:#6366f1;color:white;
                  padding:12px 24px;border-radius:50px;
                  text-decoration:none;display:inline-block;
                  margin:16px 0">
          Reset Password
        </a>
        <p style="color:#999;font-size:12px">
          If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  });
};
