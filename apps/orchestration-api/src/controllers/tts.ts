import { Request, Response } from 'express';
import { getLanguageProvider } from '../services/language';

export const synthesizeSpeech = async (req: Request, res: Response) => {
  const { text, languageCode = 'hi-IN' } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const provider = getLanguageProvider();
    const audioUrl = await provider.textToSpeech(text, languageCode);
    res.json({ audioUrl });
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: 'Internal server error during speech synthesis' });
  }
};
