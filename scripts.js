const productsContainer = document.getElementById('products');
const cartContents = document.getElementById('cart-contents');
const cartQuantity = document.getElementById('cart-quantity');
const totalPriceValue = document.getElementById('total-price-value');
const checkoutContainer = document.getElementById('checkout-container');
const confirmOrderBtn = document.getElementById('confirm-order');

let cart = [];
let desserts = [];

function fetchDesserts() {
  fetch('./data.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      desserts = data;
      displayProducts();
    })
    .catch(error => {
      console.error('Error fetching desserts:', error);
      productsContainer.innerHTML = `<div class="error-message">Failed to load products. Please refresh the page.</div>`;
    });
}

function displayProducts() {
  productsContainer.innerHTML = '';

  if (!desserts || desserts.length === 0) {
    productsContainer.innerHTML = '<div class="error-message">No products available</div>';
    return;
  }

  desserts.forEach(dessert => {
    const productElement = document.createElement('div');
    productElement.classList.add('product');
    productElement.setAttribute('data-id', dessert.id);
    
    productElement.innerHTML = `
      <picture class="product-image">
        <source media="(min-width: 1024px)" srcset="${dessert.image.desktop}">
        <source media="(min-width: 768px)" srcset="${dessert.image.tablet}">
        <source media="(max-width: 767px)" srcset="${dessert.image.mobile}">
        <img src="${dessert.image.thumbnail}" alt="${dessert.name}">
      </picture>
      <div class="product-details">
          <p class="product-category">${dessert.category}</p>
          <h3 class="product-name">${dessert.name}</h3>
          <p class="product-price">$${dessert.price.toFixed(2)}</p>
        <div class="cart-button">
            <button class="add-to-cart-btn">
                 Add to Cart
            </button>
            <div class="quantity-controls" style="display: none;">
                <button class="quantity-btn decrease-btn">-</button>
                <span class="quantity-value">1</span>
                <button class="quantity-btn increase-btn">+</button>
            </div>
        </div>
      </div>
    `;

    productsContainer.appendChild(productElement);
    
    const addBtn = productElement.querySelector('.add-to-cart-btn');
    const decreaseBtn = productElement.querySelector('.decrease-btn');
    const increaseBtn = productElement.querySelector('.increase-btn');
    const quantityControls = productElement.querySelector('.quantity-controls');
    
    addBtn.addEventListener('click', function() {
      addBtn.style.display = 'none';
      quantityControls.style.display = 'flex';
      
      addToCart(dessert.id);
    });
    
    decreaseBtn.addEventListener('click', function() {
      decreaseQuantity(dessert.id, productElement);
    });
    
    increaseBtn.addEventListener('click', function() {
      increaseQuantity(dessert.id);
    });
  });
}

function addToCart(productId) {
  const dessert = desserts.find(item => item.id === productId);
  
  if (!dessert) return;
  
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: dessert.id,
      name: dessert.name,
      price: dessert.price,
      quantity: 1
    });
  }
  
  updateCart();
}

function decreaseQuantity(productId, productElement) {
  const existingItem = cart.find(item => item.id === productId);
  
  if (!existingItem) return;
  
  existingItem.quantity -= 1;
  
  if (existingItem.quantity <= 0) {
    cart = cart.filter(item => item.id !== productId);
    
    const addBtn = productElement.querySelector('.add-to-cart-btn');
    const quantityControls = productElement.querySelector('.quantity-controls');
    
    addBtn.style.display = 'flex';
    quantityControls.style.display = 'none';
  } else {
    const quantityValue = productElement.querySelector('.quantity-value');
    quantityValue.textContent = existingItem.quantity;
  }
  
  updateCart();
}

function increaseQuantity(productId) {
  const existingItem = cart.find(item => item.id === productId);
  
  if (!existingItem) return;
  
  existingItem.quantity += 1;
  
  const productElement = document.querySelector(`.product[data-id="${productId}"]`);
  const quantityValue = productElement.querySelector('.quantity-value');
  quantityValue.textContent = existingItem.quantity;
  
  updateCart();
}

function updateCart() {
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  cartQuantity.textContent = totalItems;

  if (cart.length === 0) {
    cartContents.innerHTML = `
      <img src="assets/images/illustration-empty-cart.svg" class="empty-cart" alt="empty-cart">
      <p class="empty-cart-message">
        Your added items will appear here
      </p>
    `;
    checkoutContainer.style.display = 'none';
  } else {
    cartContents.innerHTML = '';

    cart.forEach(item => {
      const cartItem = document.createElement('div');
      cartItem.classList.add('cart-item');

      cartItem.innerHTML = `
        <div class="cart-item-info">
          <h4 class="cart-item-name">${item.name}</h4>
          <div class="cart-item-price">
            <span>${item.quantity}x</span>
            <span class="cart-item-unit-price">@ $${item.price.toFixed(2)}</span>
            <span class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        </div>
        <div class="cart-item-actions">
          <button class="remove-item" data-id="${item.id}">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.834 5H4.167m4.166 3.333v5M11.667 8.333v5M15 5l-.667 10c-.068 1.016-.103 1.524-.3 1.904a2 2 0 01-.796.83C12.857 18 12.347 18 11.33 18H8.671c-1.019 0-1.528 0-1.909-.266a2 2 0 01-.795-.83c-.198-.38-.232-.888-.3-1.904L5 5m4.167-1.667V2.5h1.666v.833" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      `;

      cartContents.appendChild(cartItem);
    });

    document.querySelectorAll('.remove-item').forEach(button => {
      button.addEventListener('click', function() {
        const productId = parseInt(this.getAttribute('data-id'));
        removeFromCart(productId);
      });
    });

    checkoutContainer.style.display = 'block';

    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    totalPriceValue.textContent = totalPrice.toFixed(2);
  }
  
  cart.forEach(item => {
    const productElement = document.querySelector(`.product[data-id="${item.id}"]`);
    if (productElement) {
      const addBtn = productElement.querySelector('.add-to-cart-btn');
      const quantityControls = productElement.querySelector('.quantity-controls');
      const quantityValue = productElement.querySelector('.quantity-value');
      
      addBtn.style.display = 'none';
      quantityControls.style.display = 'flex';
      quantityValue.textContent = item.quantity;
    }
  });
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  
  const productElement = document.querySelector(`.product[data-id="${productId}"]`);
  if (productElement) {
    const addBtn = productElement.querySelector('.add-to-cart-btn');
    const quantityControls = productElement.querySelector('.quantity-controls');
    
    addBtn.style.display = 'flex';
    quantityControls.style.display = 'none';
  }
  
  updateCart();
}

function confirmOrder() {
  alert('Your order has been placed! Total: $' + totalPriceValue.textContent);
  cart = [];
  updateCart();
}

document.addEventListener('DOMContentLoaded', () => {
  fetchDesserts();
  
  if (confirmOrderBtn) {
    confirmOrderBtn.addEventListener('click', confirmOrder);
  }
});