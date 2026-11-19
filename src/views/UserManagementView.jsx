import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { Users, UserPlus, ShieldAlert, Trash2, Edit2, Key, Mail } from 'lucide-react';

export const UserManagementView = () => {
  const {
    usersList,
    addUser,
    deleteUser,
    updateUserRole,
    updateUserPin,
    updateUserEmail,
    currentUser,
    salespersons,
    addSalesperson,
    deleteSalesperson,
    loginHistory,
    fetchLoginHistory
  } = useApp();

  // Fetch history on mount
  useEffect(() => {
    fetchLoginHistory();
  }, []);

  // Add User State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    email: '',
    role: 'kasir',
    pin: ''
  });

  // Edit Role & Email State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUserObj, setEditUserObj] = useState(null);
  const [editRole, setEditRole] = useState('kasir');
  const [editEmail, setEditEmail] = useState('');

  // Edit PIN State
  const [showEditPinModal, setShowEditPinModal] = useState(false);
  const [editPinUserObj, setEditPinUserObj] = useState(null);
  const [newPin, setNewPin] = useState('');

  // Add Sales State
  const [showAddSalesModal, setShowAddSalesModal] = useState(false);
  const [newSales, setNewSales] = useState({
    name: '',
    commissionRate: 0.01
  });

  const handleOpenAdd = () => {
    setNewUser({
      username: '',
      name: '',
      email: '',
      role: 'kasir',
      pin: ''
    });
    setShowAddModal(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.name || !newUser.email || !newUser.pin || newUser.pin.length !== 4) {
      alert('Isi semua data lengkap! PIN wajib berisi 4 angka.');
      return;
    }

    // Check unique email
    const emailExists = usersList.some(
      (u) => u.email && u.email.toLowerCase() === newUser.email.toLowerCase()
    );
    if (emailExists) {
      alert('Email sudah terpakai oleh pengguna lain!');
      return;
    }

    // Check unique username
    const exists = usersList.some((u) => u.username.toLowerCase() === newUser.username.toLowerCase());
    if (exists) {
      alert('Username sudah terpakai!');
      return;
    }

    addUser(newUser);
    alert('User baru berhasil ditambahkan.');
    setShowAddModal(false);
  };

  const handleOpenEdit = (user) => {
    setEditUserObj(user);
    setEditRole(user.role);
    setEditEmail(user.email || '');
    setShowEditModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateUserRole(editUserObj.id, editRole);
    if (editEmail.trim()) {
      updateUserEmail(editUserObj.id, editEmail.trim().toLowerCase());
    }
    alert('Data user berhasil diperbarui.');
    setShowEditModal(false);
  };

  const handleOpenEditPin = (user) => {
    setEditPinUserObj(user);
    setNewPin('');
    setShowEditPinModal(true);
  };

  const handleEditPinSubmit = (e) => {
    e.preventDefault();
    if (!newPin || newPin.length !== 4) {
      alert('PIN wajib berisi 4 angka.');
      return;
    }
    updateUserPin(editPinUserObj.id, newPin);
    alert('PIN user berhasil diupdate.');
    setShowEditPinModal(false);
  };

  const handleDelete = (userId) => {
    if (userId === currentUser.id) {
      alert('Anda tidak bisa menghapus akun Anda sendiri yang sedang aktif!');
      return;
    }

    if (window.confirm('Apakah Anda yakin ingin menghapus user ini dari sistem?')) {
      const success = deleteUser(userId);
      if (success) {
        alert('User berhasil dihapus.');
      } else {
        alert('Gagal menghapus user.');
      }
    }
  };

  const handleOpenAddSales = () => {
    setNewSales({
      name: '',
      commissionRate: 0.01
    });
    setShowAddSalesModal(true);
  };

  const handleAddSalesSubmit = (e) => {
    e.preventDefault();
    if (!newSales.name) {
      alert('Nama sales wajib diisi!');
      return;
    }

    addSalesperson({
      name: newSales.name,
      commissionRate: parseFloat(newSales.commissionRate) || 0.01
    });
    alert('Sales baru berhasil ditambahkan.');
    setShowAddSalesModal(false);
  };

  const handleDeleteSales = (salesId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus sales ini?')) {
      deleteSalesperson(salesId);
      alert('Sales berhasil dihapus.');
    }
  };

  return (
    <div className="p-4 flex flex-col gap-6 text-left">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-white/60 dark:border-slate-800/40 shadow-neo dark:shadow-neo-dark p-5 transition-all duration-300">
        <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 m-0 flex items-center gap-2">
          <Users size={22} className="text-indigo-500 dark:text-indigo-400" />
          Manajemen Hak Akses & Akun Staf (Owner Only)
        </h2>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card
          title="Daftar Akun Pengguna POS"
          headerBg="bg-orange-100/70"
          bodyClassName="p-4"
          headerAction={
            <Button variant="green" size="sm" onClick={handleOpenAdd} className="flex items-center gap-1.5 !rounded-xl">
              <UserPlus size={14} strokeWidth={2.5} />
              <span>Tambah User</span>
            </Button>
          }
        >
          <Table
            headers={['Nama & Email', 'Username', 'PIN', 'Role', 'Aksi']}
            rows={usersList}
            renderRow={(user) => {
              const isSelf = user.id === currentUser.id;
              return (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 text-[11px] font-semibold border-b border-slate-100 dark:border-slate-800/40 text-slate-700 dark:text-slate-300">
                  <td className="px-3 py-3">
                    <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center">
                      <span className="truncate max-w-[120px]">{user.name}</span>
                      {isSelf && <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-white/50 dark:border-emerald-900/30 text-[8px] px-1.5 py-0.5 rounded-lg font-black uppercase tracking-wider ml-1 shrink-0">Aktif</span>}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate max-w-[140px] flex items-center gap-1 mt-0.5">
                      <Mail size={10} className="shrink-0 text-slate-400" />
                      <span>{user.email || '-'}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-mono truncate max-w-[80px]">
                    {user.username}
                  </td>
                  <td className="px-3 py-3 font-mono text-slate-500 dark:text-slate-400">
                    {user.pin}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`
                      text-[8px] font-black uppercase border border-white/50 dark:border-slate-800/30 rounded-lg px-2 py-0.5
                      ${user.role === 'owner' ? 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400' : user.role === 'kepala toko' ? 'bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400' : 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400'}
                    `}>
                      {user.role === 'owner' ? 'Owner' : user.role === 'kepala toko' ? 'Kepala Toko / Admin' : 'Kasir'}
                    </span>
                  </td>
                  <td className="px-3 py-3 flex gap-1.5 justify-center">
                    <button
                      onClick={() => handleOpenEdit(user)}
                      title="Ubah Role"
                      className="p-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:text-indigo-600 hover:scale-105 transition-all cursor-pointer shadow-sm"
                    >
                      <Edit2 size={12} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => handleOpenEditPin(user)}
                      title="Ubah PIN"
                      className="p-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 hover:scale-105 transition-all cursor-pointer shadow-sm"
                    >
                      <Key size={12} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      disabled={isSelf}
                      title="Hapus Akun"
                      className={`
                        p-1.5 rounded-lg transition-all cursor-pointer shadow-sm
                        ${isSelf 
                          ? 'bg-slate-50 dark:bg-slate-900/60 text-slate-300 dark:text-slate-600 border border-slate-100 dark:border-slate-800/40 cursor-not-allowed' 
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-red-50 hover:text-red-500 hover:scale-105'
                        }
                      `}
                    >
                      <Trash2 size={12} strokeWidth={2.5} />
                    </button>
                  </td>
                </tr>
              );
            }}
          />
        </Card>

        <Card
          title="Daftar Staf Sales / Helper"
          headerBg="bg-blue-100/70"
          bodyClassName="p-4"
          headerAction={
            <Button variant="green" size="sm" onClick={handleOpenAddSales} className="flex items-center gap-1.5 !rounded-xl">
              <UserPlus size={14} strokeWidth={2.5} />
              <span>Tambah Sales</span>
            </Button>
          }
        >
          <Table
            headers={['Nama Sales', 'Aksi']}
            rows={salespersons}
            renderRow={(sales) => (
              <tr key={sales.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 text-[11px] font-semibold border-b border-slate-100 dark:border-slate-800/40 text-slate-700 dark:text-slate-300">
                <td className="px-3 py-3 font-bold text-slate-800 dark:text-slate-100">
                  {sales.name}
                </td>
                <td className="px-3 py-3 flex gap-1.5 justify-center">
                  <button
                    onClick={() => handleDeleteSales(sales.id)}
                    title="Hapus Sales"
                    className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-red-50 hover:text-red-500 hover:scale-105 rounded-lg transition-all cursor-pointer shadow-sm"
                  >
                    <Trash2 size={12} strokeWidth={2.5} />
                  </button>
                </td>
              </tr>
            )}
          />
        </Card>
      </div>

      {/* LOGIN HISTORY CARD */}
      <Card
        title="Riwayat Aktivitas Login"
        headerBg="bg-indigo-100/70"
        bodyClassName="p-4"
        headerAction={
          <Button variant="white" size="sm" onClick={fetchLoginHistory} className="flex items-center gap-1.5 !rounded-xl shadow-sm text-xs">
            <span>Muat Ulang</span>
          </Button>
        }
      >
        <div className="max-h-64 overflow-y-auto pr-2">
          <Table
            headers={['Waktu', 'Username', 'Status', 'IP Address']}
            rows={loginHistory}
            renderRow={(log) => {
              const dateObj = new Date(log.login_time);
              const dateStr = dateObj.toLocaleString('id-ID', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
              });
              const isSuccess = log.status.toLowerCase() === 'sukses';
              return (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 text-[11px] font-semibold border-b border-slate-100 dark:border-slate-800/40 text-slate-700 dark:text-slate-300">
                  <td className="px-3 py-3 whitespace-nowrap">{dateStr}</td>
                  <td className="px-3 py-3 font-mono font-bold">{log.username}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${isSuccess ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-mono text-[10px] text-slate-500">{log.ip_address}</td>
                </tr>
              );
            }}
          />
          {(!loginHistory || loginHistory.length === 0) && (
            <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-semibold">
              Belum ada data riwayat login.
            </div>
          )}
        </div>
      </Card>

      {/* MODAL 1: ADD USER */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Daftar Pengguna Baru"
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleAddSubmit} className="flex flex-col gap-4 text-left">
          <Input
            label="Nama Lengkap"
            placeholder="Contoh: Roni Setiawan"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            required
          />
          <Input
            label="Email Akun Login"
            type="email"
            placeholder="Contoh: roni@izystore.com"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value.toLowerCase().trim() })}
            required
          />
          <Input
            label="Username Login"
            placeholder="Contoh: roni_izystore"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value.toLowerCase().replace(/\s+/g,'') })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="PIN Otorisasi (4 Angka)"
              type="password"
              placeholder="Contoh: 7788"
              value={newUser.pin}
              onChange={(e) => setNewUser({ ...newUser, pin: e.target.value.replace(/\D/g,'') })}
              maxLength={4}
              required
            />
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-1">Role / Jabatan</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs font-bold bg-slate-50/50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-950/50 outline-none transition-all duration-200"
              >
                <option value="kasir">Kasir</option>
                <option value="kepala toko">Kepala Toko / Admin</option>
                <option value="owner">Owner</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 border-t border-slate-100 dark:border-slate-800/40 pt-3">
            <Button variant="white" onClick={() => setShowAddModal(false)}>
              Batal
            </Button>
            <Button variant="green" type="submit">
              Tambah Akun
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: EDIT USER ROLE */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Ubah Jabatan (Role) Staf"
        maxWidth="max-w-xs"
      >
        {editUserObj && (
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 text-left">
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/40 rounded-2xl p-3.5 text-xs font-semibold text-slate-600 dark:text-slate-400 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.05)]">
              <div>Nama: <span className="font-extrabold text-slate-800 dark:text-slate-200">{editUserObj.name}</span></div>
              <div className="mt-1">Username: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{editUserObj.username}</span></div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-1">Email Login</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value.toLowerCase().trim())}
                placeholder="Contoh: user@izystore.com"
                className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs font-bold bg-slate-50/50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-950/50 outline-none transition-all duration-200"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-1">Jabatan Baru</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs font-bold bg-slate-50/50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-950/50 outline-none transition-all duration-200"
              >
                <option value="kasir">Kasir</option>
                <option value="kepala toko">Kepala Toko / Admin</option>
                <option value="owner">Owner</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="white" onClick={() => setShowEditModal(false)}>
                Batal
              </Button>
              <Button variant="green" type="submit">
                Simpan Perubahan
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 2.5: EDIT PIN */}
      <Modal
        isOpen={showEditPinModal}
        onClose={() => setShowEditPinModal(false)}
        title="Ubah PIN Staf"
        maxWidth="max-w-xs"
      >
        {editPinUserObj && (
          <form onSubmit={handleEditPinSubmit} className="flex flex-col gap-4 text-left">
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/40 rounded-2xl p-3.5 text-xs font-semibold text-slate-600 dark:text-slate-400 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.05)]">
              <div>Nama: <span className="font-extrabold text-slate-800 dark:text-slate-200">{editPinUserObj.name}</span></div>
              <div className="mt-1">Username: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{editPinUserObj.username}</span></div>
            </div>

            <Input
              label="PIN Baru (4 Angka)"
              type="password"
              placeholder="Contoh: 1234"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g,''))}
              maxLength={4}
              required
            />

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="white" onClick={() => setShowEditPinModal(false)}>
                Batal
              </Button>
              <Button variant="green" type="submit">
                Simpan PIN
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 3: ADD SALESPERSON */}
      <Modal
        isOpen={showAddSalesModal}
        onClose={() => setShowAddSalesModal(false)}
        title="Daftar Sales Baru"
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleAddSalesSubmit} className="flex flex-col gap-4 text-left">
          <Input
            label="Nama Sales / Karyawan"
            placeholder="Contoh: Daffa"
            value={newSales.name}
            onChange={(e) => setNewSales({ ...newSales, name: e.target.value })}
            required
          />

          <div className="flex justify-end gap-2 mt-4 border-t border-slate-100 dark:border-slate-800/40 pt-3">
            <Button variant="white" onClick={() => setShowAddSalesModal(false)}>
              Batal
            </Button>
            <Button variant="green" type="submit">
              Tambah Sales
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default UserManagementView;
