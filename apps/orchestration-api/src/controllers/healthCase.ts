import { Request, Response } from 'express';
import { query } from '../db';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock_key');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export const submitHealthCase = async (req: Request, res: Response) => {
  const { farmer_id, plot_id, media_url, voice_transcript } = req.body;

  try {
    let ai_diagnosis = 'Diagnosis unavailable';
    let ai_confidence = 0;
    let severity_estimate = 'unknown';
    let recommended_self_care = '';

    // Mock Gemini API call if key is not set or mock
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock_gemini_api_key') {
      ai_diagnosis = 'Mock Diagnosis: Leaf blight detected.';
      ai_confidence = 0.85;
      severity_estimate = 'medium';
      recommended_self_care = 'Apply appropriate fungicide.';
    } else {
      // In a real scenario, we'd fetch the image from media_url and pass it to Gemini Vision.
      // Here we simulate the prompt.
      const prompt = `Analyze this crop health report. Voice note: "${voice_transcript}". Return JSON with { likely_issue, confidence (0-1), severity (low/medium/high), recommended_self_care }`;
      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        // Naive parsing for demo
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
           const parsed = JSON.parse(match[0]);
           ai_diagnosis = parsed.likely_issue || ai_diagnosis;
           ai_confidence = parsed.confidence || ai_confidence;
           severity_estimate = parsed.severity || severity_estimate;
           recommended_self_care = parsed.recommended_self_care || recommended_self_care;
        }
      } catch (err) {
        console.error('Gemini error:', err);
      }
    }

    // Escalation rule lives in code, not LLM
    let status = 'pending';
    const needs_expert = ai_confidence < 0.6 || severity_estimate === 'high';
    
    if (needs_expert) {
        status = 'escalated';
    } else {
        status = 'self_care';
    }

    const insertRes = await query(`
      INSERT INTO health_cases (farmer_id, plot_id, media_url, voice_transcript, ai_diagnosis, ai_confidence, severity_estimate, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, status
    `, [farmer_id, plot_id, media_url, voice_transcript, ai_diagnosis, ai_confidence, severity_estimate, status]);

    res.json({
        id: insertRes.rows[0].id,
        status: insertRes.rows[0].status,
        diagnosis: ai_diagnosis,
        confidence: ai_confidence,
        severity: severity_estimate,
        self_care: recommended_self_care
    });

  } catch (error) {
    console.error('Submit health case error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Database error' } });
  }
};

export const getHealthCase = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const caseRes = await query('SELECT * FROM health_cases WHERE id = $1', [id]);
        if (caseRes.rowCount === 0) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Case not found' }});
        res.json({ health_case: caseRes.rows[0] });
    } catch (err) {
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Database error' } });
    }
}
