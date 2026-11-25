import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

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

describe('Fitur 8: Garansi Servis & Kas Pengeluaran', () => {
  // TEST DOUBLE 1: STUB
  const stubExpenses = [{ id: 'exp_1', title: 'Air Galon Toko', amount: 20000, status: 'Tercatat' }];

  it('TC-F8-01: Berhasil mencatat pengeluaran operasional toko dalam batas Rp1.000 - Rp5.000.000 (Positive)', () => {
    // Arrange
    const mockSetExpenses = mock.fn(); // TEST DOUBLE 2: MOCK
    // Act
    const res = addExpense({ title: 'Listrik & Internet Toko', amount: 350000 }, stubExpenses, mockSetExpenses);
    // Assert
    assert.equal(res.success, true);
    assert.equal(mockSetExpenses.mock.calls.length, 1);
  });

  it('TC-F8-02: Menolak pencatatan kas jika nominal di bawah Rp1.000 atau di atas Rp5.000.000 (Negative)', () => {
    // Arrange
    const mockSetExpenses = mock.fn();
    // Act
    const resLow = addExpense({ title: 'Parkir', amount: 500 }, stubExpenses, mockSetExpenses);
    const resHigh = addExpense({ title: 'Renovasi', amount: 10000000 }, stubExpenses, mockSetExpenses);
    // Assert
    assert.equal(resLow.success, false);
    assert.equal(resHigh.success, false);
    assert.equal(mockSetExpenses.mock.calls.length, 0);
  });
});
