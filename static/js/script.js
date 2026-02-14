/**
 * ====================================
 * المدرسة الإلكترونية للزاوية التجانية
 * ملف JavaScript الرئيسي
 * ====================================
 */

'use strict';

// ========== Main App Class ==========
class ZawiyaApp {
    constructor() {
        this.init();
    }

    init() {
        // انتظار تحميل DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setup();
            });
        } else {
            this.setup();
        }
    }

    setup() {
        console.log('🕌 المدرسة الإلكترونية للزاوية التجانية');
        
        // تهيئة المكونات
        this.initNavigation();
        this.initScrollEffects();
        this.initForms();
        this.initModals();
        this.initAnimations();
        this.initNewsletterForm();
        this.initFAQ();
        
        // إخفاء شاشة التحميل
        this.hideLoadingOverlay();
    }

    hideLoadingOverlay() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            setTimeout(() => {
                loadingOverlay.classList.remove('active');
            }, 500);
        }
    }
}

// ========== Navigation ==========
ZawiyaApp.prototype.initNavigation = function() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.getElementById('navbar');

    // Mobile menu toggle
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Close menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (menuToggle) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#' || href === '') return;
            
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = targetElement.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active link on scroll
    this.updateActiveNavLink();
    window.addEventListener('scroll', () => {
        this.updateActiveNavLink();
        this.handleNavbarScroll();
    });
};

ZawiyaApp.prototype.updateActiveNavLink = function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    const scrollPosition = window.scrollY + 200;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href && href.includes('#' + currentSection)) {
            link.classList.add('active');
        }
    });
};

ZawiyaApp.prototype.handleNavbarScroll = function() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
};

// ========== Scroll Effects ==========
ZawiyaApp.prototype.initScrollEffects = function() {
    // Scroll to top button
    const scrollTopBtn = document.getElementById('scrollTop');
    
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            const parallax = hero.querySelector('.hero-content');
            if (parallax) {
                parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
        });
    }
};

// ========== Forms Validation ==========
ZawiyaApp.prototype.initForms = function() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // Real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    this.validateField(input);
                }
            });
        });
    });
};

ZawiyaApp.prototype.validateField = function(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');
    
    // Clear previous errors
    this.clearFieldError(field);
    
    // Check if required field is empty
    if (required && !value) {
        this.showFieldError(field, 'هذا الحقل مطلوب');
        return false;
    }
    
    // Email validation
    if (type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            this.showFieldError(field, 'البريد الإلكتروني غير صحيح');
            return false;
        }
    }
    
    // Phone validation (Algerian format)
    if (type === 'tel' && value) {
        const phoneRegex = /^(0)(5|6|7)[0-9]{8}$/;
        if (!phoneRegex.test(value)) {
            this.showFieldError(field, 'رقم الهاتف غير صحيح (10 أرقام تبدأ بـ 05 أو 06 أو 07)');
            return false;
        }
    }
    
    // Number validation
    if (type === 'number' && value) {
        const min = field.getAttribute('min');
        const max = field.getAttribute('max');
        
        if (min && parseFloat(value) < parseFloat(min)) {
            this.showFieldError(field, `القيمة يجب أن تكون أكبر من أو تساوي ${min}`);
            return false;
        }
        
        if (max && parseFloat(value) > parseFloat(max)) {
            this.showFieldError(field, `القيمة يجب أن تكون أصغر من أو تساوي ${max}`);
            return false;
        }
    }
    
    return true;
};

ZawiyaApp.prototype.showFieldError = function(field, message) {
    field.classList.add('error');
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
};

ZawiyaApp.prototype.clearFieldError = function(field) {
    field.classList.remove('error');
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }
};

ZawiyaApp.prototype.validateForm = function(form) {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!this.validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
};

// ========== Modals ==========
ZawiyaApp.prototype.initModals = function() {
    // Open modal
    document.querySelectorAll('[data-modal]').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal');
            this.openModal(modalId);
        });
    });

    // Close modal
    document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            this.closeModal(closeBtn.closest('.modal'));
        });
    });

    // Close modal on overlay click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });
    });

    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            this.closeAllModals();
        }
    });
};

ZawiyaApp.prototype.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

ZawiyaApp.prototype.closeModal = function(modal) {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

ZawiyaApp.prototype.closeAllModals = function() {
    document.querySelectorAll('.modal.active').forEach(modal => {
        this.closeModal(modal);
    });
};

// ========== Animations ==========
ZawiyaApp.prototype.initAnimations = function() {
    // Counter animation for statistics
    const counters = document.querySelectorAll('.achievement-number, .stat-number');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        observer.observe(counter);
    });
};

