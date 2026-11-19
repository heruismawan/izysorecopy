import mysql from 'mysql2/promise';

const initialWarrantyClaims = [
  {
    id: 'w1',
    imei: '862491053748291',
    customerName: 'Ahmad Faisal',
    customerPhone: '081234567890',
    claimDate: '2026-06-03T11:00:00Z',
    issueDescription: 'Layar berkedip hijau setelah pemakaian 3 minggu',
    status: 'Dalam Perbaikan',
    notes: 'Unit dikirim ke Service Center Apple.'
  }
];

async function run() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'izystore_db',
  });

  try {
    console.log('Membuat tabel warranty_claims...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS warranty_claims (
        id VARCHAR(50) PRIMARY KEY,
        imei VARCHAR(50) NOT NULL,
        customerName VARCHAR(100) NOT NULL,
        customerPhone VARCHAR(50) NOT NULL,
        claimDate DATETIME NOT NULL,
        issueDescription TEXT,
        status VARCHAR(50) NOT NULL,
        notes TEXT
      )
    `);

    console.log('Menghapus data garansi lama (jika ada)...');
    await pool.query('TRUNCATE TABLE warranty_claims');

    console.log('Menambahkan data garansi awal...');
    for (const c of initialWarrantyClaims) {
      await pool.query(`
        INSERT INTO warranty_claims 
        (id, imei, customerName, customerPhone, claimDate, issueDescription, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        c.id, c.imei, c.customerName, c.customerPhone, new Date(c.claimDate), 
        c.issueDescription, c.status, c.notes
      ]);
    }
    console.log('✅ Migrasi tabel warranty_claims berhasil!');
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
  } finally {
    process.exit(0);
  }
}

run();
