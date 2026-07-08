import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import path from 'path';
import { ingestTelemetry, getCommands, getAlerts } from './controllers/sensor';
import { evaluateAlerts } from './jobs/alertEngine';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, '../public')));

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', service: 'orchestration-api' });
});

import { submitHealthCase, getHealthCase } from './controllers/healthCase';
import { getRskQueue, resolveCase } from './controllers/rsk';

// Sensor API
app.post('/v1/sensors/:deviceId/telemetry', ingestTelemetry);
app.get('/v1/sensors/:deviceId/commands', getCommands);
app.get('/v1/alerts/plot/:plotId', getAlerts);

// Health Cases
app.post('/v1/health-cases', submitHealthCase);
app.get('/v1/health-cases/:id', getHealthCase);

// Voice IVR
import { handleInboundCall, handleVoiceGather } from './controllers/voice';
app.post('/v1/voice/inbound', handleInboundCall);
app.post('/v1/voice/gather', handleVoiceGather);

// TTS
import { synthesizeSpeech } from './controllers/tts';
app.post('/v1/tts', synthesizeSpeech);

// RSK Officer Dashboard
app.get('/v1/rsk/queue', getRskQueue);
app.patch('/v1/rsk/cases/:id', resolveCase);

// Start cron-like alert evaluation (every 1 minute for demo, real world: 6 hours)
setInterval(() => {
  evaluateAlerts();
}, 60000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Orchestration API running on port ${PORT}`);
});
