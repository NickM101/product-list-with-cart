class ShoppingCart {
  constructor() {
    this.productsContainer = document.getElementById('products');
    this.cartContents = document.getElementById('cart-contents');
    this.cartQuantity = document.getElementById('cart-quantity');
    this.totalPriceValue = document.getElementById('total-price-value');
    this.checkoutContainer = document.getElementById('checkout-container');
    this.confirmOrderBtn = document.getElementById('confirm-order');
    
    this.cart = [];
    this.desserts = [];
    
    this.init();
  }
  
  init() {
    this.fetchDesserts();
    
    if (this.confirmOrderBtn) {
      this.confirmOrderBtn.addEventListener('click', () => this.confirmOrder());
    }
  }
  
  fetchDesserts() {
    fetch('./data.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        this.desserts = data;
        this.displayProducts();
      })
      .catch(error => {
        console.error('Error fetching desserts:', error);
        this.productsContainer.innerHTML = `<div class="error-message">Failed to load products. Please refresh the page.</div>`;
      });
  }
  
  displayProducts() {
    this.productsContainer.innerHTML = '';

    if (!this.desserts || this.desserts.length === 0) {
      this.productsContainer.innerHTML = '<div class="error-message">No products available</div>';
      return;
    }

    this.desserts.forEach(dessert => {
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

      this.productsContainer.appendChild(productElement);
      
      const addBtn = productElement.querySelector('.add-to-cart-btn');
      const decreaseBtn = productElement.querySelector('.decrease-btn');
      const increaseBtn = productElement.querySelector('.increase-btn');
      const quantityControls = productElement.querySelector('.quantity-controls');
      
      addBtn.addEventListener('click', () => {
        addBtn.style.display = 'none';
        quantityControls.style.display = 'flex';
        
        this.addToCart(dessert.id);
      });
      
      decreaseBtn.addEventListener('click', () => {
        this.decreaseQuantity(dessert.id, productElement);
      });
      
      increaseBtn.addEventListener('click', () => {
        this.increaseQuantity(dessert.id);
      });
    });
  }
  
  addToCart(productId) {
    const dessert = this.desserts.find(item => item.id === productId);
    
    if (!dessert) return;
    
    const existingItem = this.cart.find(item => item.id === productId);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        id: dessert.id,
        name: dessert.name,
        price: dessert.price,
        quantity: 1
      });
    }
    
    this.updateCart();
  }
  
  decreaseQuantity(productId, productElement) {
    const existingItem = this.cart.find(item => item.id === productId);
    
    if (!existingItem) return;
    
    existingItem.quantity -= 1;
    
    if (existingItem.quantity <= 0) {
      this.cart = this.cart.filter(item => item.id !== productId);
      
      const addBtn = productElement.querySelector('.add-to-cart-btn');
      const quantityControls = productElement.querySelector('.quantity-controls');
      
      addBtn.style.display = 'flex';
      quantityControls.style.display = 'none';
    } else {
      const quantityValue = productElement.querySelector('.quantity-value');
      quantityValue.textContent = existingItem.quantity;
    }
    
    this.updateCart();
  }
  
  increaseQuantity(productId) {
    const existingItem = this.cart.find(item => item.id === productId);
    
    if (!existingItem) return;
    
    existingItem.quantity += 1;
    
    const productElement = document.querySelector(`.product[data-id="${productId}"]`);
    const quantityValue = productElement.querySelector('.quantity-value');
    quantityValue.textContent = existingItem.quantity;
    
    this.updateCart();
  }
  
  updateCart() {
    const totalItems = this.cart.reduce((total, item) => total + item.quantity, 0);
    this.cartQuantity.textContent = totalItems;

    if (this.cart.length === 0) {
      this.cartContents.innerHTML = `
        <img src="assets/images/illustration-empty-cart.svg" class="empty-cart" alt="empty-cart">
        <p class="empty-cart-message">
          Your added items will appear here
        </p>
      `;
      this.checkoutContainer.style.display = 'none';
    } else {
      this.cartContents.innerHTML = '';

      this.cart.forEach(item => {
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

        this.cartContents.appendChild(cartItem);
      });

      document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', () => {
          const productId = parseInt(button.getAttribute('data-id'));
          this.removeFromCart(productId);
        });
      });

      this.checkoutContainer.style.display = 'block';

      const totalPrice = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      this.totalPriceValue.textContent = totalPrice.toFixed(2);
    }
    
    this.cart.forEach(item => {
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
  
  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    
    const productElement = document.querySelector(`.product[data-id="${productId}"]`);
    if (productElement) {
      const addBtn = productElement.querySelector('.add-to-cart-btn');
      const quantityControls = productElement.querySelector('.quantity-controls');
      
      addBtn.style.display = 'flex';
      quantityControls.style.display = 'none';
    }
    
    this.updateCart();
  }
  
  confirmOrder() {
    alert('Your order has been placed! Total: $' + this.totalPriceValue.textContent);
    this.cart = [];
    this.updateCart();
  }
}

