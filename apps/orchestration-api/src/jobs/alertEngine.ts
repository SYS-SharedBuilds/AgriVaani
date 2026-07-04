import { query } from '../db';

// Cron job equivalent logic for evaluating alerts
export const evaluateAlerts = async () => {
  console.log('Evaluating alerts for all plots...');
  
  try {
    const plots = await query(`
      SELECT p.id, p.soil_ph, p.groundwater_depth_m, p.farmer_id, f.phone_number, f.name as farmer_name
      FROM plots p
      JOIN farmers f ON p.farmer_id = f.id
    `);

    for (const plot of plots.rows) {
      const { id: plot_id, soil_ph, groundwater_depth_m, farmer_name } = plot;

      // Rule 1: pH out of range (Optimal is roughly 6.0 - 7.5 for many crops)
      if (soil_ph && (soil_ph < 5.5 || soil_ph > 8.0)) {
        // Check if alert already exists in last 24 hours
        const recentAlerts = await query(`
          SELECT id FROM alerts 
          WHERE plot_id = $1 AND alert_type = 'ph_out_of_range' 
          AND created_at > now() - interval '24 hours'
        `, [plot_id]);

        if (recentAlerts.rowCount === 0) {
          console.log(`[ALERT] Plot ${plot_id} pH out of range: ${soil_ph}`);
          await query(`
            INSERT INTO alerts (plot_id, alert_type, severity, message_text, delivered_via)
            VALUES ($1, 'ph_out_of_range', 'warning', 'Your soil pH is currently ' || $2 || ', which is outside the optimal range. Consider applying lime or appropriate fertilizers.', 'sms')
          `, [plot_id, soil_ph]);
        }
      }
      
      // Rule 2: Deterministic Dry Spell simulation for Demo
      // We use the farmer's plot with deep groundwater (>40m) to deterministically trigger a dry spell alert
      if (groundwater_depth_m > 40.0) {
         const recentDryAlerts = await query(`
          SELECT id FROM alerts 
          WHERE plot_id = $1 AND alert_type = 'dry_spell' 
          AND created_at > now() - interval '24 hours'
        `, [plot_id]);

        if (recentDryAlerts.rowCount === 0) {
          console.log(`[ALERT] Plot ${plot_id} (${farmer_name}) experiencing dry spell`);
          await query(`
            INSERT INTO alerts (plot_id, alert_type, severity, message_text, delivered_via)
            VALUES ($1, 'dry_spell', 'critical', 'No rain forecast and deep groundwater detected. Critical irrigation alert. Please activate pump.', 'sms')
          `, [plot_id]);
        }
      }
    }
  } catch (error) {
    console.error('Error evaluating alerts:', error);
  }
};
