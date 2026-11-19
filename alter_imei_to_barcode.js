import mysql from 'mysql2/promise';

async function run() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'izystore_db',
  });

  try {
    console.log('Mengubah nama kolom imei menjadi barcode pada tabel products...');
    await pool.query(`ALTER TABLE products CHANGE imei barcode varchar(50)`);
    console.log('✅ Berhasil!');
  } catch (error) {
    console.error('Terjadi kesalahan (mungkin kolom sudah diganti?):', error);
  } finally {
    process.exit(0);
  }
}

run();
