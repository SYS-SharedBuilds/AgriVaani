import { Request, Response } from 'express';
import { query } from '../db';

export const ingestTelemetry = async (req: Request, res: Response) => {
  const { deviceId } = req.params;
  const { soil_ph, soil_moisture_pct, soil_ec, transport = 'gprs' } = req.body;

  try {
    // 1. Find node
    const nodeRes = await query('SELECT id FROM sensor_nodes WHERE device_id = $1', [deviceId]);
    if (nodeRes.rowCount === 0) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Sensor node not found' } });
    }
    const nodeId = nodeRes.rows[0].id;

    // 2. Insert reading
    await query(`
      INSERT INTO sensor_readings (sensor_node_id, soil_ph, soil_moisture_pct, soil_ec, transport)
      VALUES ($1, $2, $3, $4, $5)
    `, [nodeId, soil_ph, soil_moisture_pct, soil_ec, transport]);

    // 3. Update last_seen
    await query('UPDATE sensor_nodes SET last_seen = now() WHERE id = $1', [nodeId]);

    // 4. Update plot's soil_ph based on this latest reading (simple moving avg or just overwrite for demo)
    await query(`
      UPDATE plots p
      SET soil_ph = $1
      FROM sensor_nodes n
      WHERE n.plot_id = p.id AND n.id = $2
    `, [soil_ph, nodeId]);

    res.json({ status: 'success', message: 'Telemetry ingested' });
  } catch (error) {
    console.error('Ingestion error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Database error' } });
  }
};

export const getCommands = async (req: Request, res: Response) => {
  const { deviceId } = req.params;
  
  try {
    const nodeRes = await query('SELECT id FROM sensor_nodes WHERE device_id = $1', [deviceId]);
    if (nodeRes.rowCount === 0) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Sensor node not found' } });
    }
    const nodeId = nodeRes.rows[0].id;

    // Fetch unconfirmed commands
    const cmds = await query(`
      SELECT id, relay_channel, action 
      FROM actuation_commands 
      WHERE sensor_node_id = $1 AND confirmed_at IS NULL
      ORDER BY created_at ASC
    `, [nodeId]);

    // Mark them as sent
    if (cmds.rowCount && cmds.rowCount > 0) {
      const ids = cmds.rows.map(r => r.id);
      await query(`UPDATE actuation_commands SET sent_at = now() WHERE id = ANY($1)`, [ids]);
    }

    res.json({ commands: cmds.rows });
  } catch (error) {
    console.error('Commands error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Database error' } });
  }
};

export const getAlerts = async (req: Request, res: Response) => {
    const { plotId } = req.params;
    try {
        const alerts = await query(`SELECT * FROM alerts WHERE plot_id = $1 ORDER BY created_at DESC LIMIT 10`, [plotId]);
        res.json({ alerts: alerts.rows });
    } catch (error) {
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Database error' } });
    }
};
