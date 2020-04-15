function triggerModal(message) {
  const overlay = document.querySelector('.overlay'),
        modal = document.querySelector('.modal'),
        modalMsg = document.querySelector('.modal-message'),
        printBtn = document.querySelector('.btn-print');

  if (localStorage.getItem('purchase') === 'true') {
    printBtn.style.display = 'block';
  } else {
    printBtn.style.display = 'none';
  }

  modalMsg.innerText = message;
  modal.classList.add('active');
  overlay.classList.add('active');
};

function closeModal() {
  const overlay = document.querySelector('.overlay'),
        modal = document.querySelector('.modal');

  modal.classList.remove('active');
  overlay.classList.remove('active');

  if (localStorage.getItem('purchase') === 'true') {
    localStorage.setItem('purchase', false);
    clearCart();
  }
};

function checkCartEmpty() {
  const cartEmpty = document.querySelector('.cart-empty'),
        cartItemsContainer = document.querySelector('.cart-items');

  if (cartItemsContainer.childElementCount > 1) { // Ignore cart header row
    cartEmpty.style.display = 'none';
  } else {
    cartEmpty.style.display = 'block';
  }
};

function checkDuplicateItem(cartItemNames, title) {
  let bool = false;

  for (let i = 0; i < cartItemNames.length; i++) {
    if (cartItemNames[i].innerText == title) {
      triggerModal('This item has already been added to the cart.');
      bool = true;
      break;
    }
  }

  return bool;
};

function removeCartItem(e) {
  const btnClicked = e.target;

  // Remove cart item row
  btnClicked.parentElement.parentElement.remove();

  updateCartTotal();
  checkCartEmpty();
};

function updateQuantity(e) {
  const input = e.target;

  // Prevent invalid quantity
  if (isNaN(input.value) || input.value <= 0) {
    input.value = 1;
  }

  updateCartTotal();
};

function addItemToCart(title, price, imageSrc) {
  const cartRow = document.createElement('div'),
        cartItemsContainer = document.querySelector('.cart-items');

  // Build new cart item
  cartRow.classList.add('cart-row');

  const cartRowContents = `
    <div class="cart-item cart-column">
      <img class="cart-item-image" src="${imageSrc}" width="100" height="100">
      <span class="cart-item-title">${title}</span>
    </div>
    <span class="cart-price cart-column">${price}</span>
    <div class="cart-quantity cart-column">
      <input class="cart-quantity-input" type="number" value="1">
      <div class="btn-remove" type="button">&times;</div>
    </div>
  `;

  // Update cart with added item
  cartRow.innerHTML = cartRowContents;
  cartItemsContainer.append(cartRow);

  // Add event listener to cart item remove button
  cartRow.querySelector('.btn-remove').addEventListener('click', removeCartItem);
  // Add event listener to cart item quantity
  cartRow.querySelector('.cart-quantity-input').addEventListener('change', updateQuantity);

  // Remove empty cart message
  checkCartEmpty();
};

function updateCartTotal() {
  const cartItemContainer = document.querySelector('.cart-items'),
        cartRows = cartItemContainer.querySelectorAll('.cart-row'),
        cartTotalEl = document.querySelector('.cart-total-price');
  let total = 0;

  // Add all item totals
  cartRows.forEach(row => {
    const priceEl = row.querySelector('.cart-price'),
          quantityEl = row.querySelector('.cart-quantity-input');
    
    const price = parseFloat(priceEl.innerText.replace('£', '')), // Convert price string to integer
          quantity = quantityEl.value;

    total = total + (price * quantity);
  });

  // Check for discount
  if (localStorage.getItem('discountAmount')) {
    const discountAmount = parseFloat(localStorage.getItem('discountAmount'));
    total = total - ((total / 100) * discountAmount);
  }
  cartTotalEl.innerText = '£' + total.toFixed(2);
}

function addToCartClicked(e) {
  const btn = e.target,
        shopItem = btn.parentElement.parentElement,
        title = shopItem.querySelector('.shop-item-title').innerText,
        price = shopItem.querySelector('.shop-item-price').innerText,
        imageSrc = shopItem.querySelector('.shop-item-image').src,
        cartItemNames = document.querySelectorAll('.cart-item-title');

  if (checkDuplicateItem(cartItemNames, title)) {
    return;
  } else {
    addItemToCart(title, price, imageSrc);
    updateCartTotal();
    // Navigate to cart
    document.location = '#cart';
  }
};

function displayDiscountCode() {
  if (localStorage.getItem('discountAmount')) {
    const discountAmount = parseFloat(localStorage.getItem('discountAmount')),
          discountInfo = document.querySelector('.cart-total-discount');
  
    discountInfo.innerText = `-${discountAmount}% discount`;
  } else {
    return;
  }
};

function applyDiscountCode(amount) {
  localStorage.setItem('discountAmount', amount);
  displayDiscountCode();
  triggerModal(`${amount}% discount applied!`);
};

