import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

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

describe('Fitur 2: Register Staf Baru', () => {
  // TEST DOUBLE 1: STUB
  const stubUsers = [
    { id: 'u1', name: 'Owner IzyStore', username: 'owner', email: 'owner@izystore.com', pin: '1234', role: 'Owner' }
  ];

  it('TC-F2-01: Berhasil mendaftarkan staf baru dengan email unik (Positive)', () => {
    // Arrange
    const mockSetUsersList = mock.fn(); // TEST DOUBLE 2: MOCK
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