class Product {
  constructor(dessert, cart) {
    this.id = dessert.id;
    this.name = dessert.name;
    this.price = dessert.price;
    this.image = dessert.image;
    this.category = dessert.category;
    this.cart = cart;
    this.element = null;
  }
  
  render() {
    const productElement = document.createElement('div');
    productElement.classList.add('product');
    productElement.setAttribute('data-id', this.id);
    
    productElement.innerHTML = `
      <picture class="product-image">
        <source media="(min-width: 1024px)" srcset="${this.image.desktop}">
        <source media="(min-width: 768px)" srcset="${this.image.tablet}">
        <source media="(max-width: 767px)" srcset="${this.image.mobile}">
        <img src="${this.image.thumbnail}" alt="${this.name}">
      </picture>
      <div class="product-details">
          <p class="product-category">${this.category}</p>
          <h3 class="product-name">${this.name}</h3>
          <p class="product-price">$${this.price.toFixed(2)}</p>
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
    
    this.element = productElement;
    this.addEventListeners();
    
    return productElement;
  }
  
  addEventListeners() {
    const addBtn = this.element.querySelector('.add-to-cart-btn');
    const decreaseBtn = this.element.querySelector('.decrease-btn');
    const increaseBtn = this.element.querySelector('.increase-btn');
    
    addBtn.addEventListener('click', () => this.addToCart());
    decreaseBtn.addEventListener('click', () => this.decreaseQuantity());
    increaseBtn.addEventListener('click', () => this.increaseQuantity());
  }
  
  addToCart() {
    const addBtn = this.element.querySelector('.add-to-cart-btn');
    const quantityControls = this.element.querySelector('.quantity-controls');
    
    addBtn.style.display = 'none';
    quantityControls.style.display = 'flex';
    
    this.cart.addItem(this);
  }
  
  decreaseQuantity() {
    this.cart.decreaseItem(this.id);
    
    const item = this.cart.getItem(this.id);
    
    if (!item) {
      const addBtn = this.element.querySelector('.add-to-cart-btn');
      const quantityControls = this.element.querySelector('.quantity-controls');
      
      addBtn.style.display = 'flex';
      quantityControls.style.display = 'none';
    } else {
      this.updateQuantityDisplay(item.quantity);
    }
  }
  
  increaseQuantity() {
    this.cart.increaseItem(this.id);
    const item = this.cart.getItem(this.id);
    if (item) {
      this.updateQuantityDisplay(item.quantity);
    }
  }
  
  updateQuantityDisplay(quantity) {
    const quantityValue = this.element.querySelector('.quantity-value');
    if (quantityValue) {
      quantityValue.textContent = quantity;
    }
  }
  
  updateDisplay(inCart, quantity = 0) {
    const addBtn = this.element.querySelector('.add-to-cart-btn');
    const quantityControls = this.element.querySelector('.quantity-controls');
    const quantityValue = this.element.querySelector('.quantity-value');
    
    if (inCart) {
      addBtn.style.display = 'none';
      quantityControls.style.display = 'flex';
      quantityValue.textContent = quantity;
    } else {
      addBtn.style.display = 'flex';
      quantityControls.style.display = 'none';
    }
  }
}

class CartItem {
  constructor(product, quantity = 1) {
    this.id = product.id;
    this.name = product.name;
    this.price = product.price;
    this.quantity = quantity;
  }
  
  getTotal() {
    return this.price * this.quantity;
  }
}

class DessertShop {
  constructor() {
    this.cart = new ShoppingCart();
    
    document.addEventListener('DOMContentLoaded', () => {
      this.cart.init();
    });
  }
}

const dessertShop = new DessertShop();