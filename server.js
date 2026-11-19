import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import 'dotenv/config';
import jwt from 'jsonwebtoken';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Konfigurasi koneksi ke MySQL (XAMPP)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'izystore_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ==========================================
// PUBLIC ROUTES (No Token Required)
// ==========================================

// Endpoint untuk mengecek apakah server jalan
app.get('/api/ping', (req, res) => {
  res.json({ message: 'Server berjalan dengan baik!' });
});

// Endpoint untuk mendapatkan daftar pengguna (login avatar selection)
// PERHATIAN: PIN Dihilangkan dari hasil query untuk keamanan!
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, name, role, created_at FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Gagal mengambil data pengguna dari database' });
  }
});

app.post('/api/users', async (req, res) => {
  const { username, name, role, pin } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO users (username, name, role, pin) VALUES (?, ?, ?, ?)', [username, name, role, pin]);
    res.json({ success: true, message: 'User ditambahkan', id: result.insertId });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ error: 'Gagal menambah data user' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'User dihapus' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Gagal menghapus data user' });
  }
});

app.put('/api/users/:id/role', async (req, res) => {
  const { role } = req.body;
  try {
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ success: true, message: 'Role diupdate' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Gagal mengupdate role user' });
  }
});

app.put('/api/users/:id/pin', async (req, res) => {
  const { pin } = req.body;
  try {
    await pool.query('UPDATE users SET pin = ? WHERE id = ?', [pin, req.params.id]);
    res.json({ success: true, message: 'PIN diupdate' });
  } catch (error) {
    console.error('Error updating user pin:', error);
    res.status(500).json({ error: 'Gagal mengupdate PIN user' });
  }
});

// Endpoint untuk login menggunakan username dan PIN
app.post('/api/login', async (req, res) => {
  const { username, pin } = req.body;
  const ip_address = req.ip || req.connection.remoteAddress || 'unknown';
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE username = ? AND pin = ?', [username, pin]);
    if (users.length > 0) {
      const user = users[0];
      // Catat history login berhasil
      await pool.query('INSERT INTO login_history (username, status, ip_address) VALUES (?, ?, ?)', [user.username, 'Sukses', ip_address]);
      
      // Hapus PIN dari response untuk keamanan
      const { pin: userPin, ...safeUser } = user;
      
      // Generate Token (Berlaku 12 Jam)
      const accessToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'super_secret_izystore_key_2026',
        { expiresIn: '12h' }
      );
      
      res.json({ success: true, user: safeUser, token: accessToken });
    } else {
      // Catat history login gagal
      await pool.query('INSERT INTO login_history (username, status, ip_address) VALUES (?, ?, ?)', [username || 'unknown', 'Gagal', ip_address]);
      res.status(401).json({ success: false, message: 'PIN atau Username salah' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server saat login' });
  }
});

// ==========================================
// JWT AUTHENTICATION MIDDLEWARE
// ==========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
  
  if (!token) return res.status(401).json({ error: 'Akses Ditolak: Token tidak ditemukan' });

  jwt.verify(token, process.env.JWT_SECRET || 'super_secret_izystore_key_2026', (err, user) => {
    if (err) return res.status(403).json({ error: 'Sesi anda telah berakhir, silahkan login kembali' });
    req.user = user;
    next();
  });
};

// ==========================================
// PROTECTED ROUTES (Token Required)
// ==========================================

app.use('/api', authenticateToken); // Apply to all routes below

// Endpoint untuk mendapatkan riwayat login (hanya owner)
app.get('/api/login-history', async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Hanya owner yang bisa melihat riwayat login' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM login_history ORDER BY login_time DESC LIMIT 100');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching login history:', error);
    res.status(500).json({ error: 'Gagal mengambil riwayat login' });
  }
});

// Endpoint untuk mendapatkan daftar produk (inventory)
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Gagal mengambil data produk' });
  }
});

