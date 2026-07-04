import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { SpeechClient } from '@google-cloud/speech';

export interface LanguageProvider {
  speechToText(audioUrl: string, languageCode: string): Promise<string>;
  textToSpeech(text: string, languageCode: string): Promise<string>;
  translate(text: string, targetLanguage: string): Promise<string>;
}

export class BhashiniProvider implements LanguageProvider {
  async speechToText(audioUrl: string, languageCode: string): Promise<string> {
    return "Mock Bhashini STT";
  }
  async textToSpeech(text: string, languageCode: string): Promise<string> {
    return "Mock Bhashini TTS";
  }
  async translate(text: string, targetLanguage: string): Promise<string> {
    return `[Mock Bhashini Translate] ${text}`;
  }
}

export class GoogleCloudLanguageProvider implements LanguageProvider {
  private ttsClient: TextToSpeechClient;
  private sttClient: SpeechClient;

  constructor() {
    // These will automatically pick up GOOGLE_APPLICATION_CREDENTIALS from env
    this.ttsClient = new TextToSpeechClient();
    this.sttClient = new SpeechClient();
  }

  async speechToText(audioUrl: string, languageCode: string): Promise<string> {
    console.log(`[Google STT] Would fetch ${audioUrl} and transcribe for ${languageCode}`);
    // Mocking the actual fetch/decode for simplicity, as it requires GCS or local buffer handling
    return "Google STT transcription (mock)";
  }

  async textToSpeech(text: string, languageCode: string): Promise<string> {
    // If we don't have creds, return a fallback string indicating it
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.EARTH_ENGINE_TOKEN) {
       console.log('[Mock Google TTS] Credentials not found, mocking output');
       return '/public/mock-audio.mp3';
    }

    try {
      const request = {
        input: { text: text },
        voice: { languageCode: languageCode, name: languageCode === 'hi-IN' ? 'hi-IN-Neural2-A' : 'en-US-Standard-C' },
        audioConfig: { audioEncoding: 'MP3' as const },
      };

      const [response] = await this.ttsClient.synthesizeSpeech(request);
      
      const hash = crypto.createHash('md5').update(text).digest('hex');
      const filename = `${hash}.mp3`;
      const publicDir = path.join(__dirname, '../../public');
      
      if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
      }

      const filePath = path.join(publicDir, filename);
      fs.writeFileSync(filePath, response.audioContent as Uint8Array, 'binary');
      
      return `/public/${filename}`;
    } catch (e) {
      console.error('Google TTS Error:', e);
      return '/public/mock-audio.mp3';
    }
  }

  async translate(text: string, targetLanguage: string): Promise<string> {
    return `[Google Translate Mock] ${text}`;
  }
}

// Factory (Swapped to Google as requested for live demo)
export const getLanguageProvider = (): LanguageProvider => {
  return new GoogleCloudLanguageProvider();
};