function checkDiscountCode() {
  const discountCodeInput = document.querySelector('.input-discount-code');
  let discountCodes = JSON.parse(localStorage.getItem('discountCodes')),
      usedDiscountCodes = JSON.parse(localStorage.getItem('usedDiscountCodes')),
      discountCode = discountCodeInput.value.toLowerCase();
      
  if (discountCode !== '') {
    const usedDiscountMatch = usedDiscountCodes.map(discount => discount['code']).indexOf(discountCode),
          newDiscountMatch = discountCodes.map(discount => discount['code']).indexOf(discountCode);

    for (let i = 0; i < discountCodes.length; i++) {
      if (usedDiscountMatch > -1) {
        triggerModal('Sorry, that discount code has already been used.');
        break;
      } else if (newDiscountMatch > -1) {
        const amount = discountCodes[newDiscountMatch].amount;
        // Apply valid discount code
        applyDiscountCode(amount);
        // Update discount code records
        usedDiscountCodes.push({ code: discountCode, amount: amount });
        discountCodes.splice(newDiscountMatch, 1);
        localStorage.setItem('usedDiscountCodes', JSON.stringify(usedDiscountCodes));
        localStorage.setItem('discountCodes', JSON.stringify(discountCodes));

        updateCartTotal();
        break;
      } else {
        triggerModal("Sorry, that discount code isn't valid.");
        break;
      }
    }
  } else {
    triggerModal("Please enter a valid discount code.");
  }

  // Reset discount code input
  discountCodeInput.value = '';
};

function clearCart() {
  const cartItemsContainer = document.querySelector('.cart-items'),
        cartRows = document.querySelectorAll('.cart-row');

  if (cartRows.length > 1) { // Ignore cart header row
    if (localStorage.getItem('purchase')) {
      // Prevent hidden cart empty message being removed
      for (let i = 1; i < cartRows.length; i++) {
        cartItemsContainer.removeChild(cartItemsContainer.lastChild);
      }
    } else {
      for (let i = 0; i < cartRows.length; i++) {
        cartItemsContainer.removeChild(cartItemsContainer.lastChild);
      }
    }
  } else {
    triggerModal('Cart is already empty.');
  }

  updateCartTotal();
  checkCartEmpty();
};

function printReceipt(content) {
  const restorePage = document.body.innerHTML,
        printContent = document.querySelector(content).innerHTML;

  // Print cart only
  document.body.innerHTML = printContent;
  window.print();
  // Reset document
  document.body.innerHTML = restorePage;
  setEventListeners();
}

// Empty cart on purchase / Alert empty cart
function purchaseClicked() {
  const cartRows = document.querySelectorAll('.cart-row'),
        discountInfo = document.querySelector('.cart-total-discount');

  if (cartRows.length > 1) {
    localStorage.setItem('purchase', true);
    triggerModal('Thank you for your purchase!');
    discountInfo.innerText = '';
  } else {
    triggerModal('Please add an item to the cart...');
  }
}

function setEventListeners() {
  const addToCartBtn = document.querySelectorAll('.btn-shop-item'),
        quantityInputs = document.querySelectorAll('.cart-quantity-input'),
        removeCartItemBtns = document.querySelectorAll('.btn-remove'),
        discountSubmit = document.querySelector('.btn-discount'),
        clearCartBtn = document.querySelector('.btn-clear-cart'),
        purchaseBtn = document.querySelector('.btn-purchase'),
        overlay = document.querySelector('.overlay'),
        closeModalBtn = document.querySelector('.btn-modal-close');

  addToCartBtn.forEach(btn => {
    btn.addEventListener('click', addToCartClicked);
  });

  quantityInputs.forEach(input => {
    input.addEventListener('change', updateQuantity);
  });

  removeCartItemBtns.forEach(btn => {
    btn.addEventListener('click', removeCartItem);
  });

  discountSubmit.addEventListener('click', checkDiscountCode);

  clearCartBtn.addEventListener('click', clearCart);

  purchaseBtn.addEventListener('click', purchaseClicked);

  closeModalBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
}

function setDiscountCodes() {
  const discountCodes = [
    { code: 'shade10', amount: 10},
    { code: 'shade20', amount: 20},
    { code: 'shade30', amount: 30},
    { code: 'shade40', amount: 40},
    { code: 'shade50', amount: 50},
    { code: 'shade60', amount: 60},
    { code: 'shade70', amount: 70},
    { code: 'shade80', amount: 80}
  ],
  usedDiscountCodes = [];

  if (localStorage.getItem('discountCodes')) {
    return;
  } else {
    localStorage.setItem('discountCodes', JSON.stringify(discountCodes));
    localStorage.setItem('usedDiscountCodes', JSON.stringify(usedDiscountCodes));
  }
}

setDiscountCodes();
setEventListeners();