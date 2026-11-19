import { test, describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Logika fungsi addToCart yang diuji dari IzyStore (src/context/AppContext.jsx)
 */
export function addToCart(product, cart, setCart) {
  if (product.kategori === 'Gadget') {
    const countInCart = cart.filter((item) => item.id === product.id).length;
    if (countInCart >= product.stok) {
      return { success: false, message: 'Stok gadget ini di keranjang sudah maksimal.' };
    }
    const cartId = 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    setCart([...cart, { ...product, cartId, qty: 1 }]);
    return { success: true };
  } else {
    const existingItemIndex = cart.findIndex((item) => item.id === product.id);
    if (existingItemIndex > -1) {
      if (cart[existingItemIndex].qty >= product.stok) {
        return { success: false, message: 'Stok aksesoris tidak mencukupi.' };
      }
      setCart(
        cart.map((item, idx) =>
          idx === existingItemIndex ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    return { success: true };
  }
}

describe('Unit Testing: IzyStore - Fitur Keranjang Kasir (addToCart)', () => {

  // ==========================================
  // TEST DOUBLE 1: STUB (Objek Data Tiruan)
  // ==========================================
  const stubGadget = {
    id: 1,
    nama: 'iPhone 11 64GB Black',
    kategori: 'Gadget',
    stok: 1,
    hargaJual: 4500000
  };

  const stubAksesoris = {
    id: 2,
    nama: 'Charger 20W Original',
    kategori: 'Aksesoris',
    stok: 3,
    hargaJual: 250000
  };

  it('TC-01: Berhasil menambahkan produk Gadget baru ke dalam keranjang', () => {
    // TEST DOUBLE 2: MOCK (Meniru fungsi callback setCart)
    const mockSetCart = mock.fn();
    const initialCart = [];

    const result = addToCart(stubGadget, initialCart, mockSetCart);

    assert.equal(result.success, true);
    assert.equal(mockSetCart.mock.calls.length, 1);
    const updatedCart = mockSetCart.mock.calls[0].arguments[0];
    assert.equal(updatedCart.length, 1);
    assert.equal(updatedCart[0].id, stubGadget.id);
    assert.equal(updatedCart[0].qty, 1);
    assert.ok(updatedCart[0].cartId); // Memiliki unique cartId
  });

  it('TC-02: Menolak penambahan Gadget jika stok di keranjang sudah maksimal', () => {
    const mockSetCart = mock.fn();
    // Keranjang sudah berisi 1 unit gadget (sesuai stok maksimal = 1)
    const existingCart = [{ ...stubGadget, cartId: 'cart_123', qty: 1 }];

    const result = addToCart(stubGadget, existingCart, mockSetCart);

    assert.equal(result.success, false);
    assert.match(result.message, /Stok gadget ini di keranjang sudah maksimal/);
    assert.equal(mockSetCart.mock.calls.length, 0); // setCart TIDAK boleh dipanggil
  });

  it('TC-03: Berhasil menambahkan produk Aksesoris baru ke keranjang kosong', () => {
    const mockSetCart = mock.fn();
    const initialCart = [];

    const result = addToCart(stubAksesoris, initialCart, mockSetCart);

    assert.equal(result.success, true);
    assert.equal(mockSetCart.mock.calls.length, 1);
    const updatedCart = mockSetCart.mock.calls[0].arguments[0];
    assert.equal(updatedCart[0].id, stubAksesoris.id);
    assert.equal(updatedCart[0].qty, 1);
  });

  it('TC-04: Menambah kuantitas (qty + 1) jika Aksesoris sudah ada di keranjang', () => {
    const mockSetCart = mock.fn();
    // Keranjang sudah ada aksesoris dengan qty 1 (stok tersedia = 3)
    const existingCart = [{ ...stubAksesoris, qty: 1 }];

    const result = addToCart(stubAksesoris, existingCart, mockSetCart);

    assert.equal(result.success, true);
    assert.equal(mockSetCart.mock.calls.length, 1);
    const updatedCart = mockSetCart.mock.calls[0].arguments[0];
    assert.equal(updatedCart[0].qty, 2); // Kuantitas bertambah jadi 2
  });

  it('TC-05: Menolak penambahan Aksesoris jika kuantitas melebihi stok fisik', () => {
    const mockSetCart = mock.fn();
    // Keranjang sudah ada 3 aksesoris (stok fisik = 3)
    const existingCart = [{ ...stubAksesoris, qty: 3 }];

    const result = addToCart(stubAksesoris, existingCart, mockSetCart);

    assert.equal(result.success, false);
    assert.match(result.message, /Stok aksesoris tidak mencukupi/);
    assert.equal(mockSetCart.mock.calls.length, 0); // setCart TIDAK dipanggil
  });
});
