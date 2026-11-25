import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

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

describe('Fitur 7: Manajemen Pegawai & Role', () => {
  // TEST DOUBLE 1: STUB
  const stubUsers = [
    { id: 'u1', name: 'Owner IzyStore', role: 'Owner' },
    { id: 'u2', name: 'Kasir Andi', role: 'Kasir' }
  ];

  it('TC-F7-01: Owner berhasil menghapus akun pegawai staf lain (Positive)', () => {
    // Arrange
    const mockSetUsers = mock.fn(); // TEST DOUBLE 2: MOCK
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