ZawiyaApp.prototype.animateCounter = function(element) {
    const target = parseInt(element.getAttribute('data-target') || element.textContent);
    const duration = 2000; // 2 seconds
    const step = target / (duration / 16); // 60 FPS
    let current = 0;

    const updateCounter = () => {
        current += step;
        if (current < target) {
            element.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + '+';
        }
    };

    updateCounter();
};

// ========== Newsletter Form ==========
ZawiyaApp.prototype.initNewsletterForm = function() {
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (!email) {
                this.showNotification('يرجى إدخال البريد الإلكتروني', 'error');
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                this.showNotification('البريد الإلكتروني غير صحيح', 'error');
                return;
            }
            
            try {
                // Simulate API call
                await this.simulateAPICall(1000);
                
                this.showNotification('تم الاشتراك بنجاح! شكراً لك', 'success');
                newsletterForm.reset();
            } catch (error) {
                this.showNotification('حدث خطأ، يرجى المحاولة لاحقاً', 'error');
            }
        });
    }
};

// ========== FAQ ==========
ZawiyaApp.prototype.initFAQ = function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            faqItems.forEach(faq => {
                faq.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
};

// ========== Notifications ==========
ZawiyaApp.prototype.showNotification = function(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = this.getNotificationIcon(type);
    
    notification.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after duration
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
};

ZawiyaApp.prototype.getNotificationIcon = function(type) {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    return icons[type] || icons.info;
};

// ========== Utility Functions ==========
ZawiyaApp.prototype.simulateAPICall = function(delay = 1000) {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
};

ZawiyaApp.prototype.formatDate = function(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    return new Date(date).toLocaleDateString('ar-DZ', options);
};

ZawiyaApp.prototype.formatTime = function(date) {
    const options = { 
        hour: '2-digit', 
        minute: '2-digit'
    };
    return new Date(date).toLocaleTimeString('ar-DZ', options);
};

// ========== Loading State ==========
ZawiyaApp.prototype.showLoading = function() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('active');
    }
};

ZawiyaApp.prototype.hideLoading = function() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
};

// ========== Initialize App ==========
const app = new ZawiyaApp();

// Export for use in other scripts
window.ZawiyaApp = app;
// ========== Registration Form Handler ==========
class RegistrationForm {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.formData = {};
        
        this.init();
    }

    init() {
        const registerForm = document.getElementById('registerForm');
        if (!registerForm) return;

        this.setupStepNavigation();
        this.setupProgramSelection();
        this.setupFormSubmission();
    }

    setupStepNavigation() {
        // Next buttons
        document.querySelectorAll('.btn-next').forEach(btn => {
            btn.addEventListener('click', () => this.nextStep());
        });

        // Previous buttons
        document.querySelectorAll('.btn-prev').forEach(btn => {
            btn.addEventListener('click', () => this.prevStep());
        });
    }

    nextStep() {
        if (!this.validateCurrentStep()) {
            window.ZawiyaApp.showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        if (this.currentStep < this.totalSteps) {
            this.collectStepData();
            this.currentStep++;
            this.updateStepDisplay();
            
            if (this.currentStep === 3) {
                this.updateConfirmation();
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }

    validateCurrentStep() {
        const currentFormStep = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        if (!currentFormStep) return true;

        const inputs = currentFormStep.querySelectorAll('input[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!window.ZawiyaApp.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    collectStepData() {
        const currentFormStep = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        if (!currentFormStep) return;

        const inputs = currentFormStep.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'radio') {
                if (input.checked) {
                    this.formData[input.name] = input.value;
                }
            } else {
                this.formData[input.name] = input.value;
            }
        });
    }

    updateStepDisplay() {
        // Update form steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.dataset.step) === this.currentStep) {
                step.classList.add('active');
            }
        });

        // Update progress steps
        document.querySelectorAll('.progress-steps .step').forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');
            
            if (stepNum === this.currentStep) {
                step.classList.add('active');
            } else if (stepNum < this.currentStep) {
                step.classList.add('completed');
            }
        });

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setupProgramSelection() {
        const programOptions = document.querySelectorAll('.program-option');
        
        programOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove selection from all
                programOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Add selection to clicked
                option.classList.add('selected');
                
                // Check the radio button
                const radio = option.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                }
            });
        });
    }

    updateConfirmation() {
        // Personal Info
        document.getElementById('confirm-name').textContent = 
            `${this.formData.firstName || ''} ${this.formData.lastName || ''}`;
        document.getElementById('confirm-age').textContent = 
            `${this.formData.age || ''} سنة`;
        document.getElementById('confirm-gender').textContent = 
            this.formData.gender || '';
        document.getElementById('confirm-phone').textContent = 
            this.formData.phone || '';
        document.getElementById('confirm-email').textContent = 
            this.formData.email || '';
        document.getElementById('confirm-address').textContent = 
            `${this.formData.address || ''}, ${this.formData.state || ''}`;

        // Program
        const selectedProgram = document.querySelector('input[name="program"]:checked');
        if (selectedProgram) {
            const programLabel = selectedProgram.nextElementSibling.querySelector('h3').textContent;
            document.getElementById('confirm-program').innerHTML = `
                <div class="selected-program">
                    <i class="fas fa-check-circle"></i>
                    <span>${programLabel}</span>
                </div>
            `;
        }
    }

    setupFormSubmission() {
        const registerForm = document.getElementById('registerForm');
        if (!registerForm) return;

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Check terms agreement
            const termsCheckbox = document.getElementById('terms');
            if (termsCheckbox && !termsCheckbox.checked) {
                window.ZawiyaApp.showNotification('يجب الموافقة على الشروط والأحكام', 'warning');
                return;
            }

            // Collect all form data
            this.collectStepData();

            // Show loading modal
            const loadingModal = document.getElementById('loadingModal');
            if (loadingModal) {
                loadingModal.classList.add('active');
            }

            try {
                // Send data to server
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.formData)
                });

                const result = await response.json();

                // Hide loading modal
                if (loadingModal) {
                    loadingModal.classList.remove('active');
                }

                if (result.success) {
                    // Redirect to schedule page
                    window.location.href = `/schedule/${result.student_id}`;
                } else {
                    window.ZawiyaApp.showNotification(result.message || 'حدث خطأ أثناء التسجيل', 'error');
                }
            } catch (error) {
                console.error('Registration error:', error);
                
                // Hide loading modal
                if (loadingModal) {
                    loadingModal.classList.remove('active');
                }
                
                window.ZawiyaApp.showNotification('حدث خطأ في الاتصال بالخادم', 'error');
            }
        });
    }
}

