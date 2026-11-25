import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

/**
 * ============================================================================
 * UNIT UNDER TEST: 8 FITUR UTAMA IZYSTORE (src/context/AppContext.jsx & LoginView.jsx)
 * ============================================================================
 */

// 1. FITUR 1: Login Akun (Email & Password)
export function loginUser(email, password, usersList, setCurrentUser) {
  if (!email || !password) {
    return { success: false, message: 'Email dan Password wajib diisi!' };
  }
  const clean = email.trim().toLowerCase();
  const user = usersList.find(
    (u) => (u.email && u.email.toLowerCase() === clean) || (u.username && u.username.toLowerCase() === clean)
  );
  if (user && String(user.pin) === password.trim()) {
    setCurrentUser(user);
    return { success: true, message: 'Login Berhasil!', user };
  }
  return { success: false, message: 'Email atau Password salah!' };
}

// 2. FITUR 2: Register Staf Baru
export function registerUser(newUser, usersList, setUsersList) {
  const { name, email, username, password } = newUser;
  if (!email || !password || !name) {
    return { success: false, message: 'Semua kolom wajib diisi!' };
  }
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, message: 'Format email tidak valid!' };
  }
  if (usersList.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, message: 'Email sudah digunakan oleh akun lain!' };
  }
  const createdUser = {
    id: 'u_' + Date.now(),
    name,
    email: cleanEmail,
    username: (username || cleanEmail.split('@')[0]).trim().toLowerCase(),
    pin: password,
    role: 'Kasir'
  };
  setUsersList([...usersList, createdUser]);
  return { success: true, user: createdUser };
}

// 3. FITUR 3: Lupa Password (Reset via Email)
export function resetUserPassword(identifier, newPin, usersList, setUsersList) {
  if (!identifier || !newPin || newPin.trim().length < 4) {
    return { success: false, message: 'Identifier dan PIN baru (min 4 karakter) wajib valid!' };
  }
  const clean = identifier.trim().toLowerCase();
  let found = false;
  const updated = usersList.map((u) => {
    if ((u.email && u.email.toLowerCase() === clean) || (u.username && u.username.toLowerCase() === clean)) {
      found = true;
      return { ...u, pin: newPin.trim() };
    }
    return u;
  });
  if (!found) {
    return { success: false, message: 'Email tidak ditemukan!' };
  }
  setUsersList(updated);
  return { success: true, message: 'Password berhasil direset!' };
}

// 4. FITUR 4: Manajemen Inventaris Produk
export function addInventoryItem(newItem, inventory, setInventory) {
  const hargaBeli = Number(newItem.hargaBeli);
  const hargaJual = Number(newItem.hargaJual);
  const stok = Number(newItem.stok);
  if (hargaBeli < 100000 || hargaJual < hargaBeli || stok <= 0) {
    return { success: false, message: 'Data harga atau stok produk tidak valid!' };
  }
  const brand = newItem.brand || 'Apple';
  const prefix = brand.slice(0, 3).toUpperCase();
  const modelClean = newItem.model.replace(/\s+/g, '').toUpperCase();
  const genSku = `${prefix}-${modelClean}-${newItem.kondisi === 'Bekas' ? 'SECO' : 'NEW'}`;
  const itemToAdd = { ...newItem, id: 'p_' + Date.now(), sku: genSku, hargaBeli, hargaJual, stok };
  setInventory([itemToAdd, ...inventory]);
  return { success: true, item: itemToAdd };
}

