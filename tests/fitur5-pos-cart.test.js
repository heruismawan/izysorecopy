import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

export function addToCart(product, cart, setCart) {
  if (product.kategori === 'Gadget') {
    const countInCart = cart.filter((item) => item.id === product.id).length;
    if (countInCart >= product.stok) {
      return { success: false, message: 'Stok gadget ini di keranjang sudah maksimal.' };
    }
    const cartId = 'cart_' + Date.now();
    setCart([...cart, { ...product, cartId, qty: 1 }]);
    return { success: true };
  } else {
    const existingItemIndex = cart.findIndex((item) => item.id === product.id);
    if (existingItemIndex > -1) {
      if (cart[existingItemIndex].qty >= product.stok) {
        return { success: false, message: 'Stok aksesoris tidak mencukupi.' };
      }
      setCart(cart.map((item, idx) => (idx === existingItemIndex ? { ...item, qty: item.qty + 1 } : item)));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    return { success: true };
  }
}

describe('Fitur 5: Kasir Point of Sales (POS - addToCart)', () => {
  // TEST DOUBLE 1: STUB
  const stubGadget = { id: 101, model: 'iPhone 13', kategori: 'Gadget', stok: 1, hargaJual: 8500000 };
  const stubAksesoris = { id: 202, model: 'Adapter 20W', kategori: 'Aksesoris', stok: 2, hargaJual: 250000 };

  it('TC-F5-01: Berhasil menambah Gadget baru dan menambah qty Aksesoris ke keranjang (Positive)', () => {
    // Arrange
    const mockSetCart = mock.fn(); // TEST DOUBLE 2: MOCK
    // Act
    const resGadget = addToCart(stubGadget, [], mockSetCart);
    const resAccNew = addToCart(stubAksesoris, [], mockSetCart);
    const resAccInc = addToCart(stubAksesoris, [{ ...stubAksesoris, qty: 1 }], mockSetCart);
    // Assert
    assert.equal(resGadget.success, true);
    assert.equal(resAccNew.success, true);
    assert.equal(resAccInc.success, true);
    assert.equal(mockSetCart.mock.calls.length, 3);
  });

  it('TC-F5-02: Menolak penambahan Gadget maupun Aksesoris jika stok sudah habis (Negative)', () => {
    // Arrange
    const mockSetCart = mock.fn();
    // Act
    const resGadgetMax = addToCart(stubGadget, [{ ...stubGadget, qty: 1 }], mockSetCart);
    const resAccMax = addToCart(stubAksesoris, [{ ...stubAksesoris, qty: 2 }], mockSetCart);
    // Assert
    assert.equal(resGadgetMax.success, false);
    assert.equal(resAccMax.success, false);
    assert.equal(mockSetCart.mock.calls.length, 0);
  });
});
