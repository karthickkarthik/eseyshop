// E-commerce Website JavaScript
class ECommerceApp {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        this.user = JSON.parse(localStorage.getItem('user')) || null;
        this.currentSection = 'home';
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.slide');
        this.products = this.generateSampleProducts();
        
        this.init();
    }

    init() {
        this.hideLoader();
        this.setupEventListeners();
        this.updateCartCount();
        this.updateWishlistCount();
        this.loadProducts();
        this.startSlider();
        this.loadUserData();
        this.setupTheme();
    }

    // Loader
    hideLoader() {
        setTimeout(() => {
            document.getElementById('loader').classList.add('hidden');
        }, 1500);
    }

    // Theme Management
    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        localStorage.setItem('theme', theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('cartBtn').addEventListener('click', () => this.showSection('cart'));
        document.getElementById('wishlistBtn').addEventListener('click', () => {
            if (this.user) {
                this.showSection('user');
                this.switchUserTab('wishlist');
            } else {
                this.showUserModal();
            }
        });
        document.getElementById('userBtn').addEventListener('click', () => this.showUserModal());
        document.getElementById('mobileMenuBtn').addEventListener('click', () => this.toggleMobileMenu());

        // Search
        document.getElementById('searchBtn').addEventListener('click', () => this.handleSearch());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        // Mobile search
        const mobileSearchBtn = document.querySelector('.mobile-search button');
        const mobileSearchInput = document.querySelector('.mobile-search input');
        if (mobileSearchBtn && mobileSearchInput) {
            mobileSearchBtn.addEventListener('click', () => {
                const searchTerm = mobileSearchInput.value.trim();
                if (searchTerm) {
                    this.searchProducts(searchTerm);
                    this.showSection('products');
                }
            });
            mobileSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const searchTerm = mobileSearchInput.value.trim();
                    if (searchTerm) {
                        this.searchProducts(searchTerm);
                        this.showSection('products');
                    }
                }
            });
        }

        // Hero Slider
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });

        // Category Cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.filterProductsByCategory(category);
                this.showSection('products');
            });
        });

        // Category Items
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', () => {
                const category = item.dataset.category;
                this.filterProductsByCategory(category);
                this.showSection('products');
            });
        });

        // Product Filters
        document.getElementById('categoryFilter').addEventListener('change', () => this.filterProducts());
        document.getElementById('priceFilter').addEventListener('change', () => this.filterProducts());
        document.getElementById('sortFilter').addEventListener('change', () => this.sortProducts());

        // Checkout
        document.getElementById('checkoutBtn').addEventListener('click', () => this.showSection('checkout'));
        document.getElementById('placeOrderBtn').addEventListener('click', () => this.placeOrder());
        document.getElementById('sameAsBilling').addEventListener('change', this.toggleShippingForm);

        // Payment Methods
        document.querySelectorAll('input[name="payment"]').forEach(radio => {
            radio.addEventListener('change', this.toggleCardDetails);
        });

        // User Navigation
        document.querySelectorAll('.user-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchUserTab(tab);
            });
        });

        // FAQ
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', (e) => {
                const faqItem = e.target.closest('.faq-item');
                this.toggleFAQ(faqItem);
            });
        });

        // Forms
        document.getElementById('newsletterForm').addEventListener('submit', (e) => this.handleNewsletter(e));
        document.getElementById('contactForm').addEventListener('submit', (e) => this.handleContact(e));
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));

        // Modal Close
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => this.closeModal());
        });

        // Auth Tab Switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabType = e.target.dataset.tab;
                this.switchAuthTab(tabType);
            });
        });

        // Auth Switch Links
        document.querySelectorAll('.auth-switch a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tabType = e.target.dataset.tab;
                this.switchAuthTab(tabType);
            });
        });

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });
    }

    // Navigation
    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
            
            // Update breadcrumb
            this.updateBreadcrumb(sectionId);
            
            // Load section-specific content
            if (sectionId === 'cart') {
                this.loadCartItems();
            } else if (sectionId === 'checkout') {
                this.loadCheckoutItems();
            } else if (sectionId === 'user') {
                this.loadUserProfile();
            }
        }

        // Close mobile menu
        this.closeMobileMenu();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateBreadcrumb(sectionId) {
        const breadcrumbContainer = document.getElementById('breadcrumbContainer');
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        
        const sectionNames = {
            'home': 'Home',
            'products': 'Products',
            'categories': 'Categories',
            'cart': 'Shopping Cart',
            'checkout': 'Checkout',
            'user': 'My Account',
            'contact': 'Contact Us',
            'about': 'About Us',
            'faq': 'FAQ'
        };
        
        if (sectionId === 'home') {
            breadcrumbContainer.style.display = 'none';
        } else {
            breadcrumbContainer.style.display = 'block';
            breadcrumbCurrent.textContent = sectionNames[sectionId] || sectionId;
        }
    }

    toggleMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        mobileMenu.classList.toggle('show');
    }

    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        mobileMenu.classList.remove('show');
    }

    // Search
    handleSearch() {
        const searchTerm = document.getElementById('searchInput').value.trim();
        if (searchTerm) {
            this.searchProducts(searchTerm);
            this.showSection('products');
        }
    }

    searchProducts(term) {
        const filteredProducts = this.products.filter(product => 
            product.name.toLowerCase().includes(term.toLowerCase()) ||
            product.category.toLowerCase().includes(term.toLowerCase()) ||
            product.description.toLowerCase().includes(term.toLowerCase())
        );
        this.displayProducts(filteredProducts, 'allProducts');
        this.showToast(`Found ${filteredProducts.length} products for "${term}"`, 'success');
    }

    // Hero Slider
    startSlider() {
        setInterval(() => {
            this.nextSlide();
        }, 5000);
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.updateSlider();
    }

    goToSlide(index) {
        this.currentSlide = index;
        this.updateSlider();
    }

    updateSlider() {
        this.slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentSlide);
        });

        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    }

    // Product Management
    generateSampleProducts() {
        return [
            // Electronics
            {
                id: 1,
                name: "Wireless Bluetooth Headphones",
                category: "electronics",
                price: 99.99,
                originalPrice: 129.99,
                rating: 4.5,
                reviews: 128,
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
                description: "High-quality wireless headphones with noise cancellation",
                inStock: true,
                badge: "Sale"
            },
            {
                id: 2,
                name: "Smartphone - Latest Model",
                category: "electronics",
                price: 699.99,
                originalPrice: 799.99,
                rating: 4.8,
                reviews: 256,
                image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
                description: "Latest smartphone with advanced camera and performance",
                inStock: true,
                badge: "New"
            },
            {
                id: 6,
                name: "Gaming Laptop",
                category: "electronics",
                price: 1299.99,
                originalPrice: 1499.99,
                rating: 4.9,
                reviews: 203,
                image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop",
                description: "High-performance gaming laptop with RTX graphics",
                inStock: true,
                badge: "Hot"
            },
            {
                id: 9,
                name: "Smart Watch Series 8",
                category: "electronics",
                price: 299.99,
                originalPrice: 349.99,
                rating: 4.7,
                reviews: 312,
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
                description: "Advanced smartwatch with health monitoring and GPS",
                inStock: true,
                badge: "Popular"
            },
            {
                id: 10,
                name: "4K Ultra HD TV 55\"",
                category: "electronics",
                price: 899.99,
                originalPrice: 1199.99,
                rating: 4.6,
                reviews: 189,
                image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop",
                description: "55-inch 4K Smart TV with HDR and voice control",
                inStock: true,
                badge: "Featured"
            },
            {
                id: 11,
                name: "Wireless Charging Pad",
                category: "electronics",
                price: 29.99,
                originalPrice: 39.99,
                rating: 4.3,
                reviews: 87,
                image: "https://images.unsplash.com/photo-1609592807386-6c8b2b6e4c7a?w=300&h=300&fit=crop",
                description: "Fast wireless charging pad for smartphones and accessories",
                inStock: true,
                badge: "Sale"
            },
            {
                id: 12,
                name: "Bluetooth Speaker",
                category: "electronics",
                price: 79.99,
                originalPrice: 99.99,
                rating: 4.4,
                reviews: 156,
                image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop",
                description: "Portable Bluetooth speaker with 360-degree sound",
                inStock: true,
                badge: "Best Seller"
            },

            // Fashion
            {
                id: 3,
                name: "Designer T-Shirt",
                category: "fashion",
                price: 29.99,
                originalPrice: 39.99,
                rating: 4.3,
                reviews: 89,
                image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
                description: "Comfortable cotton t-shirt with modern design",
                inStock: true,
                badge: "Popular"
            },
            {
                id: 7,
                name: "Denim Jacket",
                category: "fashion",
                price: 79.99,
                originalPrice: 99.99,
                rating: 4.4,
                reviews: 145,
                image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=300&h=300&fit=crop",
                description: "Classic denim jacket for any occasion",
                inStock: true,
                badge: "Trending"
            },
            {
                id: 13,
                name: "Elegant Evening Dress",
                category: "fashion",
                price: 149.99,
                originalPrice: 199.99,
                rating: 4.8,
                reviews: 67,
                image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=300&fit=crop",
                description: "Stunning evening dress perfect for special occasions",
                inStock: true,
                badge: "New"
            },
            {
                id: 14,
                name: "Casual Sneakers",
                category: "fashion",
                price: 89.99,
                originalPrice: 119.99,
                rating: 4.5,
                reviews: 234,
                image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop",
                description: "Comfortable casual sneakers for everyday wear",
                inStock: true,
                badge: "Sale"
            },
            {
                id: 15,
                name: "Leather Handbag",
                category: "fashion",
                price: 199.99,
                originalPrice: 249.99,
                rating: 4.6,
                reviews: 98,
                image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop",
                description: "Premium leather handbag with multiple compartments",
                inStock: true,
                badge: "Luxury"
            },
            {
                id: 16,
                name: "Wool Winter Coat",
                category: "fashion",
                price: 179.99,
                originalPrice: 229.99,
                rating: 4.7,
                reviews: 112,
                image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop",
                description: "Warm wool coat perfect for winter weather",
                inStock: true,
                badge: "Seasonal"
            },
            {
                id: 17,
                name: "Designer Sunglasses",
                category: "fashion",
                price: 129.99,
                originalPrice: 159.99,
                rating: 4.4,
                reviews: 78,
                image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300&h=300&fit=crop",
                description: "Stylish designer sunglasses with UV protection",
                inStock: true,
                badge: "Trending"
            },

            // Sports
            {
                id: 4,
                name: "Running Shoes",
                category: "sports",
                price: 129.99,
                originalPrice: 159.99,
                rating: 4.6,
                reviews: 167,
                image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop",
                description: "Professional running shoes with superior comfort",
                inStock: true,
                badge: "Sale"
            },
            {
                id: 8,
                name: "Yoga Mat",
                category: "sports",
                price: 39.99,
                originalPrice: 49.99,
                rating: 4.5,
                reviews: 78,
                image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop",
                description: "Premium yoga mat with excellent grip and comfort",
                inStock: true,
                badge: "Eco-Friendly"
            },
            {
                id: 18,
                name: "Fitness Tracker",
                category: "sports",
                price: 89.99,
                originalPrice: 119.99,
                rating: 4.5,
                reviews: 145,
                image: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=300&h=300&fit=crop",
                description: "Advanced fitness tracker with heart rate monitoring",
                inStock: true,
                badge: "Popular"
            },
            {
                id: 19,
                name: "Basketball",
                category: "sports",
                price: 24.99,
                originalPrice: 34.99,
                rating: 4.3,
                reviews: 56,
                image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=300&fit=crop",
                description: "Professional basketball with excellent grip",
                inStock: true,
                badge: "Sale"
            },
            {
                id: 20,
                name: "Resistance Bands Set",
                category: "sports",
                price: 19.99,
                originalPrice: 29.99,
                rating: 4.4,
                reviews: 89,
                image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop",
                description: "Complete set of resistance bands for home workouts",
                inStock: true,
                badge: "Bundle"
            },
            {
                id: 21,
                name: "Tennis Racket",
                category: "sports",
                price: 159.99,
                originalPrice: 199.99,
                rating: 4.6,
                reviews: 73,
                image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop",
                description: "Professional tennis racket for advanced players",
                inStock: true,
                badge: "Pro"
            },
            {
                id: 22,
                name: "Cycling Helmet",
                category: "sports",
                price: 59.99,
                originalPrice: 79.99,
                rating: 4.7,
                reviews: 124,
                image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
                description: "Safety cycling helmet with ventilation system",
                inStock: true,
                badge: "Safety"
            },

            // Home & Living
            {
                id: 5,
                name: "Modern Coffee Table",
                category: "home",
                price: 299.99,
                originalPrice: 399.99,
                rating: 4.7,
                reviews: 94,
                image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
                description: "Elegant coffee table perfect for modern living rooms",
                inStock: true,
                badge: "Featured"
            },
            {
                id: 23,
                name: "Smart Home Speaker",
                category: "home",
                price: 79.99,
                originalPrice: 99.99,
                rating: 4.5,
                reviews: 167,
                image: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=300&h=300&fit=crop",
                description: "Voice-controlled smart speaker with built-in assistant",
                inStock: true,
                badge: "Smart"
            },
            {
                id: 24,
                name: "LED Desk Lamp",
                category: "home",
                price: 49.99,
                originalPrice: 69.99,
                rating: 4.4,
                reviews: 98,
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
                description: "Adjustable LED desk lamp with touch control",
                inStock: true,
                badge: "Modern"
            },
            {
                id: 25,
                name: "Memory Foam Pillow",
                category: "home",
                price: 39.99,
                originalPrice: 59.99,
                rating: 4.6,
                reviews: 234,
                image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
                description: "Premium memory foam pillow for better sleep",
                inStock: true,
                badge: "Comfort"
            },
            {
                id: 26,
                name: "Decorative Wall Art",
                category: "home",
                price: 89.99,
                originalPrice: 119.99,
                rating: 4.3,
                reviews: 67,
                image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=300&fit=crop",
                description: "Beautiful canvas wall art for home decoration",
                inStock: true,
                badge: "Art"
            },
            {
                id: 27,
                name: "Kitchen Knife Set",
                category: "home",
                price: 129.99,
                originalPrice: 169.99,
                rating: 4.8,
                reviews: 156,
                image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop",
                description: "Professional stainless steel knife set for cooking",
                inStock: true,
                badge: "Chef's Choice"
            },
            {
                id: 28,
                name: "Robot Vacuum Cleaner",
                category: "home",
                price: 249.99,
                originalPrice: 329.99,
                rating: 4.5,
                reviews: 189,
                image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
                description: "Smart robot vacuum with app control and scheduling",
                inStock: true,
                badge: "Smart Home"
            }
        ];
    }

    loadProducts() {
        // Load featured products
        const featuredProducts = this.products.slice(0, 4);
        this.displayProducts(featuredProducts, 'featuredProducts');

        // Load all products
        this.displayProducts(this.products, 'allProducts');
    }

    displayProducts(products, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                    <div class="product-actions">
                        <button class="product-action-btn" onclick="app.addToWishlist(${product.id})" title="Add to Wishlist">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="product-action-btn" onclick="app.showProductModal(${product.id})" title="Quick View">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-rating">
                        <div class="stars">
                            ${this.generateStars(product.rating)}
                        </div>
                        <span class="rating-text">(${product.reviews})</span>
                    </div>
                    <div class="product-price">
                        <span class="current-price">$${product.price}</span>
                        ${product.originalPrice ? `<span class="original-price">$${product.originalPrice}</span>` : ''}
                    </div>
                    <button class="add-to-cart" onclick="app.addToCart(${product.id})" ${!product.inStock ? 'disabled' : ''}>
                        ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star star"></i>';
        }

        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt star"></i>';
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star star"></i>';
        }

        return stars;
    }

    filterProductsByCategory(category) {
        const filteredProducts = this.products.filter(product => 
            product.category.toLowerCase() === category.toLowerCase()
        );
        this.displayProducts(filteredProducts, 'allProducts');
        
        // Update filter dropdown
        document.getElementById('categoryFilter').value = category;
    }

    filterProducts() {
        const categoryFilter = document.getElementById('categoryFilter').value;
        const priceFilter = document.getElementById('priceFilter').value;
        let filteredProducts = [...this.products];

        // Filter by category
        if (categoryFilter) {
            filteredProducts = filteredProducts.filter(product => 
                product.category.toLowerCase() === categoryFilter.toLowerCase()
            );
        }

        // Filter by price
        if (priceFilter) {
            const [min, max] = priceFilter.split('-').map(p => 
                p.includes('+') ? parseFloat(p.replace('+', '')) : parseFloat(p)
            );
            
            filteredProducts = filteredProducts.filter(product => {
                if (max) {
                    return product.price >= min && product.price <= max;
                } else {
                    return product.price >= min;
                }
            });
        }

        this.displayProducts(filteredProducts, 'allProducts');
    }

    sortProducts() {
        const sortFilter = document.getElementById('sortFilter').value;
        const container = document.getElementById('allProducts');
        const productCards = Array.from(container.querySelectorAll('.product-card'));

        productCards.sort((a, b) => {
            const productIdA = parseInt(a.dataset.productId);
            const productIdB = parseInt(b.dataset.productId);
            const productA = this.products.find(p => p.id === productIdA);
            const productB = this.products.find(p => p.id === productIdB);

            switch (sortFilter) {
                case 'price-low':
                    return productA.price - productB.price;
                case 'price-high':
                    return productB.price - productA.price;
                case 'name':
                    return productA.name.localeCompare(productB.name);
                case 'rating':
                    return productB.rating - productA.rating;
                default:
                    return 0;
            }
        });

        // Re-append sorted cards
        productCards.forEach(card => container.appendChild(card));
    }

    // Cart Management
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartCount();
        this.showToast(`${product.name} added to cart`, 'success');
        
        // Animate cart button
        document.getElementById('cartBtn').classList.add('animate-bounce');
        setTimeout(() => {
            document.getElementById('cartBtn').classList.remove('animate-bounce');
        }, 1000);
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
        this.loadCartItems();
        this.showToast('Item removed from cart', 'success');
    }

    updateCartQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
            this.loadCartItems();
        }
    }

    loadCartItems() {
        const container = document.getElementById('cartItems');
        const summary = document.getElementById('cartSummary');

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some products to get started</p>
                    <button class="btn-primary" onclick="app.showSection('home')">Continue Shopping</button>
                </div>
            `;
            summary.style.display = 'none';
            return;
        }

        summary.style.display = 'block';

        container.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="cart-item-price">$${item.price}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="app.updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" 
                               onchange="app.updateCartQuantity(${item.id}, parseInt(this.value))">
                        <button class="quantity-btn" onclick="app.updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="app.removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        this.updateCartSummary();
    }

    updateCartSummary() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 50 ? 0 : 5.99;
        const total = subtotal + shipping;

        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('shipping').textContent = subtotal > 50 ? 'Free' : `$${shipping.toFixed(2)}`;
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;

        // Enable/disable checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        checkoutBtn.disabled = this.cart.length === 0;
    }

    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cartCount').textContent = totalItems;
    }

    // Wishlist Management
    addToWishlist(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const isInWishlist = this.wishlist.find(item => item.id === productId);
        
        if (isInWishlist) {
            this.wishlist = this.wishlist.filter(item => item.id !== productId);
            this.showToast(`${product.name} removed from wishlist`, 'info');
        } else {
            this.wishlist.push(product);
            this.showToast(`${product.name} added to wishlist`, 'success');
        }

        this.saveWishlist();
        this.updateWishlistCount();
    }

    removeFromWishlist(productId) {
        this.wishlist = this.wishlist.filter(item => item.id !== productId);
        this.saveWishlist();
        this.updateWishlistCount();
        this.loadWishlistItems();
        this.showToast('Item removed from wishlist', 'success');
    }

    updateWishlistCount() {
        document.getElementById('wishlistCount').textContent = this.wishlist.length;
    }

    loadWishlistItems() {
        const container = document.getElementById('wishlistItems');
        
        if (this.wishlist.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-heart"></i>
                    <h3>Your wishlist is empty</h3>
                    <p>Add products you love to your wishlist</p>
                    <button class="btn-primary" onclick="app.showSection('home')">Browse Products</button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="products-grid">
                ${this.wishlist.map(product => `
                    <div class="product-card">
                        <div class="product-image">
                            <img src="${product.image}" alt="${product.name}">
                            <div class="product-actions">
                                <button class="product-action-btn" onclick="app.removeFromWishlist(${product.id})" title="Remove from Wishlist">
                                    <i class="fas fa-heart" style="color: var(--danger-color);"></i>
                                </button>
                                <button class="product-action-btn" onclick="app.addToCart(${product.id})" title="Add to Cart">
                                    <i class="fas fa-shopping-cart"></i>
                                </button>
                            </div>
                        </div>
                        <div class="product-info">
                            <div class="product-category">${product.category}</div>
                            <h3 class="product-title">${product.name}</h3>
                            <div class="product-rating">
                                <div class="stars">
                                    ${this.generateStars(product.rating)}
                                </div>
                                <span class="rating-text">(${product.reviews})</span>
                            </div>
                            <div class="product-price">
                                <span class="current-price">$${product.price}</span>
                                ${product.originalPrice ? `<span class="original-price">$${product.originalPrice}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Checkout
    loadCheckoutItems() {
        const container = document.getElementById('orderItems');
        
        container.innerHTML = this.cart.map(item => `
            <div class="order-item">
                <div class="order-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="order-item-details">
                    <h4 class="order-item-title">${item.name}</h4>
                    <p class="order-item-quantity">Qty: ${item.quantity}</p>
                </div>
                <span class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        // Update order summary
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 50 ? 0 : 5.99;
        const total = subtotal + shipping;

        document.getElementById('orderSubtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('orderShipping').textContent = subtotal > 50 ? 'Free' : `$${shipping.toFixed(2)}`;
        document.getElementById('orderTotal').textContent = `$${total.toFixed(2)}`;
    }

    placeOrder() {
        // Validate forms
        const billingForm = document.getElementById('billingForm');
        const shippingForm = document.getElementById('shippingForm');
        const sameAsBilling = document.getElementById('sameAsBilling').checked;

        if (!billingForm.checkValidity()) {
            billingForm.reportValidity();
            return;
        }

        if (!sameAsBilling && !shippingForm.checkValidity()) {
            shippingForm.reportValidity();
            return;
        }

        // Simulate order processing
        this.showToast('Processing your order...', 'info');
        
        setTimeout(() => {
            // Generate order
            const order = {
                id: `ORD-${Date.now()}`,
                items: [...this.cart],
                total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + (this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) > 50 ? 0 : 5.99),
                date: new Date().toLocaleDateString(),
                status: 'pending'
            };

            // Save order to user's orders
            let orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders.unshift(order);
            localStorage.setItem('orders', JSON.stringify(orders));

            // Clear cart
            this.cart = [];
            this.saveCart();
            this.updateCartCount();

            // Show success message
            this.showToast('Order placed successfully!', 'success');
            
            // Redirect to user orders
            setTimeout(() => {
                this.showSection('user');
                this.switchUserTab('orders');
            }, 2000);
        }, 3000);
    }

    toggleShippingForm() {
        const sameAsBilling = document.getElementById('sameAsBilling').checked;
        const shippingForm = document.getElementById('shippingForm');
        
        if (sameAsBilling) {
            shippingForm.style.display = 'none';
        } else {
            shippingForm.style.display = 'block';
        }
    }

    toggleCardDetails() {
        const selectedPayment = document.querySelector('input[name="payment"]:checked').value;
        const cardDetails = document.getElementById('cardDetails');
        
        if (selectedPayment === 'card') {
            cardDetails.classList.add('active');
        } else {
            cardDetails.classList.remove('active');
        }
    }

    // User Management
    showUserModal() {
        if (this.user) {
            this.showSection('user');
        } else {
            this.showModal('authModal');
        }
    }

    loadUserData() {
        if (this.user) {
            document.getElementById('userName').textContent = this.user.name;
            document.getElementById('userEmail').textContent = this.user.email;
        }
    }

    loadUserProfile() {
        this.loadWishlistItems();
        this.loadUserOrders();
    }

    loadUserOrders() {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const container = document.querySelector('#ordersTab .orders-list');
        
        if (orders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <h3>No orders yet</h3>
                    <p>Your order history will appear here</p>
                    <button class="btn-primary" onclick="app.showSection('home')">Start Shopping</button>
                </div>
            `;
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <span class="order-id">${order.id}</span>
                    <span class="order-date">${order.date}</span>
                    <span class="order-status ${order.status}">${order.status}</span>
                </div>
                <div class="order-products">
                    <img src="${order.items[0].image}" alt="${order.items[0].name}">
                    <div class="product-info">
                        <h4>${order.items[0].name}</h4>
                        <p>${order.items.length > 1 ? `+${order.items.length - 1} more items` : '1 item'}</p>
                    </div>
                    <span class="product-price">$${order.total.toFixed(2)}</span>
                </div>
                <div class="order-total">Total: $${order.total.toFixed(2)}</div>
            </div>
        `).join('');
    }

    switchUserTab(tab) {
        // Update nav buttons
        document.querySelectorAll('.user-nav-item').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.user-tab').forEach(tabContent => {
            tabContent.classList.remove('active');
        });
        document.getElementById(`${tab}Tab`).classList.add('active');
    }

    handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = e.target.querySelector('input[type="email"]').value;
        const password = e.target.querySelector('input[type="password"]').value;

        // Simulate login
        this.user = {
            name: 'John Doe',
            email: email,
            id: 1
        };

        localStorage.setItem('user', JSON.stringify(this.user));
        this.loadUserData();
        this.closeModal();
        this.showToast('Login successful!', 'success');
    }

    handleRegister(e) {
        e.preventDefault();
        const firstName = e.target.querySelector('input[placeholder="First Name"]').value;
        const lastName = e.target.querySelector('input[placeholder="Last Name"]').value;
        const email = e.target.querySelector('input[type="email"]').value;

        // Simulate registration
        this.user = {
            name: `${firstName} ${lastName}`,
            email: email,
            id: Date.now()
        };

        localStorage.setItem('user', JSON.stringify(this.user));
        this.loadUserData();
        this.closeModal();
        this.showToast('Registration successful!', 'success');
    }

    // FAQ
    toggleFAQ(faqItem) {
        const isActive = faqItem.classList.contains('active');
        
        // Close all other FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });

        // Toggle current item
        if (!isActive) {
            faqItem.classList.add('active');
        }
    }

    // Forms
    handleNewsletter(e) {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        this.showToast('Thank you for subscribing to our newsletter!', 'success');
        e.target.reset();
    }

    handleContact(e) {
        e.preventDefault();
        this.showToast('Thank you for your message. We\'ll get back to you soon!', 'success');
        e.target.reset();
    }

    // Modal Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'flex';
        }
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
            modal.style.display = 'none';
        });
    }

    switchAuthTab(tabType) {
        // Update tab buttons
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabType}"]`).classList.add('active');

        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${tabType}Form`).classList.add('active');
    }

    showProductModal(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <div class="product-modal-content">
                <div class="product-modal-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-modal-info">
                    <div class="product-category">${product.category}</div>
                    <h2>${product.name}</h2>
                    <div class="product-rating">
                        <div class="stars">
                            ${this.generateStars(product.rating)}
                        </div>
                        <span class="rating-text">${product.rating} (${product.reviews} reviews)</span>
                    </div>
                    <div class="product-price">
                        <span class="current-price">$${product.price}</span>
                        ${product.originalPrice ? `<span class="original-price">$${product.originalPrice}</span>` : ''}
                    </div>
                    <p class="product-description">${product.description}</p>
                    <div class="product-modal-actions">
                        <button class="btn-primary" onclick="app.addToCart(${product.id}); app.closeModal();">
                            Add to Cart
                        </button>
                        <button class="btn-secondary" onclick="app.addToWishlist(${product.id}); app.closeModal();">
                            <i class="fas fa-heart"></i> Add to Wishlist
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.showModal('productModal');
    }

    // Toast Messages
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = toast.querySelector('.toast-message');
        
        toastMessage.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Local Storage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    saveWishlist() {
        localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ECommerceApp();
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add parallax effect to hero banner
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroBanner = document.querySelector('.hero-banner');
    if (heroBanner) {
        heroBanner.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add loading animation to buttons
document.addEventListener('click', (e) => {
    if (e.target.matches('.btn-primary, .add-to-cart, .cta-btn')) {
        e.target.style.transform = 'scale(0.95)';
        setTimeout(() => {
            e.target.style.transform = '';
        }, 150);
    }
});

// Add hover effects to product cards
document.addEventListener('mouseover', (e) => {
    if (e.target.closest('.product-card')) {
        const card = e.target.closest('.product-card');
        card.style.transform = 'translateY(-5px)';
    }
});

document.addEventListener('mouseout', (e) => {
    if (e.target.closest('.product-card')) {
        const card = e.target.closest('.product-card');
        card.style.transform = '';
    }
});

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    // ESC to close modals
    if (e.key === 'Escape') {
        window.app.closeModal();
    }
    
    // Arrow keys for hero slider
    if (e.key === 'ArrowLeft') {
        window.app.currentSlide = (window.app.currentSlide - 1 + window.app.slides.length) % window.app.slides.length;
        window.app.updateSlider();
    } else if (e.key === 'ArrowRight') {
        window.app.nextSlide();
    }
});

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.product-card, .category-card, .offer-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Add form validation
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = 'var(--danger-color)';
            isValid = false;
        } else {
            input.style.borderColor = '';
        }
    });
    
    return isValid;
}

// Add auto-save for form data
function autoSaveForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        const savedValue = localStorage.getItem(`${formId}_${input.name || input.id}`);
        if (savedValue) {
            input.value = savedValue;
        }
        
        input.addEventListener('input', () => {
            localStorage.setItem(`${formId}_${input.name || input.id}`, input.value);
        });
    });
}

// Initialize auto-save for checkout forms
document.addEventListener('DOMContentLoaded', () => {
    autoSaveForm('billingForm');
    autoSaveForm('shippingForm');
    autoSaveForm('contactForm');
});

// Add search suggestions
function addSearchSuggestions() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const suggestions = ['headphones', 'smartphone', 'laptop', 't-shirt', 'shoes', 'table', 'watch', 'bag'];
    
    searchInput.addEventListener('input', (e) => {
        const value = e.target.value.toLowerCase();
        if (value.length > 1) {
            const matchingSuggestions = suggestions.filter(s => s.includes(value));
            // You could display these suggestions in a dropdown
        }
    });
}

// Initialize search suggestions
document.addEventListener('DOMContentLoaded', addSearchSuggestions);

// Add product comparison functionality
function addToComparison(productId) {
    let comparison = JSON.parse(localStorage.getItem('comparison')) || [];
    
    if (comparison.includes(productId)) {
        comparison = comparison.filter(id => id !== productId);
        window.app.showToast('Product removed from comparison', 'info');
    } else if (comparison.length < 3) {
        comparison.push(productId);
        window.app.showToast('Product added to comparison', 'success');
    } else {
        window.app.showToast('You can compare up to 3 products', 'warning');
        return;
    }
    
    localStorage.setItem('comparison', JSON.stringify(comparison));
}

// Add share functionality
function shareProduct(productId) {
    const product = window.app.products.find(p => p.id === productId);
    if (!product) return;
    
    if (navigator.share) {
        navigator.share({
            title: product.name,
            text: product.description,
            url: window.location.href
        });
    } else {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        window.app.showToast('Product link copied to clipboard', 'success');
    }
}

// Add recently viewed products
function addToRecentlyViewed(productId) {
    let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
    recentlyViewed = recentlyViewed.filter(id => id !== productId);
    recentlyViewed.unshift(productId);
    recentlyViewed = recentlyViewed.slice(0, 5); // Keep only last 5
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
}

// Track product views
document.addEventListener('click', (e) => {
    if (e.target.closest('.product-card')) {
        const productCard = e.target.closest('.product-card');
        const productId = parseInt(productCard.dataset.productId);
        addToRecentlyViewed(productId);
    }
});

// Add error handling for images
document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
        e.target.alt = 'Image not found';
    }
}, true);

// Add lazy loading for images
function addLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', addLazyLoading);

// Add performance monitoring
function monitorPerformance() {
    window.addEventListener('load', () => {
        const loadTime = performance.now();
        console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
        
        // You could send this to analytics
        if (loadTime > 3000) {
            console.warn('Slow page load detected');
        }
    });
}

// Initialize performance monitoring
monitorPerformance();
