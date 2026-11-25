import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

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

describe('Fitur 6: Riwayat Transaksi & Rollback Stok', () => {
  // TEST DOUBLE 1: STUB
  const stubInventory = [{ id: 101, model: 'iPhone 13', stok: 1 }];
  const stubTx = [{ id: 'tx_1', items: [{ id: 101, qty: 1 }] }];

  it('TC-F6-01: Menghapus transaksi dan mengembalikan (rollback) stok produk secara otomatis (Positive)', () => {
    // Arrange
    const mockSetTx = mock.fn(); // TEST DOUBLE 2: MOCK
    const mockSetInv = mock.fn();
    // Act
    const res = deleteTransaction('tx_1', stubTx, stubInventory, mockSetTx, mockSetInv);
    // Assert
    assert.equal(res.success, true);
    assert.equal(res.restoredInventory[0].stok, 2);
    assert.equal(mockSetTx.mock.calls.length, 1);
  });

  it('TC-F6-02: Gagal menghapus jika ID transaksi tidak ditemukan (Negative)', () => {
    // Arrange
    const mockSetTx = mock.fn();
    const mockSetInv = mock.fn();
    // Act
    const res = deleteTransaction('tx_invalid', [], stubInventory, mockSetTx, mockSetInv);
    // Assert
    assert.equal(res.success, false);
    assert.equal(mockSetTx.mock.calls.length, 0);
  });
});
