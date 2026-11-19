import mysql from 'mysql2/promise';
import { initialInventory } from './src/data/mockData.js';

async function seed() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'izystore_db',
  });

  try {
    console.log('Menghapus tabel products lama (jika ada)...');
    await pool.query(`DROP TABLE IF EXISTS transaction_items`); // hapus relasi dulu
    await pool.query(`DROP TABLE IF EXISTS products`);

    console.log('Membuat tabel products baru...');
    await pool.query(`
      CREATE TABLE products (
        id varchar(50) PRIMARY KEY,
        sku varchar(100),
        imei varchar(50),
        brand varchar(50),
        model varchar(100),
        warna varchar(50),
        rom varchar(50),
        kondisi varchar(50),
        hargaBeli decimal(15,2),
        hargaJual decimal(15,2),
        stok int,
        kategori varchar(50),
        garansiAsal varchar(50),
        garansiAktif boolean,
        gradeFisik varchar(10),
        minus text,
        createdAt varchar(50)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('Memasukkan data dari mockData.js...');
    for (const item of initialInventory) {
      await pool.query(`
        INSERT INTO products (
          id, sku, imei, brand, model, warna, rom, kondisi, 
          hargaBeli, hargaJual, stok, kategori, 
          garansiAsal, garansiAktif, gradeFisik, minus, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        item.id, 
        item.sku || null, 
        item.imei || null, 
        item.brand || null, 
        item.model || null, 
        item.warna || null, 
        item.rom || null, 
        item.kondisi || null, 
        item.hargaBeli || 0, 
        item.hargaJual || 0, 
        item.stok || 0, 
        item.kategori || null, 
        item.garansiAsal || null, 
        item.garansiAktif ? 1 : 0, 
        item.gradeFisik || null, 
        item.minus || null, 
        item.createdAt || new Date().toISOString()
      ]);
    }
    console.log(`✅ Berhasil memasukkan ${initialInventory.length} produk ke database!`);

    // Recreate transaction_items simply without constraints for now, or match old structure
    await pool.query(`
      CREATE TABLE transaction_items (
        id int(11) NOT NULL AUTO_INCREMENT,
        transaction_id int(11) NOT NULL,
        product_id varchar(50) NOT NULL,
        quantity int(11) NOT NULL,
        price decimal(10,2) NOT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

  } catch (error) {
    console.error('Terjadi kesalahan:', error);
  } finally {
    process.exit(0);
  }
}

seed();
