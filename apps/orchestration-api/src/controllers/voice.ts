import { Request, Response } from 'express';
import { query } from '../db';
import { getLanguageProvider } from '../services/language';

// Twilio Voice webhook format for IVR state machine
// States: GREETING -> MAIN_MENU -> INTENT_HANDLER -> CONFIRM_AND_CLOSE

export const handleInboundCall = async (req: Request, res: Response) => {
  const from = req.body.From || '+910000000000';
  
  // 1. Identify Farmer
  const farmerRes = await query('SELECT * FROM farmers WHERE phone_number = $1', [from.replace('+', '')]);
  let language = 'hi';
  if (farmerRes.rowCount && farmerRes.rowCount > 0) {
    language = farmerRes.rows[0].preferred_language;
  }

  // 2. Create Session
  const sessionRes = await query(`
    INSERT INTO call_sessions (farmer_id, channel) 
    VALUES ($1, 'voice') RETURNING id
  `, [farmerRes.rowCount && farmerRes.rowCount > 0 ? farmerRes.rows[0].id : null]);
  const sessionId = sessionRes.rows[0].id;

  // 3. Generate TwiML Greeting & Menu
  const languageProvider = getLanguageProvider();
  const greetingText = 'AgriVaani mein aapka swagat hai. Mausam ke liye ek dabayein. Fasal ki salah ke liye do dabayein. Bimari ki report karne ke liye teen dabayein.';
  const audioUrl = await languageProvider.textToSpeech(greetingText, language);

  let playbackNode = '';
  if (audioUrl.startsWith('/public') && audioUrl !== '/public/mock-audio.mp3') {
    const host = req.get('host');
    playbackNode = `<Play>https://${host}${audioUrl}</Play>`;
  } else {
    playbackNode = `<Say language="hi-IN">${greetingText}</Say>`;
  }

  const twiml = `
    <Response>
      <Gather action="/v1/voice/gather?sessionId=${sessionId}&amp;lang=${language}" numDigits="1">
        ${playbackNode}
      </Gather>
    </Response>
  `;
  
  res.type('text/xml').send(twiml);
};

export const handleVoiceGather = async (req: Request, res: Response) => {
  const { sessionId, lang } = req.query;
  const digits = req.body.Digits;

  let intent = 'unknown';
  let responseText = '';

  const languageProvider = getLanguageProvider();
  
  if (digits === '1') {
    intent = 'weather';
    responseText = 'Aaj barish ki sambhavna nahi hai.';
  } else if (digits === '2') {
    intent = 'recommendation';
    responseText = 'Aapke khet ke liye kapas sabse accha hai.';
  } else if (digits === '3') {
    intent = 'report_issue';
    responseText = 'Kripya paudhe ki photo SMS par bhejein. Humara adhikari aapse sampark karega.';
  } else {
    responseText = 'Galat vikalp.';
  }

  // Update session
  await query('UPDATE call_sessions SET intent = $1 WHERE id = $2', [intent, sessionId]);

  let audioUrl = await languageProvider.textToSpeech(responseText, lang as string || 'hi-IN');
  let playbackNode = '';

  if (audioUrl.startsWith('/public') && audioUrl !== '/public/mock-audio.mp3') {
    // Real MP3 generated
    const host = req.get('host'); // E.g., xyz.ngrok.app
    playbackNode = `<Play>https://${host}${audioUrl}</Play>`;
  } else {
    // Fallback to Twilio's built-in TTS if Google API wasn't configured
    playbackNode = `<Say language="hi-IN">${responseText}</Say>`;
  }

  const twiml = `
    <Response>
      ${playbackNode}
      <Hangup />
    </Response>
  `;
  
  res.type('text/xml').send(twiml);
};
