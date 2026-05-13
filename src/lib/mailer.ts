import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const FROM = process.env.SMTP_FROM || `LaptopStore <${process.env.SMTP_USER}>`;

function otpTemplate(otp: string, lang: 'ar' | 'en' = 'ar') {
  return `
<!DOCTYPE html>
<html dir="${lang === 'ar' ? 'rtl' : 'ltr'}" lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1d4ed8, #3b82f6); padding: 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; }
    .body { padding: 32px; text-align: center; }
    .otp { font-size: 48px; font-weight: 900; color: #1d4ed8; letter-spacing: 12px; margin: 24px 0; }
    .note { color: #6b7280; font-size: 14px; }
    .footer { background: #f9fafb; padding: 16px; text-align: center; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🖥️ LaptopStore</h1>
    </div>
    <div class="body">
      <p style="color:#374151;font-size:18px;">${lang === 'ar' ? 'كود التحقق الخاص بك' : 'Your Verification Code'}</p>
      <div class="otp">${otp}</div>
      <p class="note">${lang === 'ar' ? 'صالح لمدة 10 دقائق. لا تشاركه مع أحد.' : 'Valid for 10 minutes. Do not share it with anyone.'}</p>
    </div>
    <div class="footer">© 2024 LaptopStore. ${lang === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}</div>
  </div>
</body>
</html>`;
}

function resetTemplate(link: string, lang: 'ar' | 'en' = 'ar') {
  return `
<!DOCTYPE html>
<html dir="${lang === 'ar' ? 'rtl' : 'ltr'}" lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1d4ed8, #3b82f6); padding: 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; }
    .body { padding: 32px; text-align: center; }
    .btn { display: inline-block; background: #1d4ed8; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600; margin: 24px 0; }
    .note { color: #6b7280; font-size: 13px; }
    .footer { background: #f9fafb; padding: 16px; text-align: center; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🖥️ LaptopStore</h1>
    </div>
    <div class="body">
      <p style="color:#374151;font-size:18px;">${lang === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Your Password'}</p>
      <a href="${link}" class="btn">${lang === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}</a>
      <p class="note">${lang === 'ar' ? 'الرابط صالح لمدة 30 دقيقة.' : 'Link valid for 30 minutes.'}</p>
    </div>
    <div class="footer">© 2024 LaptopStore.</div>
  </div>
</body>
</html>`;
}

export async function sendOTPEmail(email: string, otp: string, lang: 'ar' | 'en' = 'ar') {
  return transporter.sendMail({
    from: FROM,
    to: email,
    subject: lang === 'ar' ? 'كود التحقق - LaptopStore' : 'Verification Code - LaptopStore',
    html: otpTemplate(otp, lang),
  });
}

export async function sendPasswordResetEmail(email: string, link: string, lang: 'ar' | 'en' = 'ar') {
  return transporter.sendMail({
    from: FROM,
    to: email,
    subject: lang === 'ar' ? 'إعادة تعيين كلمة المرور - LaptopStore' : 'Reset Password - LaptopStore',
    html: resetTemplate(link, lang),
  });
}

export async function sendOrderConfirmationEmail(
  email: string,
  orderId: string,
  lang: 'ar' | 'en' = 'ar'
) {
  return transporter.sendMail({
    from: FROM,
    to: email,
    subject: lang === 'ar' ? `تأكيد الطلب #${orderId}` : `Order Confirmed #${orderId}`,
    html: `<p>${lang === 'ar' ? `تم استلام طلبك رقم ${orderId} بنجاح.` : `Your order #${orderId} has been received successfully.`}</p>`,
  });
}