// 5. FITUR 5: Kasir Point of Sales (POS) - Keranjang & Transaksi
export function addToCart(product, cart, setCart) {
  if (product.kategori === 'Gadget') {
    const countInCart = cart.filter((item) => item.id === product.id).length;
    if (countInCart >= product.stok) {
      return { success: false, message: 'Stok gadget ini di keranjang sudah maksimal.' };
    }
    const cartId = 'cart_' + Date.now();
    setCart([...cart, { ...product, cartId, qty: 1 }]);
    return { success: true };
  } else {
    const existingItemIndex = cart.findIndex((item) => item.id === product.id);
    if (existingItemIndex > -1) {
      if (cart[existingItemIndex].qty >= product.stok) {
        return { success: false, message: 'Stok aksesoris tidak mencukupi.' };
      }
      setCart(cart.map((item, idx) => (idx === existingItemIndex ? { ...item, qty: item.qty + 1 } : item)));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    return { success: true };
  }
}

// 6. FITUR 6: Riwayat Transaksi & Rollback Stok
export function deleteTransaction(txId, transactions, inventory, setTransactions, setInventory) {
  const txToDelete = transactions.find((t) => t.id === txId);
  if (!txToDelete) {
    return { success: false, message: 'Transaksi tidak ditemukan!' };
  }
  const restoredInventory = inventory.map((invItem) => {
    const purchasedItem = txToDelete.items.find((pi) => pi.id === invItem.id);
    return purchasedItem ? { ...invItem, stok: invItem.stok + purchasedItem.qty } : invItem;
  });
  setInventory(restoredInventory);
  setTransactions(transactions.filter((tx) => tx.id !== txId));
  return { success: true, restoredInventory };
}

// 7. FITUR 7: Manajemen Pegawai & Role
export function deleteUser(userId, currentUser, usersList, setUsersList) {
  if (currentUser.id === userId) {
    return { success: false, message: 'Tidak dapat menghapus akun yang sedang aktif!' };
  }
  const exists = usersList.some((u) => u.id === userId);
  if (!exists) {
    return { success: false, message: 'Pegawai tidak ditemukan!' };
  }
  setUsersList(usersList.filter((u) => u.id !== userId));
  return { success: true };
}

// 8. FITUR 8: Garansi Servis & Kas Pengeluaran
export function addExpense(newExpense, expenses, setExpenses) {
  const amount = Number(newExpense.amount);
  if (!newExpense.title || isNaN(amount) || amount < 1000 || amount > 5000000) {
    return { success: false, message: 'Nominal pengeluaran harus antara Rp1.000 - Rp5.000.000!' };
  }
  const expenseToAdd = {
    ...newExpense,
    id: 'exp_' + Date.now(),
    amount,
    status: 'Tercatat'
  };
  setExpenses([expenseToAdd, ...expenses]);
  return { success: true, expense: expenseToAdd };
}

/**
 * ============================================================================
 * SUITE PENGUJIAN UNIT (8 FITUR LENGKAP DENGAN AAA PATTERN & TEST DOUBLES)
 * ============================================================================
 */
describe('IzyStore Unit Testing — 8 Fitur Utama (AAA Pattern & Test Doubles)', () => {

  // TEST DOUBLE 1: STUB (Data Tiruan Terkontrol)
  const stubUsers = [
    { id: 'u1', name: 'Owner IzyStore', username: 'owner', email: 'owner@izystore.com', pin: '1234', role: 'Owner' },
    { id: 'u2', name: 'Kasir Andi', username: 'andi', email: 'andi@izystore.com', pin: '5678', role: 'Kasir' }
  ];

  const stubGadget = { id: 101, model: 'iPhone 13', brand: 'Apple', kategori: 'Gadget', kondisi: 'Bekas', stok: 1, hargaBeli: 7000000, hargaJual: 8500000 };
  const stubAksesoris = { id: 202, model: 'Adapter 20W', brand: 'Apple', kategori: 'Aksesoris', kondisi: 'Baru', stok: 2, hargaBeli: 150000, hargaJual: 250000 };

  // --------------------------------------------------------------------------
  // FITUR 1: LOGIN AKUN (EMAIL & PASSWORD)
  // --------------------------------------------------------------------------
  describe('Fitur 1: Login Akun (Email & Password)', () => {
    it('TC-F1-01: Login berhasil dengan email dan password yang valid (Positive)', () => {
      // Arrange
      const mockSetCurrentUser = mock.fn(); // TEST DOUBLE 2: MOCK
      // Act
      const res = loginUser('owner@izystore.com', '1234', stubUsers, mockSetCurrentUser);
      // Assert
      assert.equal(res.success, true);
      assert.equal(mockSetCurrentUser.mock.calls.length, 1);
      assert.equal(res.user.username, 'owner');
    });

    it('TC-F1-02: Login gagal jika password salah atau kolom kosong (Negative)', () => {
      // Arrange
      const mockSetCurrentUser = mock.fn();
      // Act
      const resEmpty = loginUser('', '', stubUsers, mockSetCurrentUser);
      const resWrong = loginUser('owner@izystore.com', '0000', stubUsers, mockSetCurrentUser);
      // Assert
      assert.equal(resEmpty.success, false);
      assert.equal(resWrong.success, false);
      assert.equal(mockSetCurrentUser.mock.calls.length, 0);
    });
  });

  // --------------------------------------------------------------------------
  // FITUR 2: REGISTER STAF BARU
  // --------------------------------------------------------------------------
  describe('Fitur 2: Register Staf Baru', () => {
    it('TC-F2-01: Berhasil mendaftarkan staf baru dengan email unik (Positive)', () => {
      // Arrange
      const mockSetUsersList = mock.fn();
      const newStaff = { name: 'Budi', email: 'budi@izystore.com', username: 'budi', password: '1234' };
      // Act
      const res = registerUser(newStaff, stubUsers, mockSetUsersList);
      // Assert
      assert.equal(res.success, true);
      assert.equal(mockSetUsersList.mock.calls.length, 1);
    });

    it('TC-F2-02: Menolak registrasi jika format email salah atau sudah terdaftar (Negative)', () => {
      // Arrange
      const mockSetUsersList = mock.fn();
      // Act
      const resEmpty = registerUser({ name: '', email: '', password: '' }, stubUsers, mockSetUsersList);
      const resInvalid = registerUser({ name: 'Budi', email: 'budi-invalid', password: '1234' }, stubUsers, mockSetUsersList);
      const resDuplicate = registerUser({ name: 'Duplikat', email: 'owner@izystore.com', password: '1234' }, stubUsers, mockSetUsersList);
      // Assert
      assert.equal(resEmpty.success, false);
      assert.equal(resInvalid.success, false);
      assert.equal(resDuplicate.success, false);
      assert.equal(mockSetUsersList.mock.calls.length, 0);
    });
  });

  // --------------------------------------------------------------------------
  // FITUR 3: LUPA PASSWORD (RESET VIA EMAIL)
  // --------------------------------------------------------------------------
  describe('Fitur 3: Lupa Password (Reset via Email)', () => {
    it('TC-F3-01: Berhasil mereset password untuk email yang terdaftar (Positive)', () => {
      // Arrange
      const mockSetUsersList = mock.fn();
      // Act
      const res = resetUserPassword('andi@izystore.com', '9999', stubUsers, mockSetUsersList);
      // Assert
      assert.equal(res.success, true);
      assert.equal(mockSetUsersList.mock.calls.length, 1);
    });

    it('TC-F3-02: Gagal reset password jika email tidak ditemukan atau PIN kurang dari 4 digit (Negative)', () => {
      // Arrange
      const mockSetUsersList = mock.fn();
      // Act
      const resShort = resetUserPassword('andi@izystore.com', '12', stubUsers, mockSetUsersList);
      const resNotFound = resetUserPassword('unknown@izystore.com', '9999', stubUsers, mockSetUsersList);
      // Assert
      assert.equal(resShort.success, false);
      assert.equal(resNotFound.success, false);
      assert.equal(mockSetUsersList.mock.calls.length, 0);
    });
  });

  // --------------------------------------------------------------------------
  // FITUR 4: MANAJEMEN INVENTARIS PRODUK
  // --------------------------------------------------------------------------
  describe('Fitur 4: Manajemen Inventaris Produk', () => {
    it('TC-F4-01: Berhasil menambah produk inventaris baru dengan SKU otomatis (Positive)', () => {
      // Arrange
      const mockSetInventory = mock.fn();
      const validItem = { brand: 'Apple', model: 'iPhone 14', kondisi: 'Bekas', hargaBeli: 9000000, hargaJual: 10500000, stok: 3 };
      // Act
      const res = addInventoryItem(validItem, [stubGadget], mockSetInventory);
      // Assert
      assert.equal(res.success, true);
      assert.match(res.item.sku, /^APP-IPHONE14-SECO$/);
      assert.equal(mockSetInventory.mock.calls.length, 1);
    });

    it('TC-F4-02: Menolak produk jika harga jual di bawah harga beli (rugi) atau stok <= 0 (Negative)', () => {
      // Arrange
      const mockSetInventory = mock.fn();
      const invalidItem = { model: 'iPhone 14', kondisi: 'Baru', hargaBeli: 10000000, hargaJual: 8000000, stok: 0 };
      // Act
      const res = addInventoryItem(invalidItem, [stubGadget], mockSetInventory);
      // Assert
      assert.equal(res.success, false);
      assert.equal(mockSetInventory.mock.calls.length, 0);
    });
  });

  // --------------------------------------------------------------------------
  // FITUR 5: KASIR POINT OF SALES (POS)
  // --------------------------------------------------------------------------
  describe('Fitur 5: Kasir Point of Sales (POS - addToCart)', () => {
    it('TC-F5-01: Berhasil menambah Gadget baru dan menambah qty Aksesoris ke keranjang (Positive)', () => {
      // Arrange
      const mockSetCart = mock.fn();
      // Act
      const resGadget = addToCart(stubGadget, [], mockSetCart);
      const resAccNew = addToCart(stubAksesoris, [], mockSetCart);
      const resAccInc = addToCart(stubAksesoris, [{ ...stubAksesoris, qty: 1 }], mockSetCart);
      // Assert
      assert.equal(resGadget.success, true);
      assert.equal(resAccNew.success, true);
      assert.equal(resAccInc.success, true);
      assert.equal(mockSetCart.mock.calls.length, 3);
    });

    it('TC-F5-02: Menolak penambahan Gadget maupun Aksesoris jika stok sudah habis (Negative)', () => {
      // Arrange
      const mockSetCart = mock.fn();
      // Act
      const resGadgetMax = addToCart(stubGadget, [{ ...stubGadget, qty: 1 }], mockSetCart);
      const resAccMax = addToCart(stubAksesoris, [{ ...stubAksesoris, qty: 2 }], mockSetCart);
      // Assert
      assert.equal(resGadgetMax.success, false);
      assert.equal(resAccMax.success, false);
      assert.equal(mockSetCart.mock.calls.length, 0);
    });
  });

  // --------------------------------------------------------------------------
  // FITUR 6: RIWAYAT TRANSAKSI & ROLLBACK STOK
  // --------------------------------------------------------------------------
  describe('Fitur 6: Riwayat Transaksi & Rollback Stok', () => {
    it('TC-F6-01: Menghapus transaksi dan mengembalikan (rollback) stok produk secara otomatis (Positive)', () => {
      // Arrange
      const mockSetTx = mock.fn();
      const mockSetInv = mock.fn();
      const stubTx = [{ id: 'tx_1', items: [{ id: 101, qty: 1 }] }];
      // Act
      const res = deleteTransaction('tx_1', stubTx, [stubGadget], mockSetTx, mockSetInv);
      // Assert
      assert.equal(res.success, true);
      assert.equal(res.restoredInventory[0].stok, 2); // Stok kembali dari 1 menjadi 2
      assert.equal(mockSetTx.mock.calls.length, 1);
    });

    it('TC-F6-02: Gagal menghapus jika ID transaksi tidak ditemukan (Negative)', () => {
      // Arrange
      const mockSetTx = mock.fn();
      const mockSetInv = mock.fn();
      // Act
      const res = deleteTransaction('tx_invalid', [], [stubGadget], mockSetTx, mockSetInv);
      // Assert
      assert.equal(res.success, false);
      assert.equal(mockSetTx.mock.calls.length, 0);
    });
  });

  // --------------------------------------------------------------------------
  // FITUR 7: MANAJEMEN PEGAWAI & ROLE
  // --------------------------------------------------------------------------
  describe('Fitur 7: Manajemen Pegawai & Role', () => {
    it('TC-F7-01: Owner berhasil menghapus akun pegawai staf lain (Positive)', () => {
      // Arrange
      const mockSetUsers = mock.fn();
      // Act
      const res = deleteUser('u2', stubUsers[0], stubUsers, mockSetUsers);
      // Assert
      assert.equal(res.success, true);
      assert.equal(mockSetUsers.mock.calls.length, 1);
    });

    it('TC-F7-02: Mencegah penghapusan akun sendiri yang sedang aktif atau ID tidak valid (Negative)', () => {
      // Arrange
      const mockSetUsers = mock.fn();
      // Act
      const resSelf = deleteUser('u1', stubUsers[0], stubUsers, mockSetUsers);
      const resUnknown = deleteUser('u99', stubUsers[0], stubUsers, mockSetUsers);
      // Assert
      assert.equal(resSelf.success, false);
      assert.equal(resUnknown.success, false);
      assert.equal(mockSetUsers.mock.calls.length, 0);
    });
  });

  // --------------------------------------------------------------------------
  // FITUR 8: GARANSI SERVIS & KAS PENGELUARAN
  // --------------------------------------------------------------------------
  describe('Fitur 8: Garansi Servis & Kas Pengeluaran', () => {
    it('TC-F8-01: Berhasil mencatat pengeluaran operasional toko dalam batas Rp1.000 - Rp5.000.000 (Positive)', () => {
      // Arrange
      const mockSetExpenses = mock.fn();
      // Act
      const res = addExpense({ title: 'Listrik & Internet Toko', amount: 350000 }, [], mockSetExpenses);
      // Assert
      assert.equal(res.success, true);
      assert.equal(mockSetExpenses.mock.calls.length, 1);
    });

    it('TC-F8-02: Menolak pencatatan kas jika nominal di bawah Rp1.000 atau di atas Rp5.000.000 (Negative)', () => {
      // Arrange
      const mockSetExpenses = mock.fn();
      // Act
      const resLow = addExpense({ title: 'Parkir', amount: 500 }, [], mockSetExpenses);
      const resHigh = addExpense({ title: 'Renovasi', amount: 10000000 }, [], mockSetExpenses);
      // Assert
      assert.equal(resLow.success, false);
      assert.equal(resHigh.success, false);
      assert.equal(mockSetExpenses.mock.calls.length, 0);
    });
  });
});