// Endpoint untuk menambahkan produk baru
app.post('/api/products', async (req, res) => {
  const p = req.body;
  try {
    await pool.query(`
      INSERT INTO products (
        id, sku, barcode, brand, model, warna, rom, kondisi, hargaBeli, hargaJual, 
        stok, kategori, garansiAsal, garansiAktif, gradeFisik, minus, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      p.id, p.sku, p.barcode, p.brand, p.model, p.warna, p.rom, p.kondisi, 
      p.hargaBeli, p.hargaJual, p.stok, p.kategori, p.garansiAsal, 
      p.garansiAktif ? 1 : 0, p.gradeFisik, p.minus, p.createdAt
    ]);
    res.json({ success: true, message: 'Produk berhasil ditambahkan' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Gagal menambahkan produk' });
  }
});

// Endpoint untuk mengedit produk
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const p = req.body;
  try {
    await pool.query(`
      UPDATE products 
      SET sku=?, barcode=?, brand=?, model=?, warna=?, rom=?, kondisi=?, 
          hargaBeli=?, hargaJual=?, stok=?, kategori=?, garansiAsal=?, 
          garansiAktif=?, gradeFisik=?, minus=?
      WHERE id=?
    `, [
      p.sku, p.barcode, p.brand, p.model, p.warna, p.rom, p.kondisi, 
      p.hargaBeli, p.hargaJual, p.stok, p.kategori, p.garansiAsal, 
      p.garansiAktif ? 1 : 0, p.gradeFisik, p.minus, id
    ]);
    res.json({ success: true, message: 'Produk berhasil diupdate' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Gagal mengupdate produk' });
  }
});

// Endpoint untuk menghapus produk
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM products WHERE id=?', [id]);
    res.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Gagal menghapus produk' });
  }
});

// Endpoint untuk mendapatkan riwayat transaksi
app.get('/api/transactions', async (req, res) => {
  try {
    const [transactions] = await pool.query('SELECT * FROM transactions ORDER BY date DESC');
    for (let trx of transactions) {
      const [items] = await pool.query('SELECT * FROM transaction_items WHERE transaction_id = ?', [trx.id]);
      trx.items = items;
      if (typeof trx.splitDetails === 'string') trx.splitDetails = JSON.parse(trx.splitDetails);
      if (typeof trx.tradeInDetails === 'string') trx.tradeInDetails = JSON.parse(trx.tradeInDetails);
      if (typeof trx.spareparts === 'string') trx.spareparts = JSON.parse(trx.spareparts);
    }
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Gagal mengambil data transaksi' });
  }
});

// Endpoint untuk menyimpan transaksi baru
app.post('/api/transactions', async (req, res) => {
  const trx = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`
      INSERT INTO transactions (
        id, invoiceNo, date, salesperson, helper, salespersonRole, discount, total,
        paymentMethod, cashAmount, changeAmount, type, customerName, customerPhone,
        isSplitPayment, splitDetails, tradeInDetails, deviceModel, issueDescription,
        jasaVal, spareparts, admin_fee, network_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      trx.id, trx.invoiceNo, trx.date, trx.salesperson, trx.helper, trx.salespersonRole, 
      trx.discount, trx.total, trx.paymentMethod, trx.cashAmount, trx.changeAmount, 
      trx.type, trx.customerName, trx.customerPhone, trx.isSplitPayment ? 1 : 0, 
      trx.splitDetails ? JSON.stringify(trx.splitDetails) : null, 
      trx.tradeInDetails ? JSON.stringify(trx.tradeInDetails) : null, 
      trx.deviceModel, trx.issueDescription, trx.jasaVal, 
      trx.spareparts ? JSON.stringify(trx.spareparts) : null,
      trx.adminFee || 0,
      trx.network_status || null
    ]);

    if (trx.items && trx.items.length > 0) {
      for (const item of trx.items) {
        await conn.query(`
          INSERT INTO transaction_items (transaction_id, product_id, brand, model, kondisi, kategori, imei, barcode, qty, hargaBeli, hargaJual) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [trx.id, item.id, item.brand, item.model, item.kondisi, item.kategori, item.imei, item.barcode, item.qty, item.hargaBeli, item.hargaJual]);
        
        // Kurangi stok sesuai dengan jumlah yang dibeli (qty)
        await conn.query('UPDATE products SET stok = stok - ? WHERE id = ?', [item.qty, item.id]);
      }
    }

    if (trx.tradeInDetails && trx.tradeInDetails.isTradeIn) {
      const ti = trx.tradeInDetails;
      const tradeInId = 'p_trade_' + Date.now();
      const sku = `TI-${ti.brand.slice(0,3).toUpperCase()}-${ti.model.replace(/\s+/g,'').toUpperCase()}-SECO`;
      await conn.query(`
        INSERT INTO products (
          id, sku, barcode, brand, model, warna, rom, kondisi, hargaBeli, hargaJual, 
          stok, kategori, garansiAsal, garansiAktif, gradeFisik, minus, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Bekas', ?, ?, 1, 'Gadget', ?, ?, ?, ?, ?)
      `, [
        tradeInId, sku, ti.barcode || ti.imei || '', ti.brand, ti.model, ti.warna || 'Default', ti.rom || '-', 
        ti.taksiranHarga, ti.hargaJual > 0 ? ti.hargaJual : Math.round(ti.taksiranHarga * 1.25), 
        ti.garansiAsal || 'Inter', 0, ti.gradeFisik || 'B', ti.minus || '', trx.date
      ]);
    }

    await conn.commit();
    res.json({ success: true, message: 'Transaksi berhasil disimpan' });
  } catch (error) {
    await conn.rollback();
    console.error('Error saving transaction:', error);
    res.status(500).json({ error: 'Gagal menyimpan transaksi ke database' });
  } finally {
    conn.release();
  }
});

// Endpoint untuk mengupdate finansial transaksi (Owner)
app.put('/api/transactions/:id', async (req, res) => {
  const { total, items, salesperson, helper } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    // Update total bayar, salesperson, dan helper di tabel transactions
    await conn.query('UPDATE transactions SET total = ?, salesperson = ?, helper = ? WHERE id = ?', [total, salesperson, helper || null, req.params.id]);
    
    // Update harga modal dan jual untuk masing-masing item di tabel transaction_items
    if (items && items.length > 0) {
      for (const item of items) {
        if (item.id) {
          await conn.query('UPDATE transaction_items SET hargaBeli = ?, hargaJual = ? WHERE id = ?', [item.hargaBeli, item.hargaJual, item.id]);
        }
      }
    }
    
    await conn.commit();
    res.json({ success: true, message: 'Transaksi berhasil diupdate' });
  } catch (error) {
    await conn.rollback();
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Gagal mengupdate transaksi di database' });
  } finally {
    conn.release();
  }
});

// Endpoint untuk menghapus transaksi (Owner)
app.delete('/api/transactions/:id', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    // Kembalikan stok untuk semua item di transaksi ini
    const [items] = await conn.query('SELECT product_id, qty FROM transaction_items WHERE transaction_id = ?', [req.params.id]);
    for (const item of items) {
      await conn.query('UPDATE products SET stok = stok + ? WHERE id = ?', [item.qty, item.product_id]);
    }
    
    // Hapus items dari transaction_items (meski mungkin otomatis jika ON DELETE CASCADE, lebih aman eksplisit)
    await conn.query('DELETE FROM transaction_items WHERE transaction_id = ?', [req.params.id]);
    
    // Hapus transaksi
    await conn.query('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    
    await conn.commit();
    res.json({ success: true, message: 'Transaksi berhasil dihapus' });
  } catch (error) {
    await conn.rollback();
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Gagal menghapus transaksi dari database' });
  } finally {
    conn.release();
  }
});

app.get('/api/salespersons', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM salespersons ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching salespersons:', error);
    res.status(500).json({ error: 'Gagal mengambil data salespersons' });
  }
});

app.post('/api/salespersons', async (req, res) => {
  const { id, name } = req.body;
  try {
    await pool.query('INSERT INTO salespersons (id, name) VALUES (?, ?)', [id, name]);
    res.json({ success: true, message: 'Salesperson ditambahkan' });
  } catch (error) {
    console.error('Error adding salesperson:', error);
    res.status(500).json({ error: 'Gagal menambah data salesperson' });
  }
});

app.delete('/api/salespersons/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM salespersons WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Salesperson dihapus' });
  } catch (error) {
    console.error('Error deleting salesperson:', error);
    res.status(500).json({ error: 'Gagal menghapus data salesperson' });
  }
});

app.get('/api/warranty', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM warranty_claims ORDER BY claimDate DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching warranty claims:', error);
    res.status(500).json({ error: 'Gagal mengambil data klaim garansi' });
  }
});

app.post('/api/warranty', async (req, res) => {
  const c = req.body;
  try {
    await pool.query(`INSERT INTO warranty_claims (id, imei, customerName, customerPhone, claimDate, issueDescription, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
      [c.id, c.imei, c.customerName, c.customerPhone, new Date(c.claimDate), c.issueDescription, c.status, c.notes]);
    res.json({ success: true, message: 'Klaim garansi berhasil disimpan' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menyimpan klaim garansi' });
  }
});

app.put('/api/warranty/:id/status', async (req, res) => {
  try {
    await pool.query(`UPDATE warranty_claims SET status = ?, notes = ? WHERE id = ?`, [req.body.status, req.body.notes, req.params.id]);
    res.json({ success: true, message: 'Status klaim berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengupdate status garansi' });
  }
});

app.get('/api/expenses', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM expenses ORDER BY date DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data pengeluaran' });
  }
});

app.post('/api/expenses', async (req, res) => {
  const e = req.body;
  try {
    await pool.query(`INSERT INTO expenses (id, date, category, amount, description) VALUES (?, ?, ?, ?, ?)`, [e.id, new Date(e.date), e.category, e.amount, e.description]);
    res.json({ success: true, message: 'Pengeluaran berhasil disimpan' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menyimpan pengeluaran' });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM expenses WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Pengeluaran berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus pengeluaran' });
  }
});

app.listen(port, () => {
  console.log(`Backend API berjalan di http://localhost:${port}`);
});