// ========== Contact Form Handler ==========
class ContactForm {
    constructor() {
        this.init();
    }

    init() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Validate form
            if (!window.ZawiyaApp.validateForm(contactForm)) {
                window.ZawiyaApp.showNotification('يرجى ملء جميع الحقول المطلوبة بشكل صحيح', 'error');
                return;
            }

            // Collect form data
            const formData = {
                name: document.getElementById('contactName').value,
                email: document.getElementById('contactEmail').value,
                phone: document.getElementById('contactPhone').value,
                subject: document.getElementById('contactSubject').value,
                message: document.getElementById('contactMessage').value
            };

            // Get submit button
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
            submitBtn.disabled = true;

            try {
                // Send to server
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    // Show success message
                    contactForm.style.display = 'none';
                    const successDiv = document.getElementById('formSuccess');
                    if (successDiv) {
                        successDiv.style.display = 'block';
                    }

                    // Reset form after 5 seconds
                    setTimeout(() => {
                        contactForm.reset();
                        contactForm.style.display = 'block';
                        if (successDiv) {
                            successDiv.style.display = 'none';
                        }
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    }, 5000);
                } else {
                    window.ZawiyaApp.showNotification(result.message || 'حدث خطأ', 'error');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error('Contact form error:', error);
                window.ZawiyaApp.showNotification('حدث خطأ في الاتصال بالخادم', 'error');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// ========== Schedule Page Functions ==========
class SchedulePage {
    constructor() {
        this.init();
    }

    init() {
        // Check if we're on the schedule page
        if (!document.querySelector('.schedule-section')) return;

        this.setupPrintFunction();
        this.setupQRCodeDownload();
        this.highlightUpcomingClasses();
    }

    setupPrintFunction() {
        const printButtons = document.querySelectorAll('[onclick*="print"]');
        
        printButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                window.print();
            });
        });
    }

    setupQRCodeDownload() {
        const qrImages = document.querySelectorAll('.qr-image');
        
        qrImages.forEach(img => {
            img.style.cursor = 'pointer';
            img.title = 'انقر لتحميل رمز QR';
            
            img.addEventListener('click', () => {
                const link = document.createElement('a');
                link.href = img.src;
                link.download = 'zawiya-qrcode.png';
                link.click();
            });
        });
    }

    highlightUpcomingClasses() {
        const scheduleCards = document.querySelectorAll('.schedule-card');
        const now = new Date();
        const currentDay = now.toLocaleDateString('ar-DZ', { weekday: 'long' });

        scheduleCards.forEach(card => {
            const dayBadge = card.querySelector('.schedule-day-badge');
            if (dayBadge && dayBadge.textContent.includes(currentDay)) {
                card.style.borderColor = 'var(--secondary-color)';
                card.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.3)';
                
                // Add a "today" badge
                const todayBadge = document.createElement('div');
                todayBadge.className = 'today-badge';
                todayBadge.innerHTML = '<i class="fas fa-star"></i> اليوم';
                todayBadge.style.cssText = `
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    background: var(--secondary-color);
                    color: white;
                    padding: 5px 15px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                `;
                
                card.style.position = 'relative';
                card.insertBefore(todayBadge, card.firstChild);
            }
        });
    }
}

