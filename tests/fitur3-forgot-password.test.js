import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

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

describe('Fitur 3: Lupa Password (Reset via Email)', () => {
  // TEST DOUBLE 1: STUB
  const stubUsers = [
    { id: 'u2', name: 'Kasir Andi', username: 'andi', email: 'andi@izystore.com', pin: '5678', role: 'Kasir' }
  ];

  it('TC-F3-01: Berhasil mereset password untuk email yang terdaftar (Positive)', () => {
    // Arrange
    const mockSetUsersList = mock.fn(); // TEST DOUBLE 2: MOCK
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
