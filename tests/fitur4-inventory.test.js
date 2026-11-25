import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

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

describe('Fitur 4: Manajemen Inventaris Produk', () => {
  // TEST DOUBLE 1: STUB
  const stubInventory = [
    { id: 101, model: 'iPhone 13', brand: 'Apple', kategori: 'Gadget', kondisi: 'Bekas', stok: 1, hargaBeli: 7000000, hargaJual: 8500000 }
  ];

  it('TC-F4-01: Berhasil menambah produk inventaris baru dengan SKU otomatis (Positive)', () => {
    // Arrange
    const mockSetInventory = mock.fn(); // TEST DOUBLE 2: MOCK
    const validItem = { brand: 'Apple', model: 'iPhone 14', kondisi: 'Bekas', hargaBeli: 9000000, hargaJual: 10500000, stok: 3 };
    // Act
    const res = addInventoryItem(validItem, stubInventory, mockSetInventory);
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
    const res = addInventoryItem(invalidItem, stubInventory, mockSetInventory);
    // Assert
    assert.equal(res.success, false);
    assert.equal(mockSetInventory.mock.calls.length, 0);
  });
});
