import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

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

describe('Fitur 1: Login Akun (Email & Password)', () => {
  // TEST DOUBLE 1: STUB (Data Pengguna Tiruan)
  const stubUsers = [
    { id: 'u1', name: 'Owner IzyStore', username: 'owner', email: 'owner@izystore.com', pin: '1234', role: 'Owner' }
  ];

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
