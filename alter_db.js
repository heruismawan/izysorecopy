import mysql from 'mysql2/promise';
import 'dotenv/config';

async function main() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'izystore_db',
    });

    console.log('Connected to MySQL');
    
    // Add admin_fee column if it doesn't exist
    try {
      await connection.query('ALTER TABLE transactions ADD COLUMN admin_fee INT DEFAULT 0');
      console.log('Successfully added admin_fee column to transactions');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Column admin_fee already exists in transactions');
      } else {
        throw e;
      }
    }

    await connection.end();
  } catch (err) {
    console.error('Database connection or query failed: ', err);
  }
}

main();
