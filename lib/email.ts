import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import QRCode from 'qrcode';

interface GuestDetails {
  name: string;
  email: string;
  dietaryPref: 'veg' | 'non_veg';
  alcoholPref: 'drinking' | 'not_drinking';
  travelMode?: string;
  registrationId: string;
}

async function createTransporter() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  const accessTokenResponse = await oauth2Client.getAccessToken();
  const accessToken = accessTokenResponse.token;

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_FROM_ADDRESS,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: accessToken!,
    },
  });
}

async function generateQRCode(id: string): Promise<string> {
  // QR code contains only the 6-character pass code ID — zero PII
  const qrData = JSON.stringify({ id });
  return QRCode.toDataURL(qrData, {
    errorCorrectionLevel: 'H',
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' },
  });
}

const travelModeLabels: Record<string, string> = {
  carpooling: 'Car Pooling with Non-Drinking Driver',
  public_transport: 'Public Transport',
  cab: 'Cab Service (Ola / Uber / Rapido)',
  relative_pickup: 'Relative / Friend Pickup',
};

export async function sendConfirmationEmail(guest: GuestDetails): Promise<void> {
  const qrDataUrl = await generateQRCode(guest.registrationId);
  // Extract base64 from data URL for inline embedding
  const base64QR = qrDataUrl.split(',')[1];

  const dietLabel = guest.dietaryPref === 'veg' ? '🥦 Vegetarian' : '🍗 Non-Vegetarian';
  const drinkLabel = guest.alcoholPref === 'drinking' ? '🍹 Drinking' : '🥤 Not Drinking';
  const travelLabel =
    guest.alcoholPref === 'drinking' && guest.travelMode
      ? travelModeLabels[guest.travelMode] || guest.travelMode
      : '—';

  const eventDate = process.env.EVENT_DATE || 'Date to be announced';
  const eventVenue = process.env.EVENT_VENUE || 'Venue to be announced';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Entry Pass — Kyndryl Year End Celebrations 2026</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; background: #F4F4F4; color: #000; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: #000; padding: 24px 32px; }
    .logo { color: #FF0000; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .event-title { color: #fff; font-size: 14px; margin-top: 4px; letter-spacing: 0.5px; }
    .hero { background: #FF0000; padding: 32px; text-align: center; color: #fff; }
    .hero h1 { font-size: 26px; font-weight: 700; margin-bottom: 8px; }
    .hero p { font-size: 15px; opacity: 0.9; }
    .body { padding: 32px; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
    .body p { font-size: 14px; color: #393939; line-height: 1.6; margin-bottom: 16px; }
    .event-info { background: #F4F4F4; border-left: 4px solid #FF0000; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0; }
    .event-info p { margin: 0; }
    .event-info strong { font-size: 15px; }
    .summary-table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    .summary-table th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6F6F6F; padding: 8px 12px; background: #F4F4F4; border-bottom: 1px solid #E0E0E0; }
    .summary-table td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #E0E0E0; }
    .qr-section { text-align: center; padding: 24px 0; border-top: 1px solid #E0E0E0; border-bottom: 1px solid #E0E0E0; margin: 24px 0; }
    .qr-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6F6F6F; margin-bottom: 16px; }
    .qr-section img { border: 2px solid #E0E0E0; border-radius: 8px; padding: 8px; background: #fff; }
    .pass-code-badge { display: inline-block; margin-top: 12px; padding: 6px 16px; background-color: #F4F4F4; border: 1px dashed #000; border-radius: 4px; font-family: monospace; font-size: 18px; font-weight: bold; letter-spacing: 3px; color: #000; }
    .qr-instructions { font-size: 13px; color: #6F6F6F; margin-top: 12px; }
    .warning-box { background: #FFF3CD; border: 1px solid #F1C21B; border-radius: 8px; padding: 16px; margin: 24px 0; font-size: 13px; }
    .rules-link { display: inline-block; background: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-size: 14px; font-weight: 600; margin-top: 16px; }
    .footer { background: #F4F4F4; padding: 24px 32px; font-size: 12px; color: #6F6F6F; }
    .footer a { color: #FF0000; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">Kyndryl</div>
      <div class="event-title">YEAR END CELEBRATIONS 2026</div>
    </div>

    <div class="hero">
      <h1>🎉 You're on the list!</h1>
      <p>Your registration has been confirmed</p>
    </div>

    <div class="body">
      <p class="greeting">Hi ${guest.name},</p>
      <p>Thank you for registering for the Kyndryl Year End Celebrations 2026! We're excited to celebrate the year with you.</p>

      <div class="event-info">
        <p><strong>📅 ${eventDate}</strong></p>
        <p style="margin-top:6px; font-size:14px;">📍 ${eventVenue}</p>
      </div>

      <table class="summary-table">
        <thead>
          <tr><th>Your Registration Details</th><th></th></tr>
        </thead>
        <tbody>
          <tr><td style="color:#6F6F6F;">Dietary Preference</td><td>${dietLabel}</td></tr>
          <tr><td style="color:#6F6F6F;">Alcohol Preference</td><td>${drinkLabel}</td></tr>
          ${guest.alcoholPref === 'drinking' ? `<tr><td style="color:#6F6F6F;">Travel Mode</td><td>${travelLabel}</td></tr>` : ''}
        </tbody>
      </table>

      <div class="qr-section">
        <p class="qr-label">Your Entry Pass — Show this at the gate</p>
        <img src="cid:qrcode" alt="QR Entry Pass" width="240" height="240" />
        <div>
          <span class="pass-code-badge">${guest.registrationId}</span>
        </div>
        <p class="qr-instructions">Screenshot this email or show this 6-character pass code at the gate.<br/>Your QR code or pass code will be verified at entry.</p>
      </div>

      ${
        guest.alcoholPref === 'drinking'
          ? `<div class="warning-box">
          🚨 <strong>Reminder:</strong> You have confirmed that you will be drinking at the event.
          Please ensure you travel by <strong>${travelLabel}</strong> as committed.
          Drink & Drive is illegal and strictly prohibited. Stay safe.
        </div>`
          : ''
      }

      <p>Please ensure you review the event rules and guidelines before attending.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/rules" class="rules-link">View Event Rules &amp; Guidelines →</a>

      <p style="margin-top:24px;">See you at the celebrations! 🎊</p>
      <p><strong>Kyndryl Events Team</strong></p>
    </div>

    <div class="footer">
      <p>This email was sent because you registered for the Kyndryl Year End Celebrations 2026.<br/>
      For queries, contact the event organiser.<br/>
      &copy; 2026 Kyndryl Solutions Pvt Ltd. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const transporter = await createTransporter();

  await transporter.sendMail({
    from: `"Kyndryl Year End 2026" <${process.env.GMAIL_FROM_ADDRESS}>`,
    to: guest.email,
    subject: '🎉 You\'re registered! Your QR Entry Pass — Kyndryl Year End Celebrations 2026',
    html,
    attachments: [
      {
        filename: 'entry-qr.png',
        content: base64QR,
        encoding: 'base64',
        cid: 'qrcode',
      },
    ],
  });
}
