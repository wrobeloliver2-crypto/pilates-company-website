/* Pilates Company KI-Chat Widget v3 - Mit Folgefragen */
var pcOpen=false,pcH=[];

function pcToggle(){
  pcOpen=!pcOpen;
  document.getElementById('pcChatWin').style.display=pcOpen?'block':'none';
  if(pcOpen)document.getElementById('pcIn').focus();
}
function pcQuick(b){
  var q=b.textContent;
  var qq=document.getElementById('pcQQ');if(qq)qq.style.display='none';
  pcAdd(q,'pcU');
  pcGetAnswer(q);
}
function pcSendMsg(){
  var i=document.getElementById('pcIn'),q=i.value.trim();
  if(!q)return;i.value='';
  var qq=document.getElementById('pcQQ');if(qq)qq.style.display='none';
  pcAdd(q,'pcU');
  pcGetAnswer(q);
}
function pcAdd(t,c){
  var d=document.createElement('div');
  d.className='pcM '+c;
  d.innerHTML='<p>'+t+'</p>';
  document.getElementById('pcMsgs').appendChild(d);
  var m=document.getElementById('pcMsgs');m.scrollTop=m.scrollHeight;
}
function pcAddFollowUp(questions){
  var wrap=document.createElement('div');
  wrap.className='pcFU';
  wrap.style.cssText='display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.25rem;';
  questions.forEach(function(q){
    var b=document.createElement('button');
    b.className='pcQ';
    b.textContent=q;
    b.onclick=function(){pcQuick(this)};
    wrap.appendChild(b);
  });
  document.getElementById('pcMsgs').appendChild(wrap);
  var m=document.getElementById('pcMsgs');m.scrollTop=m.scrollHeight;
}
function pcShowTyping(){
  var ty=document.createElement('div');
  ty.className='pcTy';ty.id='pcTI';
  ty.innerHTML='<span></span><span></span><span></span>';
  document.getElementById('pcMsgs').appendChild(ty);
  var m=document.getElementById('pcMsgs');m.scrollTop=m.scrollHeight;
}

