# Known Gaps & Mocks

This document outlines all components in AgriVaani that are currently mocked or stubbed out, and the specific environment variables required to make them production-ready.

### 1. Telephony & SMS
- **Status:** Mocked (logs to console).
- **Reason:** Requires active telecom credits.
- **How to wire:** Provide real `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` in `.env`. The `TwilioProvider` will automatically switch from mocking to live HTTP calls to Twilio.

### 2. Language Translation & STT/TTS (Bhashini)
- **Status:** Mocked.
- **Reason:** Bhashini API keys require an approved government/enterprise account.
- **How to wire:** Provide a valid `BHASHINI_API_KEY`. The `BhashiniProvider` must be updated to hit their specific REST endpoints for STT/TTS.

### 3. Gemini LLM (Crop Health & Recommendation Rationale)
- **Status:** Gracefully falls back to hardcoded localized strings if the API key is "mock_gemini_api_key".
- **Reason:** Preventing the demo from crashing if a judge doesn't provide a GCP key.
- **How to wire:** Set `GEMINI_API_KEY` to a real Google AI Studio key.

### 4. Earth Engine Satellite Data (NDVI/NDMI)
- **Status:** Returns randomized realistic numbers between 0.2 and 0.8.
- **Reason:** Requires a GCP Service Account with Earth Engine API enabled.
- **How to wire:** Set `EARTH_ENGINE_TOKEN` (or `GOOGLE_APPLICATION_CREDENTIALS`). The endpoint `/v1/plots/:id/sync-satellite` must be updated to make the authenticated request to Google Earth Engine.

### 5. Crop Recommendation Model
- **Status:** Rules-based fallback engine (`scorer.py`).
- **Reason:** Waiting for a labeled historical yield dataset to train the XGBoost model.
- **How to wire:** Once a dataset is secured, train the model, save as `model.json`, and update the FastApi `get_recommendation` route to run inference via the XGBoost library.

### 6. Firebase Auth (Dashboard) & Image Uploads
- **Status:** Hardcoded dummy Officer ID and mocked `media_url` fetching.
- **Reason:** These are **pilot-blockers**, not hackathon-blockers. Keep local testing simple for a 5-minute demo without requiring Firebase configuration or Cloud Storage buckets.
- **How to wire:** 
  - Configure `NEXT_PUBLIC_FIREBASE_API_KEY` and integrate the Firebase Auth SDK in the Next.js `_app.tsx` before a real field pilot.
  - Implement client-side direct-to-S3/GCS upload and pass the public URL in the `/health-cases` POST request.
