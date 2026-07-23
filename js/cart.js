/* ==========================================================================
   Stackly — Central cart manager (add/remove/update items, persistence)
   Shared across all pages (nav cart badge). cart.html has no separate page
   script, so its render/DOM logic lives at the bottom of this file, guarded
   to only run when the cart page's markup is present.
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'stacklyCart';
  var DIRECT_BOOKING_KEY = 'stacklyDirectBooking';
  var TAX_RATE = 0.12;

  function getItems() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var items = raw ? JSON.parse(raw) : [];
      return Array.isArray(items) ? items : [];
    } catch (err) {
      return [];
    }
  }

  function saveItems(items) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  // `item` should already carry a `totalPrice` for one instance of the
  // booking (package-detail.js computes this from adults/children pricing).
  // addToCart assigns the unique cartItemId used by removeFromCart/updateQuantity.
  function addToCart(item) {
    var items = getItems();
    var stored = Object.assign({ qty: 1 }, item, {
      cartItemId: 'cart-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    });
    items.push(stored);
    saveItems(items);
    return stored;
  }

  function removeFromCart(cartItemId) {
    saveItems(getItems().filter(function (item) { return item.cartItemId !== cartItemId; }));
  }

  function updateQuantity(cartItemId, qty) {
    var nextQty = Math.max(1, Number(qty) || 1);
    saveItems(getItems().map(function (item) {
      return item.cartItemId === cartItemId ? Object.assign({}, item, { qty: nextQty }) : item;
    }));
  }

  function getLineTotal(item) {
    return (Number(item.totalPrice) || 0) * (Number(item.qty) || 1);
  }

  function getCartTotal() {
    var items = getItems();
    var subtotal = items.reduce(function (sum, item) { return sum + getLineTotal(item); }, 0);
    var tax = Math.round(subtotal * TAX_RATE);
    return { subtotal: subtotal, tax: tax, total: subtotal + tax };
  }

  function clearCart() {
    saveItems([]);
  }

  function getItemCount() {
    return getItems().reduce(function (total, item) {
      return total + (Number(item.qty) || 1);
    }, 0);
  }

  // Temporary single-item "skip the cart" booking state (session-only), set by a
  // page's "Select"/"Book Now" button and read by the checkout flow. `type` is
  // e.g. 'flight' or 'package' so checkout.js knows how to render/price the item.
  function setDirectBooking(type, item) {
    window.sessionStorage.setItem(DIRECT_BOOKING_KEY, JSON.stringify({ type: type, item: item }));
  }

  function getDirectBooking() {
    try {
      var raw = window.sessionStorage.getItem(DIRECT_BOOKING_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function clearDirectBooking() {
    window.sessionStorage.removeItem(DIRECT_BOOKING_KEY);
  }

  window.StacklyCart = {
    STORAGE_KEY: STORAGE_KEY,
    DIRECT_BOOKING_KEY: DIRECT_BOOKING_KEY,
    TAX_RATE: TAX_RATE,
    getItems: getItems,
    saveItems: saveItems,
    addToCart: addToCart,
    removeFromCart: removeFromCart,
    updateQuantity: updateQuantity,
    getLineTotal: getLineTotal,
    getCartTotal: getCartTotal,
    clearCart: clearCart,
    getItemCount: getItemCount,
    setDirectBooking: setDirectBooking,
    getDirectBooking: getDirectBooking,
    clearDirectBooking: clearDirectBooking
  };

  /* ------------------------------------------------------------------------
     cart.html render logic — no-ops on every other page since it bails out
     when #cart-items isn't found.
     ------------------------------------------------------------------------ */

  var formatCurrency = window.StacklyData && window.StacklyData.formatCurrency;

  function formatCartDate(item) {
    if (!item.travelDate) return '';
    return new Date(item.travelDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function cartItemMeta(item) {
    var parts = [item.destination, formatCartDate(item)];
    if (item.adults || item.children) {
      var travelerBits = [];
      if (item.adults) travelerBits.push(item.adults + ' Adult' + (item.adults === 1 ? '' : 's'));
      if (item.children) travelerBits.push(item.children + ' Child' + (item.children === 1 ? '' : 'ren'));
      parts.push(travelerBits.join(', '));
    }
    return parts.filter(Boolean).join(' · ');
  }

  function renderCartItem(item) {
    var itemImg = window.StacklyUtils.renderImg({
      className: 'cart-item-image',
      src: item.image || window.StacklyUtils.PLACEHOLDER_IMAGE,
      width: 120,
      height: 90,
      alt: item.title || 'Cart item'
    });

    return (
      '<article class="cart-item" data-cart-id="' + item.cartItemId + '">' +
        itemImg +
        '<div class="cart-item-body">' +
          '<h3>' + item.title + '</h3>' +
          '<p class="cart-item-meta">' + cartItemMeta(item) + '</p>' +
          '<div class="stepper cart-item-qty">' +
            '<button type="button" class="stepper-btn" data-action="decrease" data-cart-id="' + item.cartItemId + '" aria-label="Decrease quantity">−</button>' +
            '<span>' + (item.qty || 1) + '</span>' +
            '<button type="button" class="stepper-btn" data-action="increase" data-cart-id="' + item.cartItemId + '" aria-label="Increase quantity">+</button>' +
          '</div>' +
        '</div>' +
        '<div class="cart-item-actions">' +
          '<p class="cart-item-price">' + formatCurrency(getLineTotal(item)) + '</p>' +
          '<button type="button" class="cart-item-remove" data-cart-id="' + item.cartItemId + '">Remove</button>' +
        '</div>' +
      '</article>'
    );
  }

  function renderCartPage() {
    var emptyState = document.getElementById('cart-empty-state');
    var content = document.getElementById('cart-content');
    var itemsContainer = document.getElementById('cart-items');
    var items = getItems();

    if (!items.length) {
      emptyState.hidden = false;
      content.hidden = true;
      return;
    }

    emptyState.hidden = true;
    content.hidden = false;
    itemsContainer.innerHTML = items.map(renderCartItem).join('');

    var totals = getCartTotal();
    document.getElementById('summary-subtotal').textContent = formatCurrency(totals.subtotal);
    document.getElementById('summary-tax').textContent = formatCurrency(totals.tax);
    document.getElementById('summary-total').textContent = formatCurrency(totals.total);
  }

  function bindCartEvents() {
    document.getElementById('cart-items').addEventListener('click', function (event) {
      var removeBtn = event.target.closest('.cart-item-remove');
      if (removeBtn) {
        removeFromCart(removeBtn.dataset.cartId);
        renderCartPage();
        window.StacklyUtils.updateCartBadge();
        return;
      }

      var stepBtn = event.target.closest('.stepper-btn');
      if (stepBtn) {
        var item = getItems().filter(function (i) { return i.cartItemId === stepBtn.dataset.cartId; })[0];
        if (!item) return;
        var currentQty = Number(item.qty) || 1;
        var nextQty = stepBtn.dataset.action === 'increase' ? currentQty + 1 : currentQty - 1;
        if (nextQty < 1) return;
        updateQuantity(stepBtn.dataset.cartId, nextQty);
        renderCartPage();
        window.StacklyUtils.updateCartBadge();
      }
    });
  }

  function initCartPage() {
    if (!document.getElementById('cart-items')) return;
    bindCartEvents();
    renderCartPage();
  }

  document.addEventListener('DOMContentLoaded', initCartPage);
})();
