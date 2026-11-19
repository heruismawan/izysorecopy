import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  mockUsers, 
  mockInventory, 
  mockTransactions, 
  mockSalespersons, 
  mockWarrantyClaims, 
  mockExpenses, 
  mockLoginHistory 
} from '../data/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // --- IN-MEMORY STATES FOR PURE FRONTEND ---
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });

  const [usersList, setUsersList] = useState(() => {
    const stored = localStorage.getItem('usersList');
    if (!stored) {
      localStorage.setItem('usersList', JSON.stringify(mockUsers));
      return mockUsers;
    }
    try {
      const parsed = JSON.parse(stored);
      // Ensure mock users have emails and synchronize with mockUsers
      const merged = mockUsers.map((mu) => {
        const existing = parsed.find((u) => u.id === mu.id || u.username === mu.username);
        return existing
          ? { ...mu, ...existing, email: existing.email || mu.email }
          : mu;
      });
      // Preserve any additional registered users
      const customUsers = parsed.filter(
        (u) => !mockUsers.some((mu) => mu.id === u.id || mu.username === u.username)
      );
      const finalUsers = [...merged, ...customUsers];
      localStorage.setItem('usersList', JSON.stringify(finalUsers));
      return finalUsers;
    } catch {
      localStorage.setItem('usersList', JSON.stringify(mockUsers));
      return mockUsers;
    }
  });

  const [inventory, setInventory] = useState(() => {
    const stored = localStorage.getItem('inventory');
    return stored ? JSON.parse(stored) : mockInventory;
  });

  const [cart, setCart] = useState([]);
  
  const [pendingTransactions, setPendingTransactions] = useState(() => {
    const stored = localStorage.getItem('pendingTransactions');
    return stored ? JSON.parse(stored) : [];
  });

  const [transactions, setTransactions] = useState(() => {
    const stored = localStorage.getItem('transactions');
    return stored ? JSON.parse(stored) : mockTransactions;
  });

  const [salespersons, setSalespersons] = useState(() => {
    const stored = localStorage.getItem('salespersons');
    return stored ? JSON.parse(stored) : mockSalespersons;
  });

  const [warrantyClaims, setWarrantyClaims] = useState(() => {
    const stored = localStorage.getItem('warrantyClaims');
    return stored ? JSON.parse(stored) : mockWarrantyClaims;
  });

  const [expenses, setExpenses] = useState(() => {
    const stored = localStorage.getItem('expenses');
    return stored ? JSON.parse(stored) : mockExpenses;
  });

  const [loginHistory, setLoginHistory] = useState(() => {
    const stored = localStorage.getItem('loginHistory');
    return stored ? JSON.parse(stored) : mockLoginHistory;
  });

  // --- SAVE STATES TO LOCAL STORAGE ---
  useEffect(() => {
    if (currentUser) localStorage.setItem('currentUser', JSON.stringify(currentUser));
    else localStorage.removeItem('currentUser');
  }, [currentUser]);

  useEffect(() => { localStorage.setItem('usersList', JSON.stringify(usersList)); }, [usersList]);
  useEffect(() => { localStorage.setItem('inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('pendingTransactions', JSON.stringify(pendingTransactions)); }, [pendingTransactions]);
  useEffect(() => { localStorage.setItem('transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('salespersons', JSON.stringify(salespersons)); }, [salespersons]);
  useEffect(() => { localStorage.setItem('warrantyClaims', JSON.stringify(warrantyClaims)); }, [warrantyClaims]);
  useEffect(() => { localStorage.setItem('expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('loginHistory', JSON.stringify(loginHistory)); }, [loginHistory]);

  const fetchLoginHistory = async () => {
    // No-op for frontend only
  };

  const addExpense = (newExpense) => {
    const expenseToAdd = {
      ...newExpense,
      id: 'exp_' + Date.now(),
      date: new Date().toISOString(),
      amount: parseFloat(newExpense.amount) || 0
    };
    setExpenses((prev) => [expenseToAdd, ...prev]);
  };

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });
  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false);
  const [transitioningTo, setTransitioningTo] = useState(theme);

  const toggleTheme = () => {
    if (isThemeTransitioning) return;
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTransitioningTo(nextTheme);
    setIsThemeTransitioning(true);
    setTimeout(() => {
      setTheme(nextTheme);
      localStorage.setItem('theme', nextTheme);
      setTimeout(() => setIsThemeTransitioning(false), 600);
    }, 400);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const addUser = async (newUser) => {
    const id = 'u_' + Date.now();
    setUsersList((prev) => [...prev, { ...newUser, id }]);
  };

  const deleteUser = async (userId) => {
    if (currentUser.id === userId) return false;
    setUsersList((prev) => prev.filter((u) => u.id !== userId));
    return true;
  };

  const addSalesperson = async (newSales) => {
    const id = 's_' + Date.now();
    setSalespersons((prev) => [...prev, { ...newSales, id }]);
  };

  const deleteSalesperson = async (salesId) => {
    setSalespersons((prev) => prev.filter((s) => s.id !== salesId));
  };

  const updateUserRole = async (userId, newRole) => {
    setUsersList((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => ({ ...prev, role: newRole }));
    }
  };

  const updateUserPin = async (userId, newPin) => {
    setUsersList((prev) => {
      const updated = prev.map((u) => (u.id === userId ? { ...u, pin: newPin } : u));
      localStorage.setItem('usersList', JSON.stringify(updated));
      return updated;
    });
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => ({ ...prev, pin: newPin }));
    }
  };

  const updateUserEmail = async (userId, newEmail) => {
    setUsersList((prev) => {
      const updated = prev.map((u) => (u.id === userId ? { ...u, email: newEmail } : u));
      localStorage.setItem('usersList', JSON.stringify(updated));
      return updated;
    });
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => ({ ...prev, email: newEmail }));
    }
  };

  const resetUserPassword = (identifier, newPin) => {
    const clean = identifier.trim().toLowerCase();
    let found = false;
    setUsersList((prev) => {
      const updated = prev.map((u) => {
        if (
          (u.email && u.email.toLowerCase() === clean) ||
          (u.username && u.username.toLowerCase() === clean)
        ) {
          found = true;
          return { ...u, pin: newPin };
        }
        return u;
      });
      localStorage.setItem('usersList', JSON.stringify(updated));
      return updated;
    });
    return found;
  };

  const addToCart = (product) => {
    if (product.kategori === 'Gadget') {
      const countInCart = cart.filter((item) => item.id === product.id).length;
      if (countInCart >= product.stok) return { success: false, message: 'Stok gadget ini di keranjang sudah maksimal.' };
      const cartId = 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      setCart((prev) => [...prev, { ...product, cartId, qty: 1 }]);
      return { success: true };
    } else {
      const existingItemIndex = cart.findIndex((item) => item.id === product.id);
      if (existingItemIndex > -1) {
        if (cart[existingItemIndex].qty >= product.stok) return { success: false, message: 'Stok aksesoris tidak mencukupi.' };
        setCart((prev) => prev.map((item, idx) => idx === existingItemIndex ? { ...item, qty: item.qty + 1 } : item));
      } else {
        setCart((prev) => [...prev, { ...product, qty: 1 }]);
      }
      return { success: true };
    }
  };

  const removeFromCart = (cartId) => {
    setCart((prev) => prev.filter((item) => (item.cartId ? item.cartId !== cartId : item.id !== cartId)));
  };

  const updateCartQty = (productId, newQty) => {
    const productInInventory = inventory.find((p) => p.id === productId);
    if (!productInInventory) return;
    if (productInInventory.kategori === 'Gadget') return;
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    if (newQty > productInInventory.stok) {
      alert(`Stok hanya tersedia ${productInInventory.stok} unit.`);
      return;
    }
    setCart((prev) => prev.map((item) => (item.id === productId ? { ...item, qty: newQty } : item)));
  };

  const updateCartItemImei = (cartId, physicalImei) => {
    setCart((prev) => prev.map((item) => {
      const itemIdentifier = item.cartId || item.id;
      return itemIdentifier === cartId ? { ...item, physicalImei } : item;
    }));
  };

  const clearCart = () => setCart([]);

  const holdTransaction = (salespersonName, salespersonRole) => {
    if (cart.length === 0) return { success: false, message: 'Keranjang belanja kosong.' };
    const newHold = {
      id: 'hold_' + Date.now(),
      date: new Date().toISOString(),
      items: [...cart],
      salesperson: salespersonName || 'Tanpa Sales',
      salespersonRole: salespersonRole || 'Sales',
      total: cart.reduce((acc, item) => acc + item.hargaJual * item.qty, 0)
    };
    setPendingTransactions((prev) => [...prev, newHold]);
    setCart([]);
    return { success: true };
  };

  const resumeTransaction = (holdId) => {
    const held = pendingTransactions.find((h) => h.id === holdId);
    if (!held) return false;
    setCart(held.items);
    setPendingTransactions((prev) => prev.filter((h) => h.id !== holdId));
    return true;
  };

  const cancelPendingTransaction = (holdId) => {
    setPendingTransactions((prev) => prev.filter((h) => h.id !== holdId));
  };

  const addInventoryItem = (newItem) => {
    const brand = newItem.brand || 'Apple';
    const prefix = brand.slice(0, 3).toUpperCase();
    const modelClean = newItem.model.replace(/\s+/g, '').toUpperCase();
    const genSku = newItem.sku || `${prefix}-${modelClean}-${newItem.kondisi === 'Bekas' ? 'SECO' : 'NEW'}-${Date.now().toString().slice(-4)}`;
    
    const itemToAdd = {
      ...newItem,
      id: 'p_' + Date.now(),
      sku: genSku,
      createdAt: new Date().toISOString(),
      stok: parseInt(newItem.stok) || 1
    };
    setInventory((prev) => [itemToAdd, ...prev]);
    return itemToAdd;
  };

  const updateInventoryItem = (updatedItem) => {
    setInventory((prev) => prev.map((item) => (item.id === updatedItem.id ? { ...item, ...updatedItem } : item)));
  };

  const deleteInventoryItem = (itemId) => {
    setInventory((prev) => prev.filter((item) => item.id !== itemId));
  };

  const completeTransaction = (transactionData) => {
    const { items, salesperson, salespersonRole, discount, total, paymentMethod, cashAmount, changeAmount, tradeInDetails, isSplitPayment, splitDetails, adminFee, networkStatus } = transactionData;
    
    const invoiceNo = `INV-${Date.now().toString().slice(-8)}`;
    const newTransaction = {
      id: 't_' + Date.now(),
      invoiceNo,
      date: new Date().toISOString(),
      items: items.map(item => ({...item})),
      salesperson: salesperson || 'Tanpa Sales',
      helper: transactionData.helper || null,
      network_status: networkStatus || null,
      salespersonRole: salespersonRole || 'Sales',
      discount: discount || 0,
      total,
      paymentMethod,
      cashAmount: cashAmount || total,
      changeAmount: changeAmount || 0,
      tradeInDetails: tradeInDetails && tradeInDetails.isTradeIn ? { ...tradeInDetails } : null,
      type: transactionData.type || (tradeInDetails && tradeInDetails.isTradeIn ? 'Tukar Tambah' : 'Penjualan'),
      isSplitPayment: isSplitPayment || false,
      splitDetails: splitDetails || null,
      customerName: transactionData.customerName || null,
      customerPhone: transactionData.customerPhone || null,
      deviceModel: transactionData.deviceModel || null,
      issueDescription: transactionData.issueDescription || null,
      jasaVal: transactionData.jasaVal || 0,
      spareparts: transactionData.spareparts ? [...transactionData.spareparts] : null,
      adminFee: adminFee || 0
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    
    setInventory((prevInventory) => {
      let updatedInventory = [...prevInventory];
      items.forEach((purchaseItem) => {
        updatedInventory = updatedInventory.map((invItem) => {
          if (invItem.id === purchaseItem.id) {
            const newStok = Math.max(0, invItem.stok - purchaseItem.qty);
            return { ...invItem, stok: newStok };
          }
          return invItem;
        });
      });
      if (tradeInDetails && tradeInDetails.isTradeIn) {
        const tradeInItem = {
          id: 'p_trade_' + Date.now(),
          sku: `TI-${tradeInDetails.brand.slice(0,3).toUpperCase()}-${tradeInDetails.model.replace(/\s+/g,'').toUpperCase()}-SECO`,
          barcode: tradeInDetails.barcode || tradeInDetails.imei || '', 
          brand: tradeInDetails.brand,
          model: tradeInDetails.model,
          warna: tradeInDetails.warna || 'Default',
          ram: tradeInDetails.ram || '-',
          kondisi: 'Bekas',
          hargaBeli: tradeInDetails.taksiranHarga,
          hargaJual: tradeInDetails.hargaJual > 0 ? tradeInDetails.hargaJual : Math.round(tradeInDetails.taksiranHarga * 1.25),
          stok: 1,
          kategori: 'Gadget',
          batteryHealth: tradeInDetails.batteryHealth ? parseInt(tradeInDetails.batteryHealth) : null,
          garansiAsal: tradeInDetails.garansiAsal || 'Inter',
          garansiAktif: false,
          gradeFisik: tradeInDetails.gradeFisik || 'B',
          minus: tradeInDetails.minus || '',
          createdAt: new Date().toISOString()
        };
        updatedInventory.unshift(tradeInItem);
      }
      return updatedInventory;
    });

    clearCart();
    return { success: true, invoiceNo, transaction: newTransaction };
  };

  const deleteTransaction = async (txId) => {
    const txToDelete = transactions.find(t => t.id === txId);
    if (txToDelete && txToDelete.items) {
      setInventory(prev => prev.map(invItem => {
        const purchasedItem = txToDelete.items.find(pi => pi.id === invItem.id);
        if (purchasedItem) {
          return { ...invItem, stok: invItem.stok + purchasedItem.qty };
        }
        return invItem;
      }));
    }
    setTransactions((prev) => prev.filter((tx) => tx.id !== txId));
    return true;
  };

  const updateTransactionFinancials = async (txId, updatedData) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === txId) {
          const newItems = tx.items.map(item => {
            const updatedItem = updatedData.items.find(ui => ui.id === item.id);
            if (updatedItem) {
              return { ...item, hargaBeli: updatedItem.hargaBeli, hargaJual: updatedItem.hargaJual };
            }
            return item;
          });
          return { 
            ...tx, 
            total: updatedData.total, 
            salesperson: updatedData.salesperson !== undefined ? updatedData.salesperson : tx.salesperson,
            helper: updatedData.helper !== undefined ? updatedData.helper : tx.helper,
            items: newItems 
          };
        }
        return tx;
      })
    );
    return true;
  };

  const addWarrantyClaim = (claim) => {
    const newClaim = {
      ...claim,
      id: 'w_' + Date.now(),
      claimDate: new Date().toISOString(),
      status: 'Proses'
    };
    setWarrantyClaims((prev) => [newClaim, ...prev]);
  };

  const updateWarrantyClaimStatus = (claimId, newStatus, notes) => {
    setWarrantyClaims((prev) =>
      prev.map((claim) => claim.id === claimId ? { ...claim, status: newStatus, notes } : claim)
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser, setCurrentUser, handleLogout,
        usersList, addUser, deleteUser, updateUserRole, updateUserPin, updateUserEmail, resetUserPassword,
        inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem,
        cart, addToCart, removeFromCart, updateCartQty, updateCartItemImei, clearCart,
        pendingTransactions, holdTransaction, resumeTransaction, cancelPendingTransaction,
        transactions, completeTransaction, updateTransactionFinancials, deleteTransaction,
        salespersons, addSalesperson, deleteSalesperson,
        loginHistory, fetchLoginHistory,
        warrantyClaims, addWarrantyClaim, updateWarrantyClaimStatus,
        expenses, addExpense, deleteExpense,
        theme, toggleTheme, isThemeTransitioning, transitioningTo
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
