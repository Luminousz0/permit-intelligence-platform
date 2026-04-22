import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter;

export async function initEmail() {
  const testAccount = await nodemailer.createTestAccount();
  
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
  console.log('📧 Email service ready (Ethereal test account)');
}

export async function sendReportEmail(
  to: string, 
  subject: string, 
  html: string, 
  attachments?: any[]
): Promise<string> {
  if (!transporter) await initEmail();
  
  const info = await transporter.sendMail({
    from: '"Permit Intelligence" <noreply@permitintelligence.nl>',
    to,
    subject,
    html,
    attachments
  });
  
  console.log('📧 Email sent:', info.messageId);
  console.log('   Preview URL:', nodemailer.getTestMessageUrl(info));
  return nodemailer.getTestMessageUrl(info) as string;
}
