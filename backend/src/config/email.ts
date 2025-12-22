import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'RenewableZmart <noreply@renewablezmart.com>';

if (!SENDGRID_API_KEY) {
  console.log('⚠️ SendGrid not configured - please set SENDGRID_API_KEY in backend/.env');
  console.log('📖 You can get an API key from https://app.sendgrid.com/settings/api_keys');
} else {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('✉️ SendGrid initialized and ready to send messages');
}

export { sgMail, EMAIL_FROM };
