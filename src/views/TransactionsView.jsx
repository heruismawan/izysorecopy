import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Table from '../components/Table';
import Modal from '../components/Modal';
import logoImg from '../assets/logo.png';
import { Search, Eye, FileText, Printer, Share2, Calendar, X, Trash2, Download, Smartphone } from 'lucide-react';
import * as XLSX from 'xlsx';

export const TransactionsView = () => {
  const { transactions, inventory, salespersons, currentUser, updateTransactionFinancials, deleteTransaction } = useApp();
  const isOwner = currentUser.role === 'owner';
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSalesperson, setSelectedSalesperson] = useState('Semua');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, startDate, endDate, selectedSalesperson]);

  // Detail Modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTx, setActiveTx] = useState(null);

  // Edit Modal state (Owner Only)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTxData, setEditTxData] = useState(null);

  const handleOpenEdit = (tx) => {
    setEditTxData({
      id: tx.id,
      invoiceNo: tx.invoiceNo,
      salesperson: tx.salesperson || 'Tanpa Sales',
      helper: tx.helper || '',
      total: tx.total,
      items: tx.items.map(i => ({ ...i, hargaBeli: i.hargaBeli || 0, hargaJual: i.hargaJual || 0 }))
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editTxData) return;
    const success = await updateTransactionFinancials(editTxData.id, editTxData);
    if (success) {
      alert('Transaksi berhasil diupdate!');
      setShowEditModal(false);
    } else {
      alert('Gagal mengupdate transaksi.');
    }
  };

  const handleRevertTransaction = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini? Stok barang akan dikembalikan.')) {
      await deleteTransaction(id);
      setActiveTx(null);
      setShowDetailModal(false);
    }
  };

  const handlePrintReceipt = () => {
    const originalElement = document.getElementById('printable-receipt');
    if (!originalElement) return;

    // Klon elemen struk
    const clone = originalElement.cloneNode(true);
    
    // Beri styling khusus untuk dicetak (hilangkan shadow, reset margin, set lebar thermal 58mm)
    clone.style.width = '58mm';
    clone.style.margin = '0 auto';
    clone.style.padding = '0';
    clone.style.position = 'relative'; 
    clone.style.overflow = 'visible';
    clone.style.boxShadow = 'none';
    clone.style.border = 'none';

    // Buat container rahasia di body khusus untuk print
    const printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    printContainer.appendChild(clone);
    document.body.appendChild(printContainer);

    // Tambahkan tag style sementara untuk menyembunyikan elemen utama aplikasi
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body > *:not(#print-container) {
          display: none !important;
        }
        @page {
          margin: 0;
          size: 58mm auto;
        }
        body, html {
          background: white !important;
          margin: 0 !important;
          padding: 0 !important;
          height: auto !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Tunggu browser meng-apply CSS sebelum memanggil print
    setTimeout(() => {
      window.print();

      // Bersihkan kembali ke kondisi semula
      setTimeout(() => {
        if (document.body.contains(printContainer)) {
          document.body.removeChild(printContainer);
        }
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      }, 1000);
    }, 150);
  };

  const handleDownloadReceipt = async () => {
    const originalElement = document.getElementById('printable-receipt');
    if (!originalElement) return;
    
    // Klon elemen agar tidak terpotong oleh batas scroll Modal
    const clone = originalElement.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.top = '-9999px';
    clone.style.left = '-9999px';
    clone.style.width = '380px';
    clone.style.height = 'auto';
    clone.style.overflow = 'visible'; // Hapus batasan overflow
    clone.style.zIndex = '-1';
    
    // Fix bug html2canvas: border-dashed bikin render terpotong
    const dashedElements = clone.querySelectorAll('.border-dashed');
    dashedElements.forEach(el => {
      el.classList.remove('border-dashed');
      el.classList.add('border-solid');
    });
    
    document.body.appendChild(clone);
    
    try {
      const canvas = await html2canvas(clone, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        windowWidth: clone.scrollWidth,
        windowHeight: clone.scrollHeight
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Salinan-Nota-IZYstore-${activeTx?.invoiceNo || Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download receipt', err);
      alert('Gagal mengunduh nota');
    } finally {
      document.body.removeChild(clone);
    }
  };

  const handleAndroidPrint = async () => {
    if (!activeTx) return;
    
    try {
      const center = (str) => {
        const pad = Math.max(0, Math.floor((32 - str.length) / 2));
        return " ".repeat(pad) + str;
      };
      
      const leftRight = (left, right) => {
        const spaces = Math.max(1, 32 - left.length - right.length);
        return left + " ".repeat(spaces) + right;
      };

      let text = center("IZYSTORE") + "\n";
      text += center("Jl. Bend. Sigura-gura Barat") + "\n";
      text += center("No. 22, Malang") + "\n";
      text += center("Telp: 0819-9909-4111") + "\n";
      if (activeTx.type === 'Servis') {
        text += center("NOTA SERVIS & PERBAIKAN") + "\n";
      }
      text += "--------------------------------\n"; // 32 chars
      
      text += leftRight("No Invoice:", activeTx.invoiceNo || '') + "\n";
      
      let dateStr = '';
      if (activeTx.date) {
        const d = new Date(activeTx.date);
        dateStr = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}, ${d.getHours().toString().padStart(2,'0')}.${d.getMinutes().toString().padStart(2,'0')}.${d.getSeconds().toString().padStart(2,'0')}`;
      }
      text += leftRight("Tanggal:", dateStr) + "\n";
      text += leftRight("Operator:", activeTx.cashier || 'Admin') + "\n";
      text += leftRight("Sales:", activeTx.salesperson || 'Tanpa Sales') + "\n";
      text += leftRight("Jenis:", (activeTx.type || 'PENJUALAN').toUpperCase()) + "\n";
      
      if (activeTx.customerName) text += leftRight("Pelanggan:", activeTx.customerName) + "\n";
      if (activeTx.deviceModel) text += leftRight("Perangkat:", activeTx.deviceModel) + "\n";
      text += "--------------------------------\n";
      
      // Items (Penjualan / Servis Spareparts)
      const itemsList = activeTx.type === 'Servis' ? (activeTx.spareparts || []) : (activeTx.items || []);
      itemsList.forEach(item => {
        const subtotalStr = "Rp " + ((item.qty || 0) * (item.hargaJual || item.price || 0)).toLocaleString('id-ID');
        const qtyName = `${item.qty}x ${item.model || item.name || ''}`;
        let safeQtyName = qtyName;
        if (safeQtyName.length + subtotalStr.length + 1 > 32) {
          safeQtyName = safeQtyName.substring(0, 32 - subtotalStr.length - 1);
        }
        text += leftRight(safeQtyName, subtotalStr) + "\n";
        
        if (item.imei) {
          text += `IMEI: ${item.imei} ${item.kondisi ? `(${item.kondisi})` : ''}\n`;
        }
      });
      
      if (activeTx.tradeInDetails) {
        text += "--------------------------------\n";
        text += "TUKAR TAMBAH:\n";
        const tradeName = (activeTx.tradeInDetails.model || '').substring(0, 32);
        const tradeVal = "-Rp " + (activeTx.tradeInDetails.taksiranHarga || 0).toLocaleString('id-ID');
        text += leftRight(tradeName, tradeVal) + "\n";
      }
      
      text += "--------------------------------\n";      // Totals
      const manualSubtotal = itemsList.reduce((sum, item) => sum + ((item.qty || 0) * (item.hargaJual || item.price || 0)), 0);
      text += leftRight("Subtotal:", "Rp " + manualSubtotal.toLocaleString('id-ID')) + "\n";
      
      if (activeTx.discount > 0) {
        text += leftRight("Diskon:", "-Rp " + Number(activeTx.discount || 0).toLocaleString('id-ID')) + "\n";
      }
      
      const adminFee = activeTx.admin_fee || activeTx.adminFee || 0;
      if (adminFee > 0) {
        text += leftRight("Biaya Admin:", "Rp " + Number(adminFee).toLocaleString('id-ID')) + "\n";
      }
      
      if (activeTx.type === 'Servis' && activeTx.jasaVal > 0) {
        text += leftRight("Jasa Servis:", "Rp " + Number(activeTx.jasaVal || 0).toLocaleString('id-ID')) + "\n";
      }
      
      text += leftRight("TOTAL:", "Rp " + Number(activeTx.total || 0).toLocaleString('id-ID')) + "\n";
      text += "--------------------------------\n";
      
      // Payments
      if (activeTx.paymentMethod === 'Split' || activeTx.isSplitPayment) {
        const pay1 = "Rp " + Number(activeTx.splitAmount1 || activeTx.splitDetails?.amount1 || 0).toLocaleString('id-ID');
        const m1 = (activeTx.splitMethod1 || activeTx.splitDetails?.method1 || 'Tunai').substring(0, 10);
        text += leftRight(`Bayar (${m1}):`, pay1) + "\n";
        
        const pay2 = "Rp " + Number(activeTx.splitAmount2 || activeTx.splitDetails?.amount2 || 0).toLocaleString('id-ID');
        const m2 = (activeTx.splitMethod2 || activeTx.splitDetails?.method2 || 'Transfer').substring(0, 10);
        text += leftRight(`Bayar (${m2}):`, pay2) + "\n";
      } else {
        const pay = "Rp " + Number(activeTx.paymentAmount || activeTx.cashAmount || 0).toLocaleString('id-ID');
        const m = (activeTx.paymentMethod || 'Tunai').substring(0, 10);
        text += leftRight(`Bayar (${m}):`, pay) + "\n";
      }
      
      const changeStr = "Rp " + Number(activeTx.change || activeTx.changeAmount || 0).toLocaleString('id-ID');
      text += leftRight("Kembalian:", changeStr) + "\n";
      
      text += "--------------------------------\n";
      text += center("TERIMA KASIH ATAS KUNJUNGAN ANDA") + "\n";
      text += center("Garansi Toko wajib membawa") + "\n";
      text += center("nota ini / IMEI tercatat.") + "\n";
      
      // Panggil RawBT Intent API
      const intentUrl = `intent:rawbt:${encodeURI(text)}#Intent;package=ru.a402d.rawbtprinter;end;`;
      window.location.href = intentUrl;
    } catch (err) {
      console.error('Failed to print to Android', err);
      alert(`Gagal mencetak ke Android: ${err.message || 'Unknown error'}`);
    }
  };


  const handleDeleteTx = async (tx) => {
    if (window.confirm(`Yakin ingin HAPUS transaksi ${tx.invoiceNo} secara permanen?\n\nPeringatan: Stok barang pada transaksi ini akan dikembalikan ke dalam inventory.`)) {
      const success = await deleteTransaction(tx.id);
      if (success) {
        alert('Transaksi berhasil dihapus dan stok telah dikembalikan.');
      } else {
        alert('Gagal menghapus transaksi.');
      }
    }
  };

  // Format Helper
  const handleFormatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  // Filtered transactions
  const filteredTx = transactions.filter((tx) => {
    // Search by invoice, salesperson, or item details (model, imei, barcode)
    const matchesSearch = 
      tx.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.salesperson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.items.some(
        (item) =>
          item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.imei && item.imei.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.barcode && item.barcode.toLowerCase().includes(searchQuery.toLowerCase()))
      );

    const matchesSalesperson = 
      selectedSalesperson === 'Semua' || 
      tx.salesperson === selectedSalesperson;

    // Filter by date range (local time comparison)
    let matchesDate = true;
    if (startDate || endDate) {
      const txLocalDate = new Date(tx.date);
      const year = txLocalDate.getFullYear();
      const month = String(txLocalDate.getMonth() + 1).padStart(2, '0');
      const day = String(txLocalDate.getDate()).padStart(2, '0');
      const txDateStr = `${year}-${month}-${day}`;
      
      if (startDate && txDateStr < startDate) {
        matchesDate = false;
      }
      if (endDate && txDateStr > endDate) {
        matchesDate = false;
      }
    }

    return matchesSearch && matchesSalesperson && matchesDate;
  });

  const totalPages = Math.ceil(filteredTx.length / itemsPerPage);
  const activePage = Math.min(currentPage, totalPages || 1);
  const displayedTx = filteredTx.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, activePage - 2);
      let end = Math.min(totalPages, activePage + 2);
      if (start === 1) {
        end = 5;
      } else if (end === totalPages) {
        start = totalPages - 4;
      }
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  const handleOpenDetail = (tx) => {
    setActiveTx(tx);
    setShowDetailModal(true);
  };

  const getSubtotal = (items) => {
    return items.reduce((acc, item) => acc + item.hargaJual * item.qty, 0);
  };

  const handleExportExcel = () => {
    const headers = [
      'No Invoice',
      'Tanggal Transaksi',
      'Jenis Transaksi',
      'Karyawan (Sales)',
      'Helper',
      'Ket. Sinyal',
      'Item Produk',
      'Kode Barcode',
      'Item Tukar Tambah',
      'Taksiran Harga Tukar Tambah',
      ...(isOwner ? ['Modal', 'Harga Jual'] : []),
      'Diskon',
      'Biaya Admin',
      'Total Bayar',
      'Metode Pembayaran'
    ];

    const excelData = [];

    filteredTx.forEach((tx) => {
      const itemsString = tx.items
        .map((item) => `${item.qty}x ${item.model} (IMEI: ${item.imei || '-'})`)
        .join('; ');
      
      const barcodesString = tx.items
        .map((item) => {
          const invItem = inventory.find(p => p.id === item.product_id);
          return item.barcode || invItem?.barcode || item.imei || '-';
        })
        .join(', ');

      const tradeInModel = tx.tradeInDetails ? tx.tradeInDetails.model : '-';
      const tradeInTaksiran = tx.tradeInDetails ? Number(tx.tradeInDetails.taksiranHarga || 0) : 0;

      const totalModal = tx.items.reduce((acc, item) => acc + Number(item.hargaBeli || 0) * item.qty, 0);
      const totalHargaJual = tx.items.reduce((acc, item) => acc + Number(item.hargaJual || item.price || 0) * item.qty, 0);

      const row = [
        tx.invoiceNo,
        new Date(tx.date).toLocaleString('id-ID'),
        tx.type || 'Penjualan',
        tx.salesperson,
        tx.helper || '-',
        tx.network_status || '-',
        itemsString,
        barcodesString,
        tradeInModel,
        tradeInTaksiran,
        ...(isOwner ? [totalModal, totalHargaJual] : []),
        Number(tx.discount || 0),
        Number(tx.admin_fee || tx.adminFee || 0),
        Number(tx.total || 0),
        tx.paymentMethod
      ];

      excelData.push(row);
    });

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...excelData]);

    // Format columns width
    const wscols = [
      {wch: 15}, // Invoice
      {wch: 20}, // Date
      {wch: 15}, // Type
      {wch: 15}, // Sales
      {wch: 15}, // Helper
      {wch: 40}, // Items
      {wch: 30}, // Barcode
      {wch: 20}, // TradeIn Item
      {wch: 15}, // TradeIn Value
      ...(isOwner ? [{wch: 15}, {wch: 15}] : []), // Modal, Harga Jual
      {wch: 12}, // Diskon
      {wch: 12}, // Admin
      {wch: 15}, // Total
      {wch: 15}, // Method
    ];
    worksheet['!cols'] = wscols;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Transaksi");

    // Generate file and trigger download
    XLSX.writeFile(workbook, `riwayat-penjualan-izystore-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="p-4 flex flex-col gap-6 text-left dark:text-slate-200">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 rounded-3xl border border-white/60 dark:border-slate-800/40 shadow-neo dark:shadow-neo-dark p-5 transition-all duration-300">
        <div>
          <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 m-0 flex items-center gap-2">
            <FileText size={22} className="text-orange-500 dark:text-orange-400" />
            Riwayat Penjualan & Transaksi Toko
          </h2>

        </div>
        <Button variant="green" onClick={handleExportExcel} className="flex items-center justify-center gap-1.5 !rounded-xl shrink-0 w-full md:w-auto">
          <FileText size={14} strokeWidth={2.5} />
          <span>Export Excel</span>
        </Button>
      </div>

      <Card
        title="Daftar Nota / Invoice Transaksi"
        headerBg="bg-orange-100/70"
        bodyClassName="p-4 flex flex-col gap-4"
      >
        {/* Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-end justify-between mb-4 border-b border-slate-100 dark:border-slate-800/30 pb-4">
          <div className="w-full lg:max-w-xs">
            <Input
              label="Cari Nota"
              placeholder="No Invoice, Sales, Produk, IMEI, Barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
            />
          </div>
          
          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3 items-end">
            <div className="w-full sm:w-44">
              <Input
                type="date"
                label="Mulai Tanggal"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                icon={Calendar}
                className="text-xs"
              />
            </div>
            <div className="w-full sm:w-44">
              <Input
                type="date"
                label="Sampai Tanggal"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                icon={Calendar}
                className="text-xs"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="h-[43px] px-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/30 rounded-2xl hover:bg-red-100 dark:hover:bg-red-950/30 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-sm"
                title="Hapus Filter Tanggal"
              >
                <X size={15} strokeWidth={2.5} />
              </button>
            )}
          </div>
          
          <div className="w-full lg:w-auto flex flex-col gap-1.5 text-left">
            <span className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 pl-1">Filter Sales:</span>
            <select
              value={selectedSalesperson}
              onChange={(e) => setSelectedSalesperson(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs font-bold bg-slate-50/50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-950/50 outline-none transition-all duration-200 cursor-pointer h-[43px] min-w-[150px]"
            >
              <option value="Semua">Semua Sales</option>
              {salespersons.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
              <option value="Tanpa Sales">Tanpa Sales</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <Table
          headers={
            isOwner
              ? ['No Invoice', 'Tanggal Transaksi', 'Karyawan (Sales)', 'Item Produk', 'Kode Barcode', 'Modal', 'Harga Jual', 'Biaya Admin', 'Total Bayar', 'Metode', 'Aksi']
              : ['No Invoice', 'Tanggal Transaksi', 'Karyawan (Sales)', 'Item Produk', 'Kode Barcode', 'Biaya Admin', 'Total Bayar', 'Metode', 'Aksi']
          }
          rows={displayedTx}
          renderRow={(tx) => {
            const totalModal = tx.items.reduce((acc, item) => acc + (item.hargaBeli || 0) * item.qty, 0);
            const totalHargaJual = tx.items.reduce((acc, item) => acc + (item.hargaJual || 0) * item.qty, 0);

            return (
              <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 text-[10px] font-semibold border-b border-slate-100 dark:border-slate-800/40 text-slate-700 dark:text-slate-300">
              <td className="px-2 py-2 font-mono">
                <div className="font-extrabold text-[11px] text-slate-800 dark:text-slate-100">{tx.invoiceNo}</div>
                <span className={`
                  text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border border-white/50 dark:border-slate-800/30 mt-1 inline-block shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.15)]
                  ${tx.type === 'Tukar Tambah' 
                    ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400' 
                    : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                  }
                `}>
                  {tx.type || 'Penjualan'}
                </span>
              </td>
              <td className="px-2 py-2 text-[9px] leading-tight">
                {new Date(tx.date).toLocaleString('id-ID')}
              </td>
              <td className="px-2 py-2">
                <div className="font-bold text-slate-800 dark:text-slate-100">{tx.salesperson || '-'}</div>
                {tx.helper && (
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Helper: <span className="font-bold">{tx.helper}</span>
                  </div>
                )}
                {tx.network_status && (
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Ket. Sinyal: <span className="font-black text-slate-700 dark:text-slate-300 uppercase">{tx.network_status}</span>
                  </div>
                )}
              </td>
              <td className="px-2 py-2 max-w-[150px]">
                <div className="flex flex-col gap-0.5">
                  {tx.type === 'Servis' && tx.customerName && (
                    <div className="mb-1 pb-1 border-b border-dashed border-slate-200 dark:border-slate-800/50 text-[9px] text-slate-500 dark:text-slate-400">
                      <span className="font-bold">Plg:</span> {tx.customerName} <br/>
                      <span className="font-bold">HP:</span> {tx.deviceModel}
                    </div>
                  )}
                  {tx.items.map((item, idx) => (
                    <div key={idx} className="border-b border-slate-50 dark:border-slate-800/30 pb-1 last:pb-0">
                      <span className="font-bold text-slate-700 dark:text-slate-200">{item.qty}x {item.model}</span>
                      {item.imei && item.imei !== '-' && <div className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">IMEI: {item.imei} {item.kondisi ? `(${item.kondisi})` : ''}</div>}
                    </div>
                  ))}
                  {tx.tradeInDetails && (
                    <div className="mt-0.5 pt-1 border-t border-dashed border-slate-100 dark:border-slate-800/40 bg-blue-50/50 dark:bg-blue-950/20 rounded md p-1 text-[8px] text-slate-600 dark:text-slate-400">
                      <span className="font-black text-blue-600 dark:text-blue-400 block">HP LAMA DIRETUR:</span>
                      <div className="flex justify-between items-start mt-0.5">
                        <span>{tx.tradeInDetails.model}</span>
                        <span className="font-bold text-red-600 dark:text-red-400 whitespace-nowrap ml-1">-{handleFormatRupiah(tx.tradeInDetails.taksiranHarga)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-2 py-2 font-mono">
                <div className="flex flex-col gap-0.5">
                  {tx.items.map((item, idx) => {
                    const invItem = inventory.find(p => p.id === item.product_id);
                    const displayBarcode = item.barcode || invItem?.barcode || item.imei || '-';
                    return (
                      <span key={idx} className="block text-[10px] text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded px-1.5 py-0.5 truncate max-w-[120px] font-bold" title={displayBarcode}>
                        {displayBarcode}
                      </span>
                    );
                  })}
                </div>
              </td>
              {isOwner && (
                <>
                  <td className="px-2 py-2 font-bold font-mono text-red-600 dark:text-red-400">
                    {handleFormatRupiah(totalModal)}
                  </td>
                  <td className="px-2 py-2 font-bold font-mono text-blue-600 dark:text-blue-400">
                    {handleFormatRupiah(totalHargaJual)}
                  </td>
                </>
              )}
              <td className="px-2 py-2 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                {tx.admin_fee > 0 ? handleFormatRupiah(tx.admin_fee) : '-'}
              </td>
              <td className="px-2 py-2 font-black font-mono text-[11px] text-slate-800 dark:text-slate-100">
                {handleFormatRupiah(tx.total)}
              </td>
              <td className="px-2 py-2 text-center font-bold uppercase text-[8px]">
                {tx.paymentMethod}
              </td>
              <td className="px-2 py-2 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => handleOpenDetail(tx)}
                    title="Lihat Detail Nota"
                    className="px-2 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-700 dark:hover:text-orange-400 hover:scale-105 active:scale-95 shadow-sm dark:shadow-none transition-all cursor-pointer flex items-center gap-1 font-bold uppercase text-[8px]"
                  >
                    <Eye size={11} strokeWidth={2.5} />
                    <span>Detail</span>
                  </button>
                  {isOwner && (
                    <>
                      <button
                        onClick={() => handleOpenEdit(tx)}
                        title="Edit Finansial Transaksi"
                        className="px-2 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-700 dark:hover:text-blue-400 hover:scale-105 active:scale-95 shadow-sm dark:shadow-none transition-all cursor-pointer flex items-center gap-1 font-bold uppercase text-[8px]"
                      >
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteTx(tx)}
                        title="Hapus Transaksi"
                        className="px-2 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-400 hover:scale-105 active:scale-95 shadow-sm dark:shadow-none transition-all cursor-pointer flex items-center gap-1 font-bold uppercase text-[8px]"
                      >
                        <Trash2 size={11} strokeWidth={2.5} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
            );
          }}
        />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/40 mt-2">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
              Menampilkan {Math.min((activePage - 1) * itemsPerPage + 1, filteredTx.length)} - {Math.min(activePage * itemsPerPage, filteredTx.length)} dari {filteredTx.length} transaksi
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={activePage === 1}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-black uppercase tracking-wider rounded-xl border border-slate-200/40 dark:border-slate-700/50 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Sebelumnya
              </button>
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`
                    w-7 h-7 flex items-center justify-center text-[10px] font-black rounded-xl border transition-all cursor-pointer
                    ${activePage === page 
                      ? 'bg-orange-500 text-white dark:text-slate-950 border-transparent shadow-sm' 
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200/40 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-105 active:scale-95'
                    }
                  `}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={activePage === totalPages}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-black uppercase tracking-wider rounded-xl border border-slate-200/40 dark:border-slate-700/50 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* EDIT MODAL (Owner Only) */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Finansial Transaksi"
        maxWidth="max-w-md"
      >
        {editTxData && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 p-3 rounded-r-xl">
              <p className="text-[10px] text-blue-700 dark:text-blue-400 font-medium">
                Peringatan: Mengubah nilai modal atau harga jual akan mengubah rekapitulasi laba-rugi secara permanen.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] font-black uppercase text-slate-500 pl-1">Sales</label>
                  <select
                    value={editTxData.salesperson || ''}
                    onChange={(e) => setEditTxData(prev => ({ ...prev, salesperson: e.target.value }))}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 outline-none"
                  >
                    <option value="Tanpa Sales">Tanpa Sales</option>
                    {salespersons.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] font-black uppercase text-slate-500 pl-1">Helper</label>
                  <select
                    value={editTxData.helper || ''}
                    onChange={(e) => setEditTxData(prev => ({ ...prev, helper: e.target.value }))}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 outline-none"
                  >
                    <option value="">Tanpa Helper</option>
                    {salespersons.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              {editTxData.items.map((item, idx) => (
                <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                  <div className="font-bold text-[11px] text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-1 mb-2">
                    Item {idx + 1}: {item.model}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Harga Modal"
                      type="number"
                      value={item.hargaBeli}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEditTxData(prev => ({
                          ...prev,
                          items: prev.items.map((i, iIdx) => iIdx === idx ? { ...i, hargaBeli: val } : i)
                        }));
                      }}
                    />
                    <Input
                      label="Harga Jual"
                      type="number"
                      value={item.hargaJual}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEditTxData(prev => ({
                          ...prev,
                          items: prev.items.map((i, iIdx) => iIdx === idx ? { ...i, hargaJual: val } : i)
                        }));
                      }}
                    />
                  </div>
                </div>
              ))}
              
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Input
                  label="Total Bayar Keseluruhan (Invoice)"
                  type="number"
                  value={editTxData.total}
                  onChange={(e) => setEditTxData(prev => ({ ...prev, total: Number(e.target.value) }))}
                  className="font-bold text-orange-600 dark:text-orange-400"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveEdit}
                className="flex-1"
              >
                Simpan Perubahan
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* DETAIL MODAL (Nota Struk Copy) */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Salinan Struk Transaksi"
        maxWidth="max-w-sm"
      >
        {activeTx && (
          <div className="flex flex-col gap-4 text-center">
            {/* Struk Content */}
            <div id="printable-receipt" className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-5 font-mono text-[11px] text-left flex flex-col gap-3 relative overflow-hidden shadow-sm transition-all duration-300">
              
              <div className="text-center border-b border-dashed border-slate-200 dark:border-slate-800/40 pb-3">
                <img src={logoImg} alt="Izy Store Logo" className="w-10 h-10 object-contain mx-auto mb-1.5 rounded-full border border-slate-100 dark:border-slate-800" />
                <span className="text-xs font-black tracking-wider block text-slate-700 dark:text-slate-200">IZYSTORE</span>
                <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold block leading-relaxed px-2">Jl. Bend. Sigura-gura Barat No. 22, Malang</span>
                <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold block">Telp: 0819-9909-4111</span>
                {activeTx.type === 'Servis' && (
                  <span className="text-[9px] text-slate-800 dark:text-slate-100 font-black block mt-1.5 uppercase bg-slate-100 dark:bg-slate-900 py-1 rounded">Nota Servis & Perbaikan</span>
                )}
              </div>

              {activeTx.type === 'Servis' ? (
                <>
                  <div className="flex flex-col gap-1 text-[9px] text-slate-500 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>No Invoice:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{activeTx.invoiceNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tanggal:</span>
                      <span className="dark:text-slate-300">{new Date(activeTx.date).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pelanggan:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{activeTx.customerName || '-'} ({activeTx.customerPhone || '-'})</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Perangkat:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{activeTx.deviceModel || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Teknisi / Sales:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {activeTx.salesperson}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="border-t border-b border-dashed border-slate-200 dark:border-slate-800/40 py-2.5 flex flex-col gap-2">
                    <span className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 block">DESKRIPSI KERUSAKAN:</span>
                    <p className="text-[9px] text-slate-650 dark:text-slate-350 m-0 leading-relaxed font-bold bg-slate-50 dark:bg-slate-900 rounded p-1.5 border border-slate-100 dark:border-slate-800/30">
                      {activeTx.issueDescription || '-'}
                    </p>

                    {activeTx.spareparts && activeTx.spareparts.length > 0 && (
                      <div className="border-t border-dotted border-slate-200 dark:border-slate-800/40 pt-2 flex flex-col gap-1">
                        <span className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 block">SPAREPARTS / SUKU CADANG:</span>
                        {activeTx.spareparts.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-slate-750 dark:text-slate-250">
                            <span>{item.qty}x {item.model}</span>
                            <span>{handleFormatRupiah(item.hargaJual * item.qty)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTx.jasaVal > 0 && (
                      <div className="border-t border-dotted border-slate-200 dark:border-slate-800/40 pt-2 flex justify-between font-bold text-slate-755 dark:text-slate-250">
                        <span>Jasa Teknis Servis</span>
                        <span>{handleFormatRupiah(activeTx.jasaVal)}</span>
                      </div>
                    )}
                  </div>

                  {/* Total Calculations */}
                  <div className="flex flex-col gap-1 text-[9px] text-slate-500 dark:text-slate-400">
                    <div className="flex justify-between font-black text-xs border-t border-dotted border-slate-200 dark:border-slate-800/40 pt-1.5 text-slate-850 dark:text-slate-100">
                      <span>TOTAL AKHIR:</span>
                      <span>{handleFormatRupiah(activeTx.total || 0)}</span>
                    </div>
                    {activeTx.isSplitPayment && activeTx.splitDetails ? (
                      <div className="flex flex-col gap-0.5 border-t border-dotted border-slate-200 dark:border-slate-800/40 pt-1.5 mt-1 text-[8px] text-slate-400 dark:text-slate-500 font-bold">
                        <div className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 mb-0.5">Rincian Split Payment:</div>
                        <div className="flex justify-between">
                          <span>- {activeTx.splitDetails.method1}:</span>
                          <span>{handleFormatRupiah(activeTx.splitDetails.amount1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>- {activeTx.splitDetails.method2}:</span>
                          <span>{handleFormatRupiah(activeTx.splitDetails.amount2)}</span>
                        </div>
                        {activeTx.changeAmount > 0 && (
                          <div className="flex justify-between text-slate-700 dark:text-slate-200 mt-0.5 border-t border-dashed border-slate-200 dark:border-slate-800/20 pt-1">
                            <span>Kembalian Tunai:</span>
                            <span>{handleFormatRupiah(activeTx.changeAmount)}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between mt-1">
                          <span>Bayar ({activeTx.paymentMethod}):</span>
                          <span>{handleFormatRupiah(activeTx.cashAmount || 0)}</span>
                        </div>
                        {activeTx.paymentMethod && activeTx.paymentMethod.includes('Tunai') && (
                          <div className="flex justify-between">
                            <span>Kembalian:</span>
                            <span>{handleFormatRupiah(activeTx.changeAmount || 0)}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="text-center border-t border-dashed border-slate-200 dark:border-slate-800/40 pt-3 mt-2 text-[8px] text-slate-400 dark:text-slate-500 font-bold">
                    <span>TERIMA KASIH ATAS KEPERCAYAAN ANDA</span>
                    <span className="block mt-0.5">Garansi servis 1 bulan wajib membawa nota struk ini.</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1 text-[9px] text-slate-500 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>No Invoice:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{activeTx.invoiceNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tanggal:</span>
                      <span className="dark:text-slate-300">{new Date(activeTx.date).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Operator:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{currentUser.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sales:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {activeTx.salesperson || '-'}
                      </span>
                    </div>
                    {activeTx.helper && (
                      <div className="flex justify-between">
                        <span>Helper:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {activeTx.helper}
                        </span>
                      </div>
                    )}
                    {activeTx.network_status && (
                      <div className="flex justify-between mt-0.5">
                        <span>Ket. Sinyal:</span>
                        <span className="font-black uppercase text-slate-800 dark:text-slate-100">
                          {activeTx.network_status}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Jenis:</span>
                      <span className="font-bold uppercase text-slate-700 dark:text-slate-200">{activeTx.type || 'Penjualan'}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="border-t border-b border-dashed border-slate-200 dark:border-slate-800/40 py-2.5 flex flex-col gap-2">
                    {activeTx.items.map((item, idx) => (
                      <div key={idx} className="flex flex-col">
                        <div className="flex justify-between font-bold text-slate-700 dark:text-slate-200">
                          <span>{item.qty}x {item.model}</span>
                          <span>{handleFormatRupiah(item.hargaJual * item.qty)}</span>
                        </div>
                        {item.imei && (
                          <span className="text-[8px] text-slate-400 dark:text-slate-500">IMEI: {item.imei} ({item.kondisi})</span>
                        )}
                      </div>
                    ))}

                    {/* If trade in details */}
                    {activeTx.tradeInDetails && (
                      <div className="mt-1 pt-1.5 border-t border-dotted border-slate-200 dark:border-slate-800/40 flex flex-col bg-blue-50/50 dark:bg-blue-950/20 rounded-lg p-2 text-[9px] text-slate-600 dark:text-slate-400">
                        <span className="font-black text-blue-600 dark:text-blue-400 block">TUKAR TAMBAH (HP DITERIMA TOKO):</span>
                        <span className="font-bold">{activeTx.tradeInDetails.model}</span>
                        <span className="font-bold text-right text-red-500 dark:text-red-400">-{handleFormatRupiah(activeTx.tradeInDetails.taksiranHarga)}</span>
                      </div>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="flex flex-col gap-1 text-[9px] text-slate-500 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="dark:text-slate-300">{handleFormatRupiah(getSubtotal(activeTx.items))}</span>
                    </div>
                    {activeTx.discount > 0 && (
                      <div className="flex justify-between text-red-500 dark:text-red-400">
                        <span>Diskon:</span>
                        <span>-{handleFormatRupiah(activeTx.discount)}</span>
                      </div>
                    )}
                    {activeTx.admin_fee > 0 && (
                      <div className="flex justify-between text-slate-600 dark:text-slate-400 font-bold">
                        <span>Biaya Layanan/Admin:</span>
                        <span>{handleFormatRupiah(activeTx.admin_fee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-black text-xs border-t border-dotted border-slate-200 dark:border-slate-800/40 pt-1.5 text-slate-800 dark:text-slate-100">
                      <span>TOTAL:</span>
                      <span>{handleFormatRupiah(activeTx.total)}</span>
                    </div>
                  {activeTx.isSplitPayment && activeTx.splitDetails ? (
                    <div className="flex flex-col gap-0.5 border-t border-dotted border-slate-200 dark:border-slate-800/40 pt-1.5 mt-1 text-[8px] text-slate-400 dark:text-slate-500 font-bold">
                      <div className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 mb-0.5">Rincian Split Payment:</div>
                      <div className="flex justify-between">
                        <span>- {activeTx.splitDetails.method1}:</span>
                        <span>{handleFormatRupiah(activeTx.splitDetails.amount1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>- {activeTx.splitDetails.method2}:</span>
                        <span>{handleFormatRupiah(activeTx.splitDetails.amount2)}</span>
                      </div>
                      {activeTx.changeAmount > 0 && (
                        <div className="flex justify-between text-slate-700 dark:text-slate-200 mt-0.5 border-t border-dashed border-slate-200 dark:border-slate-800/20 pt-1">
                          <span>Kembalian Tunai:</span>
                          <span>{handleFormatRupiah(activeTx.changeAmount)}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between mt-1">
                        <span>Bayar ({activeTx.paymentMethod}):</span>
                        <span className="uppercase dark:text-slate-300">{handleFormatRupiah(activeTx.cashAmount)}</span>
                      </div>
                      {activeTx.paymentMethod === 'Tunai' && (
                        <div className="flex justify-between">
                          <span>Kembalian:</span>
                          <span className="dark:text-slate-300">{handleFormatRupiah(activeTx.changeAmount)}</span>
                        </div>
                      )}
                    </>
                  )}
                  </div>

                  <div className="text-center border-t border-dashed border-slate-200 dark:border-slate-800/40 pt-3 mt-2 text-[8px] text-slate-400 dark:text-slate-500 font-bold">
                    <span>TERIMA KASIH ATAS KUNJUNGAN ANDA</span>
                    <span className="block mt-0.5">Garansi Toko wajib membawa nota ini / IMEI tercatat.</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="white"
                className="flex-1 flex items-center justify-center gap-1.5 !rounded-xl print:hidden"
                onClick={handlePrintReceipt}
              >
                <Printer size={14} />
                <span>Cetak (PC)</span>
              </Button>
              <Button
                variant="white"
                onClick={handleAndroidPrint}
                className="flex-1 flex items-center justify-center gap-1.5 !rounded-xl print:hidden text-blue-600 dark:text-blue-500"
              >
                <Smartphone size={14} />
                <span>Cetak (Android)</span>
              </Button>
              <Button
                variant="white"
                onClick={handleDownloadReceipt}
                className="flex-1 flex items-center justify-center gap-1.5 !rounded-xl print:hidden text-orange-600 dark:text-orange-500"
              >
                <Download size={14} />
                <span>Unduh</span>
              </Button>
            </div>
            
            <Button
              variant="green"
              className="w-full mt-1 py-3 !rounded-xl print:hidden"
              onClick={() => setShowDetailModal(false)}
            >
              Selesai
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default TransactionsView;
