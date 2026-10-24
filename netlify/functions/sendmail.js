// Rueckruf-Mailversand via Microsoft Graph API (Client Credentials Flow)
// Muster uebernommen aus der Fahrtenbuch-App.
// Erwartet Netlify ENV: AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET

const TENANT_ID = process.env.AZURE_TENANT_ID;
const CLIENT_ID = process.env.AZURE_CLIENT_ID;
const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;

const FROM_EMAIL = 'info@pilatescompany.de';        // Absender (Postfach)
const TO_EMAIL = 'oliver.wrobel@pilatescompany.de';  // Empfaenger des Rueckrufwunsches
const ANFRAGE_TO = 'info@pilatescompany.de';         // Empfaenger von Kontaktformular und Personal-Training-Anfrage

// Formulare der Website (ersetzen seit 24.10.2026 die HubSpot-Formulare). Gespeichert wird nichts,
// die Anfrage geht nur als Mail an ANFRAGE_TO, Antworten gehen per Reply-To direkt an die Absenderin.
const FORMULARE = {
  kontakt: { titel: 'Neue Nachricht &uuml;ber das Kontaktformular', betreff: 'Kontaktformular' },
  'personal-training': { titel: 'Neue Anfrage: Personal Training', betreff: 'Personal-Training-Anfrage' },
};

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

