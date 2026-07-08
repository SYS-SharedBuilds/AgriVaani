const { Client } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runSeed() {
  await client.connect();
  console.log('Connected to database for seeding.');

  try {
    // 2. Insert 5 demo farmers
    const farmersResult = await client.query(`
      INSERT INTO farmers (phone_number, preferred_language, name, village, district, state)
      VALUES 
        ('9876543210', 'hi', 'Ramesh Kumar', 'Kondapur', 'Medak', 'Telangana'),
        ('9876543211', 'te', 'Srinivas Rao', 'Gachibowli', 'Rangareddy', 'Telangana'),
        ('9876543212', 'hi', 'Sunita Devi', 'Madhapur', 'Hyderabad', 'Telangana'),
        ('9876543213', 'te', 'Nageshwar', 'Kukatpally', 'Medchal', 'Telangana'),
        ('9876543214', 'hi', 'Amit Singh', 'Secunderabad', 'Hyderabad', 'Telangana')
      ON CONFLICT (phone_number) DO NOTHING
      RETURNING id, name;
    `);
    
    // We can fetch farmers back in case they already existed
    const farmers = await client.query('SELECT id, name, phone_number FROM farmers');
    console.log(`Farmers in DB: ${farmers.rowCount}`);

    // Insert some RSK Officers
    await client.query(`
      INSERT INTO rsk_officers (name, rsk_location, phone_number, covers_district)
      VALUES
        ('Officer Reddy', 'Medak RSK', '8888888881', 'Medak'),
        ('Officer Sharma', 'Hyderabad Central', '8888888882', 'Hyderabad')
      ON CONFLICT DO NOTHING;
    `);

    // We can create plots for the first two farmers
    if (farmers.rows.length >= 2) {
      const farmer1 = farmers.rows[0];
      const farmer2 = farmers.rows[1];

      // Plot for Farmer 1: Drought-prone
      const plot1Res = await client.query(`
        INSERT INTO plots (farmer_id, latitude, longitude, area_hectares, soil_ph, soil_n, soil_p, soil_k, groundwater_depth_m)
        VALUES ($1, 17.44, 78.34, 1.5, 7.8, 120, 20, 150, 45.5)
        RETURNING id;
      `, [farmer1.id]);
      
      // Plot for Farmer 2: Good groundwater
      const plot2Res = await client.query(`
        INSERT INTO plots (farmer_id, latitude, longitude, area_hectares, soil_ph, soil_n, soil_p, soil_k, groundwater_depth_m)
        VALUES ($1, 17.50, 78.30, 2.0, 6.5, 200, 45, 250, 12.0)
        RETURNING id;
      `, [farmer2.id]);

      const plot1Id = plot1Res.rows[0].id;
      const plot2Id = plot2Res.rows[0].id;

      // Insert Sensor Nodes
      await client.query(`
        INSERT INTO sensor_nodes (plot_id, device_id, sim_msisdn, controller)
        VALUES 
          ($1, 'SIM800_DEV_01', '9000000001', 'arduino_mega2560'),
          ($2, 'SIM800_DEV_02', '9000000002', 'arduino_mega2560')
        ON CONFLICT (device_id) DO NOTHING;
      `, [plot1Id, plot2Id]);

      // Seed a few Alerts for Demo
      await client.query(`
        INSERT INTO alerts (plot_id, alert_type, severity, message_text, delivered_via)
        VALUES 
          ($1, 'dry_spell', 'critical', 'No rain forecast. Critical irrigation alert.', 'sms'),
          ($2, 'ph_out_of_range', 'warning', 'Soil pH is 5.2. Apply lime.', 'voice')
      `, [plot1Id, plot2Id]);

      // Seed a few Health Cases for Demo Dashboard
      await client.query(`
        INSERT INTO health_cases (farmer_id, plot_id, voice_transcript, ai_diagnosis, ai_confidence, severity_estimate, status)
        VALUES 
          ($1, $2, 'Patte peele pad rahe hain.', 'Nitrogen Deficiency', 0.85, 'medium', 'pending'),
          ($3, $4, 'Patton par safed dhabbe hain.', 'Powdery Mildew', 0.40, 'high', 'escalated')
      `, [farmer1.id, plot1Id, farmer2.id, plot2Id]);

      console.log('Plots, Sensor Nodes, Alerts, and Health Cases created.');
    }

    console.log('Seed completed successfully.');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await client.end();
  }
}

runSeed();