// ========== Lazy Loading Images ==========
class LazyLoader {
    constructor() {
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        } else {
            // Fallback for older browsers
            this.loadAllImages();
        }
    }

    setupIntersectionObserver() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    loadAllImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

// ========== Search Functionality ==========
class SearchHandler {
    constructor() {
        this.init();
    }

    init() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });
    }

    performSearch(query) {
        query = query.toLowerCase().trim();
        
        const searchableElements = document.querySelectorAll('[data-searchable]');
        
        searchableElements.forEach(element => {
            const content = element.textContent.toLowerCase();
            const parent = element.closest('.program-card, .teacher-card, .faq-item');
            
            if (parent) {
                if (query === '' || content.includes(query)) {
                    parent.style.display = '';
                } else {
                    parent.style.display = 'none';
                }
            }
        });
    }
}

// ========== Local Storage Manager ==========
class StorageManager {
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    static load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return null;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }

    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
}

// ========== Analytics Helper ==========
class Analytics {
    static trackEvent(category, action, label = '') {
        console.log('Event tracked:', { category, action, label });
        
        // يمكن إضافة تكامل مع Google Analytics أو أي خدمة تحليلات أخرى
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label
            });
        }
    }

    static trackPageView(page) {
        console.log('Page view:', page);
        
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID', {
                'page_path': page
            });
        }
    }
}

// ========== Helper Functions ==========

// Format phone number
function formatPhoneNumber(phone) {
    // Remove all non-digit characters
    phone = phone.replace(/\D/g, '');
    
    // Format as: 0555 12 34 56
    if (phone.length === 10) {
        return phone.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
    }
    
    return phone;
}

// Copy to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            window.ZawiyaApp.showNotification('تم النسخ بنجاح', 'success');
        }).catch(() => {
            window.ZawiyaApp.showNotification('فشل النسخ', 'error');
        });
    } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            window.ZawiyaApp.showNotification('تم النسخ بنجاح', 'success');
        } catch (error) {
            window.ZawiyaApp.showNotification('فشل النسخ', 'error');
        }
        
        document.body.removeChild(textarea);
    }
}

// Share functionality
function shareContent(title, text, url) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: text,
            url: url
        }).then(() => {
            Analytics.trackEvent('Share', 'Success', title);
        }).catch((error) => {
            console.error('Error sharing:', error);
        });
    } else {
        // Fallback: copy link to clipboard
        copyToClipboard(url);
    }
}

// Check internet connection
function checkConnection() {
    if (!navigator.onLine) {
        window.ZawiyaApp.showNotification('لا يوجد اتصال بالإنترنت', 'warning', 10000);
    }
}

window.addEventListener('online', () => {
    window.ZawiyaApp.showNotification('تم استعادة الاتصال بالإنترنت', 'success');
});

window.addEventListener('offline', () => {
    window.ZawiyaApp.showNotification('تم فقدان الاتصال بالإنترنت', 'error', 10000);
});

// ========== Initialize All Components ==========
document.addEventListener('DOMContentLoaded', () => {
    // Initialize registration form
    if (document.getElementById('registerForm')) {
        new RegistrationForm();
    }

    // Initialize contact form
    if (document.getElementById('contactForm')) {
        new ContactForm();
    }

    // Initialize schedule page
    if (document.querySelector('.schedule-section')) {
        new SchedulePage();
    }

    // Initialize lazy loading
    new LazyLoader();

    // Initialize search
    new SearchHandler();

    // Check connection
    checkConnection();

    // Track page view
    Analytics.trackPageView(window.location.pathname);
});

// ========== Service Worker Registration (PWA Support) ==========
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// ========== Export for global use ==========
window.RegistrationForm = RegistrationForm;
window.ContactForm = ContactForm;
window.SchedulePage = SchedulePage;
window.StorageManager = StorageManager;
window.Analytics = Analytics;
window.copyToClipboard = copyToClipboard;
window.shareContent = shareContent;
window.formatPhoneNumber = formatPhoneNumber;

console.log('✅ جميع السكربتات تم تحميلها بنجاح');
