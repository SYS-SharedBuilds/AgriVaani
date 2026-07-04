CREATE TABLE farmers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(15) UNIQUE NOT NULL,
  preferred_language VARCHAR(10) NOT NULL DEFAULT 'hi',
  name TEXT,
  village TEXT,
  district TEXT,
  state TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE plots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  area_hectares NUMERIC,
  soil_ph NUMERIC,
  soil_n NUMERIC, soil_p NUMERIC, soil_k NUMERIC,
  groundwater_depth_m NUMERIC,
  last_satellite_sync TIMESTAMPTZ,
  ndvi_value NUMERIC,
  ndmi_value NUMERIC
);

CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plot_id UUID REFERENCES plots(id),
  season VARCHAR(10) NOT NULL, -- kharif/rabi/zaid
  crop_ranked JSONB NOT NULL,  -- [{crop, score, rationale}]
  model_version VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sensor_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plot_id UUID REFERENCES plots(id),
  device_id VARCHAR(50) UNIQUE,       -- SIM ICCID or GSM module IMEI
  sim_msisdn VARCHAR(15),             -- phone number of the node's SIM, for SMS fallback
  controller VARCHAR(20) DEFAULT 'arduino_mega2560',
  connectivity VARCHAR(10) DEFAULT 'gsm', -- gsm/gprs
  has_ph_sensor BOOLEAN DEFAULT true,
  has_relay_module BOOLEAN DEFAULT true,
  relay_channel_map JSONB DEFAULT '{"1":"irrigation_pump","2":"fertigation_valve_a","3":"fertigation_valve_b","4":"spare"}',
  last_seen TIMESTAMPTZ
);

CREATE TABLE sensor_readings (
  id BIGSERIAL PRIMARY KEY,
  sensor_node_id UUID REFERENCES sensor_nodes(id),
  soil_ph NUMERIC,
  soil_moisture_pct NUMERIC,   -- nullable until a moisture probe is added; pH sensor is the confirmed input for now
  soil_ec NUMERIC,             -- nullable, same reason
  transport VARCHAR(10) DEFAULT 'gprs', -- gprs/sms — how this reading arrived
  reading_time TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE actuation_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_node_id UUID REFERENCES sensor_nodes(id),
  relay_channel INT NOT NULL,       -- 1-4
  action VARCHAR(10) NOT NULL,      -- on/off
  reason VARCHAR(30) NOT NULL,      -- auto_dry_spell / auto_ph_correction / manual_officer_override
  triggered_by VARCHAR(20) NOT NULL, -- system/officer_id
  sent_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,          -- ack received back from the node
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plot_id UUID REFERENCES plots(id),
  alert_type VARCHAR(20) NOT NULL, -- irrigation/fertigation/dry_spell/ph_out_of_range
  severity VARCHAR(10) NOT NULL,   -- advisory/warning/critical
  message_text TEXT NOT NULL,
  delivered_via VARCHAR(10),       -- voice/sms/both
  delivered_at TIMESTAMPTZ,
  auto_action_id UUID REFERENCES actuation_commands(id), -- set if this alert also triggered a relay action
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE health_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id),
  plot_id UUID REFERENCES plots(id),
  media_url TEXT,           -- photo, if any
  voice_transcript TEXT,    -- if reported by voice
  ai_diagnosis TEXT,
  ai_confidence NUMERIC,
  severity_estimate VARCHAR(10),
  status VARCHAR(20) DEFAULT 'pending', -- pending/self_care/escalated/resolved
  assigned_rsk_officer_id UUID,
  officer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE rsk_officers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rsk_location TEXT,
  phone_number VARCHAR(15),
  covers_district TEXT
);

CREATE TABLE call_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id),
  channel VARCHAR(10) NOT NULL, -- voice/sms
  intent VARCHAR(30),           -- weather/recommendation/report_issue
  transcript JSONB,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);
