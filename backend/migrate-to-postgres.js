const { Pool } = require('pg');

// Use DATABASE_URL from environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createTables() {
  const client = await pool.connect();
  
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Site config table
    await client.query(`
      CREATE TABLE IF NOT EXISTS site_config (
        id INTEGER PRIMARY KEY DEFAULT 1,
        site_name TEXT DEFAULT 'Portfolio Website',
        tagline TEXT DEFAULT 'Building Amazing Digital Experiences',
        logo_url TEXT,
        primary_color TEXT DEFAULT '#007AFF',
        secondary_color TEXT DEFAULT '#5856D6',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default admin user
    await client.query(`
      INSERT INTO users (name, email, password, role) 
      VALUES ('Admin', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
      ON CONFLICT (email) DO NOTHING
    `);

    // Insert default site config
    await client.query(`
      INSERT INTO site_config (id, site_name, tagline, primary_color, secondary_color) 
      VALUES (1, 'Portfolio Website', 'Building Amazing Digital Experiences', '#007AFF', '#5856D6')
      ON CONFLICT (id) DO NOTHING
    `);

    console.log('✅ PostgreSQL tables created successfully!');
  } catch (err) {
    console.error('❌ Error creating tables:', err);
  } finally {
    client.release();
  }
}

createTables();