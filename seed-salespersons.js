import mysql from 'mysql2/promise';
import { initialSalespersons } from './src/data/mockData.js';

async function seed() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'izystore_db',
  });

  try {
    console.log('Menghapus tabel salespersons lama (jika ada)...');
    await pool.query(`DROP TABLE IF EXISTS salespersons`);

    console.log('Membuat tabel salespersons baru...');
    await pool.query(`
      CREATE TABLE salespersons (
        id varchar(50) PRIMARY KEY,
        name varchar(100) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('Memasukkan data riwayat helper lama...');
    for (const s of initialSalespersons) {
      await pool.query(`
        INSERT INTO salespersons (id, name) VALUES (?, ?)
      `, [s.id, s.name]);
    }

    console.log('✅ Migrasi daftar helper/sales selesai!');

  } catch (error) {
    console.error('Terjadi kesalahan:', error);
  } finally {
    process.exit(0);
  }
}

seed();
