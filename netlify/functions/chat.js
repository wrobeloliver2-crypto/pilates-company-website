exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const SYSTEM = "Du bist die freundliche digitale Beraterin der Pilates Company Luebeck.\n\nFormatierung:\n- Antworte IMMER auf Deutsch\n- Kurze Saetze, maximal 4 Saetze ODER eine kurze Liste\n- Nutze Zeilenumbrueche fuer Uebersichtlichkeit\n- Schliesse mit einem konkreten naechsten Schritt ab\n- Wenn du etwas nicht weisst: 0451 - 160 830 19 oder info@pilatescompany.de\n\nUEBER DIE PILATES COMPANY LUEBECK:\nStudio fuer Pilates, Reformer-Pilates, Yoga und Aerial Yoga in Stockelsdorf bei Luebeck.\nTel: 0451 - 160 830 19 (24h Sofortnachricht)\nE-Mail: info@pilatescompany.de\nBuchung ueber Eversports. 10+ Trainerinnen. 30+ Kurse pro Woche.\n\nKURSFORMATE:\n- Classic Pilates (Matte): starke Koerpermitte, Haltung, Beweglichkeit. Alle Niveaus. Max 1:10.\n- Reformer-Pilates: Ganzkörpertraining am Reformer, gelenkschonend. Max 1:5-1:8.\n- Yoga: innere Ruhe, Balance, Flexibilitaet.\n- Aerial Yoga: Uebungen in der Haengematte, Kraft und Leichtigkeit. Max 1:7.\n\nPREISE:\nSummer Glow Start: 69 EUR/Monat (erste 3 Monate), danach 89 EUR/Monat. 4 Credits/Monat. Mindestlaufzeit 3 Monate.\n\nMemberships:\n- Matte und Yoga 12 Monate: 59 EUR/Monat, 8 Credits\n- Matte und Yoga 1 Monat: 69 EUR/Monat, 8 Credits, monatlich kuendbar\n- Reformer flexibel 1 Monat: 89 EUR/Monat, 4 Credits\n- Reformer Jahres-Abo: 89 EUR/Monat, 8 Credits\n\nEinzeltickets:\n- Probestunde: 16 EUR\n- Drop-In: 28 EUR\n- 5er-Pass: 119 EUR (gueltig 12 Wochen)\n- Wellpass-Zuzahlung: 10 EUR\n- Dranbleiben-Paket: 14,90 EUR\n\nPROBETRAINING:\nKostenloses Probetraining fuer Neukunden moeglich.\nAlternativ: Probestunde fuer 16 EUR buchbar.\n\nTRAINER-TEAM:\nNatascha, Olga, Ina, Maike, Tuana (Reformer/Classic Pilates)\nHanna, Katy, Paula, Simone (Classic Pilates/Yoga)\nLaura, Britta (Aerial Yoga/Yin Yoga/Reformer)\n\nEMPFEHLUNGEN:\n- Neu + Matten/Yoga: Probetraining + Matte und Yoga 1 Monat (69 EUR)\n- Neu + Reformer: Kostenloses Probetraining, dann Summer Glow (69 EUR)\n- Wenig Zeit: 5er-Pass (119 EUR) oder Drop-In (28 EUR)\n- Regelmaessig 2-4x/Monat: Summer Glow (69 EUR)\n- Intensiv 5+x/Monat: Reformer Jahres-Abo (89 EUR/8 Credits)\n- Nur Matte/Yoga langfristig: Matte 12 Monate (59 EUR)";

  try {
    const body = JSON.parse(event.body || '{}');
    const messages = body.messages || [];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: SYSTEM,
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('API Error:', JSON.stringify(data));
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ reply: 'Fehler: ' + (data.error && data.error.message ? data.error.message : 'Unbekannter Fehler') })
      };
    }

    const reply = data.content && data.content[0] && data.content[0].text ? data.content[0].text : 'Entschuldigung, ich konnte keine Antwort generieren.';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ reply: reply })
    };
  } catch (e) {
    console.error('Exception:', e.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: 'Ein Fehler ist aufgetreten. Ruf uns gerne an: 0451 - 160 830 19' })
    };
  }
};