async function sendEmail(token, subject, htmlBody, an, antwortAn) {
  const mail = JSON.stringify({
    message: {
      subject: subject,
      body: { contentType: 'HTML', content: htmlBody },
      toRecipients: [{ emailAddress: { address: an || TO_EMAIL } }],
      ...(antwortAn ? { replyTo: [{ emailAddress: { address: antwortAn } }] } : {})
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

const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

// Kontaktformular und Personal-Training-Anfrage: Name, E-Mail oder Telefon, Nachricht
async function formularAnfrage(body, CORS) {
  const f = FORMULARE[body.art];
  const feld = (k, max) => String(body[k] || '').trim().slice(0, max);
  const name = feld('name', 120);
  const email = feld('email', 200);
  const phone = feld('phone', 40);
  const message = feld('message', 4000);
  const antwort = (code, daten) => ({ statusCode: code, headers: CORS, body: JSON.stringify(daten) });

  // Verstecktes Feld: von Menschen nie ausgefuellt. Bots bekommen „ok“, es geht keine Mail raus.
  if (String(body.website || '').trim()) return antwort(200, { ok: true });
  if (!name) return antwort(400, { ok: false, error: 'Bitte gib deinen Namen an.' });
  if (email && !EMAIL_RE.test(email)) return antwort(400, { ok: false, error: 'Bitte prüfe deine E-Mail-Adresse.' });
  if (body.art === 'kontakt' && !email) return antwort(400, { ok: false, error: 'Bitte gib deine E-Mail-Adresse an.' });
  if (!email && !phone) return antwort(400, { ok: false, error: 'Bitte gib eine E-Mail-Adresse oder Telefonnummer an.' });
  if (body.art === 'kontakt' && !message) return antwort(400, { ok: false, error: 'Bitte schreib uns kurz, worum es geht.' });

  const now = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
  const zeile = (k, v) => '<tr><td style="padding:4px 12px 4px 0;vertical-align:top;"><strong>' + k + ':</strong></td><td>' + v + '</td></tr>';
  const html =
    '<div style="font-family:Arial,sans-serif;color:#2c2825;font-size:15px;line-height:1.6;">' +
    '<h2 style="color:#b0796e;">' + f.titel + '</h2>' +
    '<table style="border-collapse:collapse;">' +
    zeile('Name', esc(name)) +
    (email ? zeile('E-Mail', esc(email)) : '') +
    (phone ? zeile('Telefon', esc(phone)) : '') +
    zeile('Nachricht', esc(message).replace(/\n/g, '<br>') || '<em>keine</em>') +
    zeile('Zeitpunkt', esc(now) + ' Uhr') +
    '</table>' +
    '<p style="margin-top:18px;font-size:13px;color:#8a847d;">Automatisch gesendet von der Website der Pilates Company L&uuml;beck. ' +
    (email ? '&bdquo;Antworten&ldquo; geht direkt an die Absenderin.' : 'Keine E-Mail angegeben, bitte telefonisch melden.') + '</p>' +
    '</div>';

  const token = await getAccessToken();
  await sendEmail(token, f.betreff + ': ' + name.replace(/[\r\n]/g, ' '), html, ANFRAGE_TO, email || null);
  return antwort(200, { ok: true });
}

exports.handler = async (event) => {
  const CORS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ ok: false, error: 'Method Not Allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    if (FORMULARE[body.art]) return await formularAnfrage(body, CORS);
    const name = (body.name || '').trim();
    const phone = (body.phone || '').trim();
    const message = (body.message || '').trim();
    const language = (body.language || '').trim();   // optionale Wunschsprache (von Sprachseiten)
    const email = (body.email || '').trim();          // optionale E-Mail (von Sprachseiten)
    const source = (body.source || '').trim();        // z.B. "english", "turkce", "russkiy"

    if (!name || !phone) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ ok: false, error: 'Name und Telefon sind erforderlich.' }) };
    }

    const now = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
    const isLangPage = !!language || !!source;
    const heading = isLangPage ? 'Neue Anfrage: Personal Training (mehrsprachig)' : 'Neuer R&uuml;ckruf-Wunsch (Website-Chat)';
    const intro = isLangPage
      ? 'Eine Interessentin/ein Interessent hat &uuml;ber eine fremdsprachige Seite nach Personal Training gefragt:'
      : 'Eine Interessentin hat im &bdquo;Frag mich was&ldquo;-Chat um einen R&uuml;ckruf gebeten:';
    const langRow = language ? '<tr><td style="padding:4px 12px 4px 0;"><strong>Wunschsprache:</strong></td><td>' + esc(language) + '</td></tr>' : '';
    const emailRow = email ? '<tr><td style="padding:4px 12px 4px 0;"><strong>E-Mail:</strong></td><td>' + esc(email) + '</td></tr>' : '';
    const sourceRow = source ? '<tr><td style="padding:4px 12px 4px 0;"><strong>Quelle:</strong></td><td>' + esc(source) + '-Seite</td></tr>' : '';

    const html =
      '<div style="font-family:Arial,sans-serif;color:#2c2825;font-size:15px;line-height:1.6;">' +
      '<h2 style="color:#b0796e;">' + heading + '</h2>' +
      '<p>' + intro + '</p>' +
      '<table style="border-collapse:collapse;">' +
      '<tr><td style="padding:4px 12px 4px 0;"><strong>Name:</strong></td><td>' + esc(name) + '</td></tr>' +
      '<tr><td style="padding:4px 12px 4px 0;"><strong>Telefon:</strong></td><td>' + esc(phone) + '</td></tr>' +
      emailRow +
      langRow +
      '<tr><td style="padding:4px 12px 4px 0;vertical-align:top;"><strong>Nachricht:</strong></td><td>' + (esc(message) || '<em>keine</em>') + '</td></tr>' +
      sourceRow +
      '<tr><td style="padding:4px 12px 4px 0;"><strong>Zeitpunkt:</strong></td><td>' + esc(now) + ' Uhr</td></tr>' +
      '</table>' +
      '<p style="margin-top:18px;font-size:13px;color:#8a847d;">Automatisch gesendet von der Website der Pilates Company L&uuml;beck.</p>' +
      '</div>';

    const subjectPrefix = isLangPage ? 'Personal-Training-Anfrage' : 'Rueckruf-Wunsch';
    const token = await getAccessToken();
    await sendEmail(token, subjectPrefix + ': ' + name + (language ? ' (' + language + ')' : ''), html);

    // Zusätzlich als Lead ins Dashboard (Quelle "Website-Chat", analog Placetel).
    // Bewusst NACH der Mail und in eigenem try/catch: Die Mail ist der
    // Primärkanal und darf durch einen Dashboard-Ausfall nie blockiert werden.
    // Dedup übernimmt das Dashboard (Telefon-/E-Mail-Abgleich).
    try {
      const produkt = isLangPage
        ? ('Personal Training' + (language ? ' (' + language + ')' : '') + ' (Anfrage Sprachseite)')
        : 'Rückruf-Wunsch (Website-Chat)';
      await fetch('https://pilatesleaddashboard.netlify.app/.netlify/functions/evs-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          telefon: phone,
          email: email,
          produkt: produkt,
          nachricht: message,
          quelle: 'website-chat'
        })
      });
    } catch (e) {
      console.error('Dashboard-Lead-Post fehlgeschlagen (Mail war erfolgreich):', e.message);
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    console.error('sendmail Exception:', e.message);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ ok: false, error: e.message }) };
  }
};
