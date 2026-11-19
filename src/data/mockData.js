export const mockUsers = [
  { id: 'u_1', username: 'admin', email: 'admin@izystore.com', name: 'Admin Utama', role: 'owner', pin: '1234' },
  { id: 'u_2', username: 'kasir1', email: 'kasir1@izystore.com', name: 'Kasir Satu', role: 'kasir', pin: '1111' },
];

export const mockInventory = [
  {
    id: 'p_1',
    sku: 'APP-IP13-NEW-0001',
    barcode: '1234567890123',
    brand: 'Apple',
    model: 'iPhone 13 128GB',
    warna: 'Midnight',
    rom: '128GB',
    kondisi: 'Baru',
    hargaBeli: 10000000,
    hargaJual: 11500000,
    stok: 5,
    kategori: 'Gadget',
    garansiAsal: 'Resmi iBox',
    garansiAktif: true,
    gradeFisik: 'A',
    minus: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 'p_2',
    sku: 'SAM-S23U-SECO-0002',
    barcode: '9876543210987',
    brand: 'Samsung',
    model: 'Galaxy S23 Ultra 256GB',
    warna: 'Phantom Black',
    rom: '256GB',
    kondisi: 'Bekas',
    hargaBeli: 12000000,
    hargaJual: 13500000,
    stok: 2,
    kategori: 'Gadget',
    garansiAsal: 'Resmi SEIN',
    garansiAktif: false,
    gradeFisik: 'B',
    minus: 'Lecet pemakaian',
    createdAt: new Date().toISOString()
  },
  {
    id: 'p_3',
    sku: 'ACC-CHG-20W-0003',
    barcode: '8888888888888',
    brand: 'Apple',
    model: 'Adaptor Charger 20W',
    warna: 'Putih',
    rom: '-',
    kondisi: 'Baru',
    hargaBeli: 200000,
    hargaJual: 350000,
    stok: 10,
    kategori: 'Aksesoris',
    garansiAsal: 'Resmi',
    garansiAktif: true,
    gradeFisik: 'A',
    minus: '',
    createdAt: new Date().toISOString()
  }
];

export const mockTransactions = [
  {
    id: 't_1',
    invoiceNo: 'INV-00000001',
    date: new Date().toISOString(),
    items: [
      {
        id: 'p_1',
        brand: 'Apple',
        model: 'iPhone 13 128GB',
        kondisi: 'Baru',
        kategori: 'Gadget',
        imei: '358123456789012',
        barcode: '1234567890123',
        qty: 1,
        hargaBeli: 10000000,
        hargaJual: 11500000
      }
    ],
    salesperson: 'Andi',
    helper: null,
    salespersonRole: 'Sales',
    discount: 0,
    total: 11500000,
    paymentMethod: 'Transfer',
    cashAmount: 11500000,
    changeAmount: 0,
    type: 'Penjualan',
    customerName: 'Budi',
    customerPhone: '081234567890',
    isSplitPayment: false,
    splitDetails: null,
    tradeInDetails: null,
    deviceModel: null,
    issueDescription: null,
    jasaVal: 0,
    spareparts: null,
    adminFee: 0,
    network_status: 'Aman'
  }
];

export const mockSalespersons = [
  { id: 's_1', name: 'Andi' },
  { id: 's_2', name: 'Budi' },
  { id: 's_3', name: 'Citra' }
];

export const mockWarrantyClaims = [
  {
    id: 'w_1',
    imei: '358123456789012',
    customerName: 'Budi',
    customerPhone: '081234567890',
    claimDate: new Date().toISOString(),
    issueDescription: 'Layar mati tiba-tiba',
    status: 'Proses',
    notes: 'Sedang dicek teknisi'
  }
];

export const mockExpenses = [
  {
    id: 'exp_1',
    date: new Date().toISOString(),
    category: 'Operasional',
    amount: 150000,
    description: 'Beli token listrik'
  }
];

export const mockLoginHistory = [
  {
    id: 'lh_1',
    username: 'admin',
    login_time: new Date().toISOString(),
    status: 'Sukses',
    ip_address: '127.0.0.1'
  }
];
