import mysql from 'mysql2/promise';
import { initialTransactions } from './src/data/mockData.js';

async function seed() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'izystore_db',
  });

  try {
    console.log('Menghapus tabel transaksi lama...');
    await pool.query(`DROP TABLE IF EXISTS transaction_items`);
    await pool.query(`DROP TABLE IF EXISTS transactions`);

    console.log('Membuat tabel transactions baru...');
    await pool.query(`
      CREATE TABLE transactions (
        id varchar(50) PRIMARY KEY,
        invoiceNo varchar(50),
        date varchar(50),
        salesperson varchar(50),
        helper varchar(50),
        salespersonRole varchar(50),
        discount decimal(15,2),
        total decimal(15,2),
        paymentMethod varchar(50),
        cashAmount decimal(15,2),
        changeAmount decimal(15,2),
        type varchar(50),
        customerName varchar(100),
        customerPhone varchar(50),
        isSplitPayment boolean,
        splitDetails json,
        tradeInDetails json,
        deviceModel varchar(100),
        issueDescription text,
        jasaVal decimal(15,2),
        spareparts json
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('Membuat tabel transaction_items baru...');
    await pool.query(`
      CREATE TABLE transaction_items (
        id int(11) NOT NULL AUTO_INCREMENT,
        transaction_id varchar(50) NOT NULL,
        product_id varchar(50) NOT NULL,
        brand varchar(50),
        model varchar(100),
        kondisi varchar(50),
        kategori varchar(50),
        imei varchar(50),
        qty int(11) NOT NULL,
        hargaBeli decimal(15,2) NOT NULL,
        hargaJual decimal(15,2) NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('Memasukkan data riwayat transaksi lama...');
    for (const trx of initialTransactions) {
      await pool.query(`
        INSERT INTO transactions (
          id, invoiceNo, date, salesperson, helper, salespersonRole, discount, total,
          paymentMethod, cashAmount, changeAmount, type, customerName, customerPhone,
          isSplitPayment, splitDetails, tradeInDetails, deviceModel, issueDescription,
          jasaVal, spareparts
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        trx.id,
        trx.invoiceNo,
        trx.date,
        trx.salesperson || null,
        trx.helper || null,
        trx.salespersonRole || null,
        trx.discount || 0,
        trx.total || 0,
        trx.paymentMethod || null,
        trx.cashAmount || 0,
        trx.changeAmount || 0,
        trx.type || null,
        trx.customerName || null,
        trx.customerPhone || null,
        trx.isSplitPayment ? 1 : 0,
        trx.splitDetails ? JSON.stringify(trx.splitDetails) : null,
        trx.tradeInDetails ? JSON.stringify(trx.tradeInDetails) : null,
        trx.deviceModel || null,
        trx.issueDescription || null,
        trx.jasaVal || 0,
        trx.spareparts ? JSON.stringify(trx.spareparts) : null
      ]);

      // Insert items
      if (trx.items && trx.items.length > 0) {
        for (const item of trx.items) {
          await pool.query(`
            INSERT INTO transaction_items (
              transaction_id, product_id, brand, model, kondisi, kategori, imei, qty, hargaBeli, hargaJual
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            trx.id,
            item.id,
            item.brand || null,
            item.model || null,
            item.kondisi || null,
            item.kategori || null,
            item.imei || null,
            item.qty || 1,
            item.hargaBeli || 0,
            item.hargaJual || 0
          ]);
        }
      }
    }

    console.log('✅ Migrasi transaksi selesai!');

  } catch (error) {
    console.error('Terjadi kesalahan:', error);
  } finally {
    process.exit(0);
  }
}

seed();
