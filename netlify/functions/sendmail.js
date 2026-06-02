// Rueckruf-Mailversand via Microsoft Graph API (Client Credentials Flow)
// Muster uebernommen aus der Fahrtenbuch-App.
// Erwartet Netlify ENV: AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET

const TENANT_ID = process.env.AZURE_TENANT_ID;
const CLIENT_ID = process.env.AZURE_CLIENT_ID;
const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;

const FROM_EMAIL = 'info@pilatescompany.de';        // Absender (Postfach)
const TO_EMAIL = 'oliver.wrobel@pilatescompany.de';  // Empfaenger des Rueckrufwunsches

async function getAccessToken() {
  const body = 'grant_type=client_credentials'
    + '&client_id=' + encodeURIComponent(CLIENT_ID)
    + '&client_secret=' + encodeURIComponent(CLIENT_SECRET)
    + '&scope=' + encodeURIComponent('https://graph.microsoft.com/.default');

  const res = await fetch('https://login.microsoftonline.com/' + TENANT_ID + '/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error('Token-Fehler: ' + (data.error_description || JSON.stringify(data)));
  }
  return data.access_token;
}

async function sendEmail(token, subject, htmlBody) {
  const mail = JSON.stringify({
    message: {
      subject: subject,
      body: { contentType: 'HTML', content: htmlBody },
      toRecipients: [{ emailAddress: { address: TO_EMAIL } }]
      // KEIN from-Feld (sonst Graph-Fehler)
    },
    saveToSentItems: true
  });

  const res = await fetch('https://graph.microsoft.com/v1.0/users/' + FROM_EMAIL + '/sendMail', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: mail
  });
  if (!res.ok && res.status !== 202) {
    const err = await res.text();
    throw new Error('Sendmail-Fehler ' + res.status + ': ' + err);
  }
}

function esc(s) {
  return String(s || '').replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
}

exports.handler = async (event) => {
  const CORS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ ok: false, error: 'Method Not Allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const name = (body.name || '').trim();
    const phone = (body.phone || '').trim();
    const message = (body.message || '').trim();

    if (!name || !phone) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ ok: false, error: 'Name und Telefon sind erforderlich.' }) };
    }

    const now = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
    const html =
      '<div style="font-family:Arial,sans-serif;color:#2c2825;font-size:15px;line-height:1.6;">' +
      '<h2 style="color:#b0796e;">Neuer R&uuml;ckruf-Wunsch (Website-Chat)</h2>' +
      '<p>Eine Interessentin hat im &bdquo;Frag mich was&ldquo;-Chat um einen R&uuml;ckruf gebeten:</p>' +
      '<table style="border-collapse:collapse;">' +
      '<tr><td style="padding:4px 12px 4px 0;"><strong>Name:</strong></td><td>' + esc(name) + '</td></tr>' +
      '<tr><td style="padding:4px 12px 4px 0;"><strong>Telefon:</strong></td><td>' + esc(phone) + '</td></tr>' +
      '<tr><td style="padding:4px 12px 4px 0;vertical-align:top;"><strong>Nachricht:</strong></td><td>' + (esc(message) || '<em>keine</em>') + '</td></tr>' +
      '<tr><td style="padding:4px 12px 4px 0;"><strong>Zeitpunkt:</strong></td><td>' + esc(now) + ' Uhr</td></tr>' +
      '</table>' +
      '<p style="margin-top:18px;font-size:13px;color:#8a847d;">Automatisch gesendet vom Website-Assistenten der Pilates Company L&uuml;beck.</p>' +
      '</div>';

    const token = await getAccessToken();
    await sendEmail(token, 'Rueckruf-Wunsch: ' + name, html);

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    console.error('sendmail Exception:', e.message);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ ok: false, error: e.message }) };
  }
};
