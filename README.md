<div align="center">

# 🌾 AgriVaani
### The Voice of the Farm

**AI-powered voice & SMS agricultural intelligence for India's small and marginal farmers — in their own language, on the phone they already own.**

Built for **Build with AI: Code for Communities** — a Google Cloud hackathon where every problem statement was written by an MP's office, and the best solutions get piloted in a real constituency.

[![Status](https://img.shields.io/badge/status-hackathon--prototype-orange)]()
[![Stack](https://img.shields.io/badge/backend-Node.js%20%2B%20FastAPI-blue)]()
[![AI](https://img.shields.io/badge/AI-Vertex%20AI%20%2F%20Gemini-4285F4)]()
[![Hardware](https://img.shields.io/badge/hardware-Arduino%20Mega%202560%20%2B%20GSM-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-lightgrey)]()

</div>

---

## Why this exists

**86.1% of India's ~146 million landholdings are small and marginal** (Agriculture Census, 2015–16). Most of these farmers choose what to plant based on habit and hearsay — not on what the soil, the groundwater, or the sky are actually saying. When the guess is wrong, the loss is total: no insurance cushion, no smartphone to check an app, and one extension officer covering dozens of villages.

AgriVaani doesn't ask farmers to change how they live. It meets them on a phone call.

## What it does

AgriVaani is three connected AI systems, reachable entirely by **voice IVR and SMS** — no app, no smartphone, no literacy requirement:

| | Pillar | What it does |
|---|---|---|
| 🛰️ | **Smart Crop Recommendation** | Fuses satellite NDVI/NDMI, soil pH, groundwater depth, and rainfall history into a ranked, plain-language crop recommendation per plot, per season. |
| ⚡ | **Real-Time Advisory & Dry-Spell Alerts** | Fuses weather forecasts with real field sensor data (Arduino Mega 2560 + GSM + pH sensor) to push proactive irrigation/fertigation alerts by voice and SMS — before the damage happens, not after. Can optionally **auto-actuate** an irrigation pump via a 4-channel relay, gated by hard safety limits. |
| 🔬 | **Crop Health Logging** | A farmer sends a photo or voice note of a sick plant. Gemini's multimodal model gives an instant diagnosis and confidence score. Low-confidence or high-severity cases are automatically escalated to a human expert at the nearest **Rythu Seva Kendra**. |

---

## System Architecture

```
                        FARMER TOUCHPOINTS
        📞 Toll-free voice call (IVR)      💬 SMS (inbound/outbound)
                     │                              │
           ┌─────────▼──────────┐        ┌──────────▼─────────┐
           │  Telephony Gateway  │◄───────┤    SMS Gateway      │
           │  (Twilio / Exotel)  │        │  (Twilio / Exotel)  │
           └─────────┬───────────┘        └──────────┬──────────┘
                      └───────────────┬───────────────┘
                                      ▼
                       ┌───────────────────────────┐
                       │    Orchestration API        │  Node.js / TypeScript
                       │  session state · routing    │
                       │  IVR state machine          │
                       └──────────────┬──────────────┘
           ┌──────────────┬───────────┼───────────────┬──────────────┐
           ▼              ▼           ▼               ▼              ▼
   ┌──────────────┐ ┌───────────┐ ┌───────────┐ ┌────────────┐ ┌─────────────┐
   │ Recommend    │ │ Advisory / │ │ Crop      │ │ Language   │ │ RSK Officer │
   │ Service      │ │ Alert      │ │ Health    │ │ Provider   │ │ Dashboard   │
   │ FastAPI +    │ │ Engine     │ │ Diagnosis │ │ Bhashini / │ │ Next.js 14  │
   │ XGBoost      │ │ Node cron  │ │ Gemini    │ │ Google STT │ │             │
   │              │ │ + rules    │ │ Vision    │ │ /TTS       │ │             │
   └──────┬───────┘ └─────┬──────┘ └─────┬─────┘ └────────────┘ └──────┬──────┘
          │               │              │                             │
          ▼               ▼              ▼                             │
   ┌───────────────────────────────────────────────┐                   │
   │                    Data Layer                   │                   │
   │  Earth Engine · Soil Health Card · CGWB          │                   │
   │  IMD / weather · Field hardware (GSM/GPRS + SMS) │                   │
   └───────────────────────┬─────────────────────────┘                   │
                            ▼                                            │
                ┌────────────────────────────┐                          │
                │ PostgreSQL · Firestore ·    │◄─────────────────────────┘
                │ BigQuery                    │
                └────────────────────────────┘
```

### On the ground

```
   🌱 Field                                    📡 GSM / GPRS
┌─────────────────┐                     ┌──────────────────────┐
│ Arduino Mega 2560 │ ── pH readings ──► │ Orchestration API     │
│  + SIM800L GSM     │                    │ /v1/sensors/:id/... │
│  + pH sensor        │ ◄── commands ──── │                      │
│  + 4-ch relay        │                    └──────────────────────┘
│    ├─ irrigation pump                              │
│    ├─ fertigation valve A                          ▼
│    ├─ fertigation valve B                  Alert Engine (cron)
│    └─ spare                                fuses forecast + soil signal
│  safety: 30-min max runtime,               → voice + SMS alert
│  local manual override always wins         → optional auto-actuation
└─────────────────┘                            (opt-in, critical-only)
```

---

## Tech Stack

<table>
<tr><td><b>AI / ML</b></td><td>Vertex AI · Gemini 2.x (multimodal) · XGBoost recommender + rules-based fallback</td></tr>
<tr><td><b>Geospatial</b></td><td>Google Earth Engine (Sentinel-2 NDVI/NDMI) · ISRO Bhuvan · CGWB / India-WRIS groundwater</td></tr>
<tr><td><b>Weather</b></td><td>IMD API · NASA POWER / OpenWeatherMap fallback</td></tr>
<tr><td><b>Voice & SMS</b></td><td>Twilio Programmable Voice + SMS (Exotel-ready via provider interface)</td></tr>
<tr><td><b>Language</b></td><td>Bhashini (primary) · Google Cloud Speech-to-Text & Text-to-Speech (fallback, live)</td></tr>
<tr><td><b>Backend</b></td><td>Node.js + TypeScript (orchestration) · Python + FastAPI (recommendation engine)</td></tr>
<tr><td><b>Database</b></td><td>PostgreSQL (Cloud SQL / Neon / Supabase) · Firestore · BigQuery</td></tr>
<tr><td><b>Dashboard</b></td><td>Next.js 14 + TypeScript + Tailwind CSS</td></tr>
<tr><td><b>Field Hardware</b></td><td>Arduino Mega 2560 · SIM800L GSM module · analog pH sensor · 4-channel relay module</td></tr>
</table>

---

## Repository Structure

```
agrivaani/
├── apps/
│   ├── orchestration-api/        # Node.js/TypeScript — telephony, sessions, IVR, alerts
│   ├── recommendation-service/   # Python FastAPI — crop scoring + Gemini rationale
│   └── officer-dashboard/        # Next.js 14 — RSK escalation queue
├── firmware/
│   └── sensor_node/sensor_node.ino   # Arduino Mega 2560 + GSM + pH + relay
├── scripts/
│   ├── seed_demo_data.ts
│   ├── telemetry_replay.py
│   └── fake_call.ts
├── db/
│   └── migrations/001_initial_schema.sql
├── docs/
│   ├── DEMO_SCRIPT.md
│   └── KNOWN_GAPS.md
└── .env.example
```

---

## Getting Started (native — no Docker required)

> This project runs natively on your machine. No virtualization needed.

### 1. Database — free cloud Postgres
Create a free instance at [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com), then:
```bash
psql <your_connection_string> -f db/migrations/001_initial_schema.sql
```

### 2. Environment
```bash
cp .env.example .env
# fill in DATABASE_URL at minimum — everything else falls back to
# deterministic mocks if a key is missing (see KNOWN_GAPS.md)
```

### 3. Seed demo data
```bash
cd scripts && ts-node seed_demo_data.ts
```

### 4. Run the services
```bash
# Terminal 1 — orchestration API
cd apps/orchestration-api && npm install && npm run dev

# Terminal 2 — recommendation engine
cd apps/recommendation-service && python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 3 — officer dashboard
cd apps/officer-dashboard && npm install && npm run dev
```

### 5. (Optional) Go live with real voice calls
```bash
ngrok http 3000
# point your Twilio number's webhook at <ngrok-url>/v1/voice/inbound
```

Full walkthrough: [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md)

---

## What's real vs. what's mocked

AgriVaani is built so that **every mocked component sits behind the same interface a real one would use** — swap a credential, not the architecture. Full detail in [`docs/KNOWN_GAPS.md`](docs/KNOWN_GAPS.md).

| Component | Status |
|---|---|
| Crop scoring (rules-based) | ✅ Live, unit-tested |
| Gemini rationale generation | ✅ Live (falls back to static strings without a key) |
| Google Cloud Speech-to-Text / Text-to-Speech | ✅ Live |
| Arduino Mega 2560 firmware (pH + relay + safety cutoffs) | ✅ Written, hardware-ready |
| Alert engine (deterministic dry-spell + pH thresholds) | ✅ Live |
| Gemini Vision crop diagnosis | ✅ Live (falls back to a mock diagnosis without a key) |
| RSK officer dashboard | ✅ Live |
| Twilio voice/SMS | ✅ Live with a trial account + ngrok |
| Earth Engine satellite sync | 🟡 Mocked (realistic randomized NDVI/NDMI) |
| XGBoost trained model | 🟡 Rules-based fallback in its place |
| Bhashini Indic language APIs | 🟡 Mocked (enterprise account required) |
| Officer authentication | 🟡 Stubbed (pilot-blocker, not a hackathon-blocker) |

---

## Safety by design

- **Auto-actuation is opt-in per plot, critical-alerts-only** — advisory (voice/SMS) is always the default response. The system never silently starts controlling a farmer's irrigation pump.
- **Hardware-level guardrails**: a 30-minute max relay runtime regardless of the source of the command, and a local manual override switch that always wins over a remote signal.
- **Alert fatigue control**: no duplicate alert for the same unresolved condition within 24 hours.
- **Explicit escalation rule, not implicit LLM judgment**: `needs_expert = confidence < 0.6 OR severity == "high"` lives in code, not inside a prompt.

---

## Roadmap

- [x] Crop recommendation engine with rules-based fallback
- [x] Real-time alert engine with hardware sensor fusion
- [x] Crop health diagnosis with human escalation
- [x] Voice/SMS orchestration with live Twilio + Google TTS
- [ ] Real Earth Engine satellite integration
- [ ] Trained XGBoost model on labeled yield data
- [ ] Bhashini production integration for full Indic language coverage
- [ ] Pilot deployment with one Rythu Seva Kendra cluster
- [ ] District-scale rollout in partnership with the state agriculture department

---

## Team

**Team AgriVaani** — Indore
Built for Build with AI: Code for Communities (Google Cloud Hackathon)

---

<div align="center">

*Krishi Buddhimatta, Har Kisan Tak — Agricultural intelligence, to every farmer.*

</div>
