import mysql from 'mysql2/promise';

const initialExpenses = [
  { id: 'e1', date: '2026-06-05T09:00:00Z', category: 'Minuman', amount: 35000, description: 'Beli air mineral gelas 1 dus' },
  { id: 'e2', date: '2026-06-08T14:30:00Z', category: 'Cemilan', amount: 50000, description: 'Beli biskuit dan snack customer' }
];

async function run() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'izystore_db',
  });

  try {
    console.log('Membuat tabel expenses...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR(50) PRIMARY KEY,
        date DATETIME NOT NULL,
        category VARCHAR(100) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        description TEXT
      )
    `);

    console.log('Menghapus data expenses lama (jika ada)...');
    await pool.query('TRUNCATE TABLE expenses');

    console.log('Menambahkan data expenses awal...');
    for (const e of initialExpenses) {
      await pool.query(`
        INSERT INTO expenses 
        (id, date, category, amount, description)
        VALUES (?, ?, ?, ?, ?)
      `, [
        e.id, new Date(e.date), e.category, e.amount, e.description
      ]);
    }
    console.log('✅ Migrasi tabel expenses berhasil!');
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
  } finally {
    process.exit(0);
  }
}

run();