function pcGetAnswer(q){
  pcShowTyping();
  pcH.push({role:'user',content:q});
  var sys='Du bist Pia, der freundliche KI-Assistent der Pilates Company Luebeck. Antworte ausfuehrlich (80-120 Woerter). Du-Form, warm, persoenlich, sachlich, keine Emojis. Verwende Absaetze.\n\nSTUDIO: Segeberger Str. 1, 23617 Stockelsdorf. Inhaberin Hanna Wrobel. Tel: 0451-16083019 (KI-Telefonassistent, 24h Sofortnachricht, Rueckruf). E-Mail: info@pilatescompany.de. Parkplaetze am Haus.\n\nKURSE (30+/Woche Mo-Sa): Classic Pilates (Matte, max 10), Reformer-Pilates (Basic+Expert, max 5-8), Yoga (Hatha/Yin), Aerial Yoga (75-85Min, max 7), Pilates Workout. Alle 55Min ausser Aerial.\n\nTEAM: Hanna, Natascha, Olga, Ina, Maike, Tuana, Tina, Katy, Paula, Britta, Simone.\n\nPREISE: Summer Glow Start 69 Euro/Mo (3Mon, dann 89, 4Cr) = BESTES ANGEBOT! 12Mon Matte 59 Euro/Mo (8Cr). 1Mon Matte 69 Euro/Mo (8Cr). 1Mon Reformer 89 Euro/Mo (4Cr). 12Mon Reformer 89 Euro/Mo (8Cr). Drop-In 28 Euro. 5er-Pass 119 Euro (5x, 12Wo). Probestunde 16 Euro. KOSTENLOS Probetraining (Neukunden)! Gutschein 28 Euro.\n\nBuchung: eversports.de/s/pilates-company. IMMER Membership empfehlen. Neukunden: kostenloses Probetraining.';
  var verlauf=pcH.map(function(m){return m.role+': '+m.content}).join('\n');
  var msgs=[{role:'user',content:sys+'\n\nVerlauf:\n'+verlauf+'\n\nAntworte jetzt ausfuehrlich.'}];
  fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:300,messages:msgs})})
  .then(function(r){return r.json()})
  .then(function(d){
    var el=document.getElementById('pcTI');if(el)el.remove();
    var a='';
    if(d.content)d.content.forEach(function(b){if(b.type==='text')a+=b.text});
    if(a){pcH.push({role:'assistant',content:a});pcAdd(a.replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br>'),'pcB');pcShowContextFollowUp(q)}
    else pcFallback(q);
  })
  .catch(function(){var el=document.getElementById('pcTI');if(el)el.remove();pcFallback(q)});
}

function pcShowContextFollowUp(q){
  var l=q.toLowerCase();
  var fu=[];
  if(l.match(/preis|kost|membership|mitglied|abo/)){
    fu=['Was ist der Summer Glow Start?','Gibt es ein Probetraining?','Wie buche ich?'];
  } else if(l.match(/summer|glow/)){
    fu=['Was sind Credits?','Gibt es ein Probetraining?','Welche Kurse kann ich buchen?'];
  } else if(l.match(/probe|kostenlos|gratis|test|schnupper|anfang/)){
    fu=['Welche Kurse gibt es?','Was kostet eine Membership?','Wo ist das Studio?'];
  } else if(l.match(/reformer/)){
    fu=['Was kostet Reformer?','Matte oder Reformer?','Gibt es ein Probetraining?'];
  } else if(l.match(/kurs|yoga|aerial|pilates|matte/)){
    fu=['Was kostet das?','Wie buche ich einen Kurs?','Gibt es ein Probetraining?'];
  } else if(l.match(/buch|anmeld|termin/)){
    fu=['Was kostet eine Membership?','Wo ist das Studio?','Kann ich anrufen?'];
  } else if(l.match(/wo|adresse|standort|park/)){
    fu=['Wann habt ihr geoeffnet?','Wie buche ich?','Gibt es Parken?'];
  } else if(l.match(/telefon|kontakt|erreich|anruf/)){
    fu=['Was kostet eine Membership?','Gibt es ein Probetraining?','Wo ist das Studio?'];
  } else if(l.match(/gutschein|geschenk/)){
    fu=['Was kostet eine Membership?','Welche Kurse gibt es?','Kann ich anrufen?'];
  } else if(l.match(/trainer|team|hanna/)){
    fu=['Welche Kurse gibt es?','Wie gross sind die Gruppen?','Gibt es ein Probetraining?'];
  } else if(l.match(/unterschied|vergleich|matte oder/)){
    fu=['Was kostet Reformer?','Was kostet Mattenpilates?','Kann ich beides testen?'];
  } else if(l.match(/wellpass|urban|firma/)){
    fu=['Was kostet eine Membership?','Welche Kurse gibt es?','Wo ist das Studio?'];
  } else if(l.match(/^hallo|^hi|^hey|^guten|^moin/)){
    fu=['Was kostet eine Membership?','Gibt es ein Probetraining?','Welche Kurse gibt es?'];
  } else if(l.match(/danke|super|toll/)){
    fu=['Kann ich ein Probetraining buchen?','Wie erreiche ich euch?','Erzaehl mir mehr ueber Reformer'];
  } else if(l.match(/oeffnung|wann|zeit/)){
    fu=['Wie buche ich einen Kurs?','Was kostet eine Membership?','Wo ist das Studio?'];
  } else {
    fu=['Was kostet eine Membership?','Gibt es ein Probetraining?','Welche Kurse gibt es?'];
  }
  pcAddFollowUp(fu);
}

function pcFallback(q){
  var l=q.toLowerCase(),a='',fu=[];

  if(l.match(/preis|kost|was kostet|membership|mitglied|abo|teuer|guenstig|geld/)){
    a='Bei uns gibt es verschiedene Optionen:<br><br><strong>Memberships (beste Wahl!):</strong><br>- Summer Glow Start: <strong>69 Euro/Monat</strong> (3 Monate), danach 89 Euro. 4 Credits. Unser bestes Einstiegsangebot!<br>- Mattenpilates & Yoga ab <strong>59 Euro/Monat</strong> (12-Monats-Abo, 8 Credits)<br>- Reformer & others ab <strong>89 Euro/Monat</strong> (4-8 Credits)<br><br><strong>Flexible Optionen:</strong><br>- 5er-Pass: 119 Euro (5 Einheiten)<br>- Drop-In: 28 Euro/Kurs<br><br>Mit dem Summer Glow Start zahlst du nur 17,25 Euro pro Einheit statt 28 Euro beim Einzelticket! Alle Details auf unserer <a href="preise.html" style="color:#b0796e;text-decoration:underline;">Preise-Seite</a>.';
    fu=['Was ist der Summer Glow Start?','Gibt es ein Probetraining?','Wie buche ich?'];
  }
  else if(l.match(/summer|glow|aktion|angebot|rabatt|spar|deal/)){
    a='Der <strong>Summer Glow Start</strong> ist unser bestes Einstiegsangebot:<br><br>- <strong>69 Euro/Monat</strong> fuer die ersten 3 Monate<br>- Danach 89 Euro/Monat<br>- 4 Credits pro Monat<br>- Nur <strong>17,25 Euro pro Einheit</strong><br><br>Zum Vergleich: Ein Einzelticket kostet 28 Euro. Du sparst fast 43 Euro pro Monat! Buchbar auf <a href="https://www.eversports.de/sp/pilates-company" target="_blank" style="color:#b0796e;text-decoration:underline;">Eversports</a>.';
    fu=['Was sind Credits?','Gibt es ein Probetraining?','Welche Kurse kann ich buchen?'];
  }
  else if(l.match(/probe|kostenlos|gratis|test|schnupper|ausprobier|erstmal|anfang/)){
    a='Als <strong>Neukunde bekommst du ein kostenloses Probetraining</strong>!<br><br>So funktioniert es:<br>1. Melde dich auf unserer <a href="probetraining.html" style="color:#b0796e;text-decoration:underline;">Probetraining-Seite</a> an<br>2. Wir finden den passenden Kurs fuer dich<br>3. Komm vorbei - ganz ohne Druck<br><br>Du kannst alle Kursformate ausprobieren: Mattenpilates, Reformer, Yoga oder Aerial. Wir freuen uns auf dich!';
    fu=['Welche Kurse gibt es?','Was kostet danach eine Membership?','Wo ist das Studio?'];
  }
  else if(l.match(/reformer/)){
    a='<strong>Reformer-Pilates</strong> ist unser beliebtestes Angebot!<br><br>- Gezieltes Ganzkoerpertraining mit Federwiderstand<br>- Kleine Gruppen: max. 5-8 Teilnehmer<br>- Basic-Reformer (Anfaenger) und Expert-Reformer<br><br><strong>Preise:</strong><br>- Summer Glow Start: 69 Euro/Monat (4 Credits) - BESTES ANGEBOT!<br>- 1-Monats-Membership: 89 Euro/Monat<br>- 12-Monats-Membership: 89 Euro/Monat (8 Credits)<br><br>Starte mit einem <a href="probetraining.html" style="color:#b0796e;text-decoration:underline;">kostenlosen Probetraining</a>!';
    fu=['Was ist der Summer Glow Start?','Matte oder Reformer?','Probetraining buchen'];
  }
  else if(l.match(/kurs|was gibt|welche|yoga|aerial|pilates|matte|programm/)){
    a='Wir bieten <strong>ueber 30 Kurse pro Woche</strong> (Mo-Sa):<br><br><strong>Classic Pilates</strong> - Koerpermitte, Haltung. Max 10 Teilnehmer.<br><strong>Reformer-Pilates</strong> - Am Geraet. Max 5-8. Sehr beliebt!<br><strong>Yoga</strong> (Hatha & Yin) - Ruhe, Balance.<br><strong>Aerial Yoga</strong> - In der Haengematte. 75-85 Min.<br><strong>Pilates Workout</strong> - Intensiv.<br><br><a href="kurse.html" style="color:#b0796e;text-decoration:underline;">Kurse-Seite</a> | <a href="probetraining.html" style="color:#b0796e;text-decoration:underline;">Kostenlos reinschnuppern</a>';
    fu=['Was kostet das?','Erzaehl mir mehr ueber Reformer','Gibt es ein Probetraining?'];
  }
  else if(l.match(/buch|anmeld|reserv|termin|wie kann ich|wie geht/)){
    a='So buchst du bei uns:<br><br><strong>1. Online (empfohlen):</strong> Auf <a href="https://www.eversports.de/s/pilates-company" target="_blank" style="color:#b0796e;text-decoration:underline;">Eversports</a> siehst du alle Kurse und buchst direkt.<br><br><strong>2. Telefonisch:</strong> <strong>0451-16083019</strong> - 24h Sofortnachricht, Rueckruf garantiert.<br><br><strong>3. Per E-Mail:</strong> <a href="mailto:info@pilatescompany.de" style="color:#b0796e;text-decoration:underline;">info@pilatescompany.de</a>';
    fu=['Was kostet eine Membership?','Wo ist das Studio?','Gibt es ein Probetraining?'];
  }
  else if(l.match(/wo |adresse|standort|anfahrt|stockelsdorf|finde|park/)){
    a='<strong>Pilates Company Luebeck</strong><br>Segeberger Str. 1<br>23617 Stockelsdorf (bei Luebeck)<br><br>Parkplaetze direkt am Haus. Zentral gelegen, gut erreichbar. Im gleichen Gebaeude wie PhysioPro Luebeck.';
    fu=['Wann habt ihr geoeffnet?','Wie buche ich?','Gibt es ein Probetraining?'];
  }
  else if(l.match(/telefon|anruf|kontakt|erreich|sprech|meld|ruf/)){
    a='<strong>Telefon: 0451-16083019</strong><br>Unser KI-Telefonassistent ist 24h fuer dich da. Hinterlasse eine Sofortnachricht, Rueckruf garantiert.<br><br><strong>E-Mail:</strong> <a href="mailto:info@pilatescompany.de" style="color:#b0796e;text-decoration:underline;">info@pilatescompany.de</a><br><strong>WhatsApp:</strong> Gruener Button unten<br><strong>Instagram:</strong> <a href="https://www.instagram.com/my.pilatescompany" target="_blank" style="color:#b0796e;text-decoration:underline;">@my.pilatescompany</a>';
    fu=['Was kostet eine Membership?','Gibt es ein Probetraining?','Wo ist das Studio?'];
  }
  else if(l.match(/gutschein|geschenk|verschenk/)){
    a='<strong>Reformer-Pilates Gutschein fuer 28 Euro</strong> - eine tolle Geschenkidee!<br><br>Direkt auf unserer <a href="gutschein.html" style="color:#b0796e;text-decoration:underline;">Gutschein-Seite</a> kaufbar. Personalisierter Code per E-Mail, fuer alle Kurse einloesbar.';
    fu=['Welche Kurse gibt es?','Was kostet eine Membership?','Wo ist das Studio?'];
  }
  else if(l.match(/trainer|team|wer unterricht|hanna|olga|ina/)){
    a='Unser Team: <strong>10+ zertifizierte Trainerinnen</strong>.<br><br>Hanna Wrobel (Inhaberin, Reformer-Expertin), Natascha, Olga, Ina, Maike, Tuana, Tina, Katy, Paula, Britta, Simone.<br><br>Kleine Gruppen ermoeglichen persoenliche Betreuung. Mehr auf der <a href="trainer.html" style="color:#b0796e;text-decoration:underline;">Trainer-Seite</a>!';
    fu=['Welche Kurse gibt es?','Wie gross sind die Gruppen?','Gibt es ein Probetraining?'];
  }
  else if(l.match(/unterschied|vergleich|matte oder|was ist besser/)){
    a='<strong>Mattenpilates:</strong> Eigenes Koerpergewicht, max 10 Teilnehmer, ab 59 Euro/Monat. Ideal fuer Anfaenger.<br><br><strong>Reformer-Pilates:</strong> Am Geraet mit Federwiderstand, max 5-8, ab 69 Euro/Monat (Summer Glow). Intensiver, gezielter.<br><br>Mein Tipp: Probier beides <a href="probetraining.html" style="color:#b0796e;text-decoration:underline;">kostenlos</a> aus!';
    fu=['Was kostet Reformer?','Was kostet Mattenpilates?','Probetraining buchen'];
  }
  else if(l.match(/credit|guthaben|einheit/)){
    a='<strong>Credits</strong> sind deine monatlichen Kurs-Einheiten. Pro Credit kannst du einen Kurs besuchen.<br><br>Beispiele:<br>- Summer Glow Start: 4 Credits = 4 Kurse/Monat<br>- 12-Monats-Matte: 8 Credits = 8 Kurse/Monat<br>- 12-Monats-Reformer: 8 Credits = 8 Kurse/Monat<br><br>Nicht genutzte Credits verfallen am Monatsende. Waehle das Paket das zu deiner Trainingsfrequenz passt!';
    fu=['Welche Membership passt zu mir?','Was ist der Summer Glow Start?','Wie buche ich?'];
  }
  else if(l.match(/grupp|teilnehmer|wie viele|klein/)){
    a='Wir legen Wert auf <strong>kleine Gruppen</strong> fuer persoenliche Betreuung:<br><br>- <strong>Reformer:</strong> max. 5-8 Teilnehmer<br>- <strong>Aerial Yoga:</strong> max. 7 Teilnehmer<br>- <strong>Mattenpilates/Yoga:</strong> max. 10 Teilnehmer<br><br>So koennen unsere Trainerinnen individuell auf dich eingehen. Das ist einer unserer grossen Vorteile!';
    fu=['Was kostet eine Membership?','Wer sind die Trainerinnen?','Probetraining buchen'];
  }
  else if(l.match(/wellpass|urban sports|firmenfitness/)){
    a='Ja, wir akzeptieren <strong>Wellpass</strong>! Fuer Reformer-Kurse: 10 Euro Zuzahlung. Mattenpilates und Yoga ohne Zuzahlung.<br><br>Einfach Wellpass mitbringen und vor Ort einchecken.';
    fu=['Welche Kurse gibt es?','Wo ist das Studio?','Kann ich anrufen?'];
  }
  else if(l.match(/ausbildung|zertifik|trainer werden/)){
    a='Wir bieten <strong>Pilates-Trainerausbildungen</strong> an! Alle Infos auf unserer <a href="ausbildung.html" style="color:#b0796e;text-decoration:underline;">Ausbildungs-Seite</a>, inklusive Podcast-Folgen.<br><br>Fuer Details: 0451-16083019 oder info@pilatescompany.de.';
    fu=['Welche Kurse gibt es?','Was kostet eine Membership?','Wo ist das Studio?'];
  }
  else if(l.match(/oeffnung|wann|uhrzeit|zeit|morgen|abend/)){
    a='Kurse finden <strong>Montag bis Samstag</strong> statt, von 09:00 bis ca. 20:00 Uhr. Sonntags geschlossen.<br><br>Aktueller Kursplan: <a href="https://www.eversports.de/scl/pilates-company" target="_blank" style="color:#b0796e;text-decoration:underline;">Eversports</a>.';
    fu=['Wie buche ich?','Was kostet eine Membership?','Wo ist das Studio?'];
  }
  else if(l.match(/^hallo|^hi |^hey|^guten|^moin|^servus/)){
    a='Hallo! Ich bin Pia, der KI-Assistent der Pilates Company Luebeck.<br><br>Ich helfe dir gerne bei Fragen zu unseren Kursen, Preisen, Memberships oder dem kostenlosen Probetraining. Was moechtest du wissen?';
    fu=['Was kostet eine Membership?','Gibt es ein Probetraining?','Welche Kurse gibt es?'];
  }
  else if(l.match(/danke|super|toll|perfekt|klasse/)){
    a='Sehr gerne! Wenn du noch Fragen hast, bin ich jederzeit fuer dich da.<br><br>Als Neukunde kannst du jederzeit ein <a href="probetraining.html" style="color:#b0796e;text-decoration:underline;">kostenloses Probetraining</a> buchen. Wir freuen uns auf dich im Studio!';
    fu=['Probetraining buchen','Wie erreiche ich euch?','Erzaehl mir mehr ueber Reformer'];
  }
  else{
    a='Gute Frage! Dazu helfe ich dir am besten persoenlich weiter:<br><br>- <strong>Telefon: 0451-16083019</strong> (24h Sofortnachricht, Rueckruf)<br>- E-Mail: <a href="mailto:info@pilatescompany.de" style="color:#b0796e;text-decoration:underline;">info@pilatescompany.de</a><br>- WhatsApp: Gruener Button<br><br>Oder frag mich zu unseren Kursen, Preisen oder dem Probetraining!';
    fu=['Was kostet eine Membership?','Gibt es ein Probetraining?','Welche Kurse gibt es?'];
  }

  pcH.push({role:'assistant',content:a});
  pcAdd(a,'pcB');
  pcAddFollowUp(fu);
}
