import "lucide"; // Import the UMD module to ensure it executes and attaches 'lucide' to the global scope

// Mock user storage (replace with actual backend/localStorage later)
const users = {};
let loggedInUser = null;
let isSidebarCollapsed = false;
let isSidebarVisibleMobile = false; // For mobile view

// DOM Elements
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login');
const signupForm = document.getElementById('signup');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const loginFormContainer = document.getElementById('login-form');
const signupFormContainer = document.getElementById('signup-form');
const menuToggleButton = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('main-content');
const navLinks = document.querySelectorAll('.nav-link');
const contentPages = document.querySelectorAll('.content-page');
const logoutButton = document.getElementById('logout-button');
const searchInput = document.getElementById('search-input');
const filterButton = document.getElementById('filter-button');
const addButton = document.getElementById('add-button');
const editButton = document.getElementById('edit-button');
const deleteButton = document.getElementById('delete-button');

// Elements for Customer Cadastro
const customerForm = document.getElementById('customer-form');
const customerTypeSelect = document.getElementById('customer-type');
const cpfCnpjGroup = document.getElementById('cpf-cnpj-group');
const cpfCnpjLabel = document.getElementById('label-cpf-cnpj');
const cpfCnpjInput = document.getElementById('customer-cpf-cnpj');
const nomeFantasiaGroup = document.getElementById('nome-fantasia-group');
const customerRegDateSpan = document.getElementById('customer-reg-date');
const customerModDateSpan = document.getElementById('customer-mod-date');
const cancelCustomerButton = document.getElementById('cancel-customer-button');

// Mock customer storage
let customers = [];
let currentEditingCustomerId = null; // To track if we are editing

// --- Utility Functions ---
function setActiveForm(formToShow) {
    loginFormContainer.classList.remove('active');
    signupFormContainer.classList.remove('active');
    formToShow.classList.add('active');
}

function showApp() {
    authContainer.style.display = 'none';
    authContainer.classList.add('hidden'); // Use class for potential transitions
    appContainer.style.display = 'flex';
    renderIcons(); // Ensure icons are rendered in the app view
}

function showAuth() {
    appContainer.style.display = 'none';
    authContainer.style.display = 'block';
    authContainer.classList.remove('hidden');
    setActiveForm(loginFormContainer); // Default to login
    loggedInUser = null;
    renderIcons(); // Render icons needed for auth screen if any (though currently none)
    // Reset potential app state if needed
}

function renderIcons() {
     // Access createIcons from the global lucide object provided by the UMD script
     if (window.lucide) {
        window.lucide.createIcons();
     } else {
        console.error("Lucide library not loaded correctly.");
     }
}

function toggleSidebar() {
     const isMobile = window.innerWidth <= 768;

     if (isMobile) {
         isSidebarVisibleMobile = !isSidebarVisibleMobile;
         if (isSidebarVisibleMobile) {
             appContainer.classList.add('sidebar-visible');
             appContainer.classList.remove('sidebar-collapsed'); // Ensure not collapsed
         } else {
             appContainer.classList.remove('sidebar-visible');
         }
         // Don't toggle collapsed state on mobile, only visibility
     } else {
        isSidebarCollapsed = !isSidebarCollapsed;
        if (isSidebarCollapsed) {
            appContainer.classList.add('sidebar-collapsed');
            appContainer.classList.remove('sidebar-visible'); // Ensure not visible state
        } else {
            appContainer.classList.remove('sidebar-collapsed');
        }
     }
     updateMenuToggleIcon();
}

function updateMenuToggleIcon() {
    const isMobile = window.innerWidth <= 768;
    const iconName = (isMobile && isSidebarVisibleMobile) || (!isMobile && !isSidebarCollapsed) ? 'x' : 'menu';
    menuToggleButton.innerHTML = ''; // Clear previous icon

    // Create the specific icon needed
    if (window.lucide && window.lucide.icons[iconName]) {
        const svgString = window.lucide.icons[iconName].toSvg({
            'stroke-width': 2,
             width: 24,
             height: 24
        });
        menuToggleButton.innerHTML = svgString;
    } else {
        // Fallback or error handling
        menuToggleButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`; // Default menu icon
        console.error(`Lucide icon "${iconName}" not found.`);
    }
}

function setActivePage(pageId) {
    // Deactivate all pages and links
    contentPages.forEach(page => page.classList.remove('active'));
    navLinks.forEach(link => link.classList.remove('active'));

    // Activate the selected page
    const pageToShow = document.getElementById(`page-${pageId}`);
    if (pageToShow) {
        pageToShow.classList.add('active');
        pageToShow.style.display = 'block'; // Ensure visibility if previously hidden
    } else {
        console.warn(`Page with id "page-${pageId}" not found.`);
        // Activate default page (e.g., 'pedidos') if requested page not found
         const defaultPage = document.getElementById('page-pedidos');
         const defaultLink = document.querySelector('.nav-link[data-page="pedidos"]');
         if(defaultPage) defaultPage.classList.add('active');
         if(defaultPage) defaultPage.style.display = 'block';
         if(defaultLink) defaultLink.classList.add('active');
         return; // Exit early
    }

    // Activate the corresponding nav link
    const activeLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

     // Hide other pages after transition (optional, improves performance)
    contentPages.forEach(page => {
        if (!page.classList.contains('active')) {
            page.style.display = 'none';
        }
    });

     // Close mobile sidebar after navigation
     if (window.innerWidth <= 768 && isSidebarVisibleMobile) {
        toggleSidebar();
     }
}

function resetCustomerForm() {
    customerForm.reset();
    cpfCnpjLabel.textContent = 'CPF/CNPJ:';
    nomeFantasiaGroup.style.display = 'none';
    customerRegDateSpan.textContent = '-';
    customerModDateSpan.textContent = '-';
    currentEditingCustomerId = null; // Reset editing state
    renderIcons(); // Re-render icons in buttons if they were dynamically added/changed
}

// --- Event Listeners ---
showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveForm(signupFormContainer);
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveForm(loginFormContainer);
});

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (password !== confirmPassword) {
        alert("Senhas não coincidem!");
        return;
    }
    if (users[username]) {
        alert("Usuário já existe!");
        return;
    }

    // Simple password storage (INSECURE! Replace with hashing in a real app)
    users[username] = { password: password, name: name };
    console.log("Usuário cadastrado:", username, users[username]);
    alert("Cadastro realizado com sucesso! Faça o login.");
    setActiveForm(loginFormContainer);
    signupForm.reset();
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    // Simple password check (INSECURE!)
    if (users[username] && users[username].password === password) {
        loggedInUser = username;
        console.log("Login bem-sucedido para:", loggedInUser);
        showApp();
        setActivePage('pedidos'); // Default page after login
    } else {
        alert("Usuário ou senha inválidos!");
    }
    loginForm.reset();
});

menuToggleButton.addEventListener('click', toggleSidebar);

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.getAttribute('data-page');
        if (pageId) {
             setActivePage(pageId);
        }
    });
});

logoutButton.addEventListener('click', (e) => {
    e.preventDefault();
    console.log("Logout:", loggedInUser);
    showAuth();
});

searchInput.addEventListener('input', (e) => {
    console.log("Pesquisando por:", e.target.value);
    // Add actual search logic here
});

filterButton.addEventListener('click', () => {
    console.log("Botão Filtrar clicado");
    // Add filter logic/modal here
});

addButton.addEventListener('click', () => {
    console.log("Botão Inserir clicado");
    // Add logic to show an add order form/modal
});

editButton.addEventListener('click', () => {
    console.log("Botão Editar clicado");
    // Add logic to edit a selected order
});

deleteButton.addEventListener('click', () => {
    console.log("Botão Excluir clicado");
    // Add logic to delete a selected order (with confirmation)
});

// Customer Form Logic
customerTypeSelect.addEventListener('change', (e) => {
    const type = e.target.value;
    if (type === 'fisica') {
        cpfCnpjLabel.textContent = 'CPF:';
        cpfCnpjInput.placeholder = '___.___.___-__'; // Add mask hint if desired
        nomeFantasiaGroup.style.display = 'none'; // Hide fantasy name for individuals
        nomeFantasiaGroup.querySelector('input').required = false;
        cpfCnpjInput.required = true; // CPF is required
    } else if (type === 'juridica') {
        cpfCnpjLabel.textContent = 'CNPJ:';
        cpfCnpjInput.placeholder = '__.___.___/____-__'; // Add mask hint if desired
        nomeFantasiaGroup.style.display = 'block'; // Show fantasy name for companies
        nomeFantasiaGroup.querySelector('input').required = false; // Optional
        cpfCnpjInput.required = true; // CNPJ is required
    } else {
        cpfCnpjLabel.textContent = 'CPF/CNPJ:';
        cpfCnpjInput.placeholder = '';
        nomeFantasiaGroup.style.display = 'none';
        nomeFantasiaGroup.querySelector('input').required = false;
         cpfCnpjInput.required = false; // Not required until type is selected
    }
});

customerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const now = new Date().toISOString();

    const customerData = {
        id: currentEditingCustomerId || Date.now().toString(), // Use existing ID if editing, else generate new
        type: customerTypeSelect.value,
        cpfCnpj: cpfCnpjInput.value,
        name: document.getElementById('customer-name').value,
        fantasyName: document.getElementById('customer-fantasy-name').value || null, // Use null if empty
        address: document.getElementById('customer-address').value,
        phone: document.getElementById('customer-phone').value,
        contactName: document.getElementById('customer-contact').value,
        email: document.getElementById('customer-email').value,
        status: document.querySelector('input[name="customer-status"]:checked').value,
        registrationDate: currentEditingCustomerId
            ? customers.find(c => c.id === currentEditingCustomerId).registrationDate // Keep original reg date on edit
            : now,
        lastModifiedDate: now,
    };

    if (currentEditingCustomerId) {
        // Update existing customer
        const index = customers.findIndex(c => c.id === currentEditingCustomerId);
        if (index !== -1) {
            customers[index] = customerData;
            console.log("Cliente atualizado:", customerData);
            alert("Cliente atualizado com sucesso!");
        } else {
            console.error("Erro ao atualizar: Cliente não encontrado");
            alert("Erro ao atualizar cliente.");
        }
    } else {
        // Add new customer
        customers.push(customerData);
        console.log("Cliente cadastrado:", customerData);
        console.log("Lista de Clientes:", customers);
        alert("Cliente cadastrado com sucesso!");
    }

    // Display dates (might be better to do this when loading data for edit)
    customerRegDateSpan.textContent = new Date(customerData.registrationDate).toLocaleDateString('pt-BR');
    customerModDateSpan.textContent = new Date(customerData.lastModifiedDate).toLocaleString('pt-BR');

    resetCustomerForm();
    // Optionally switch focus or update a customer list display here
});

cancelCustomerButton.addEventListener('click', () => {
    resetCustomerForm();
     console.log("Cadastro de cliente cancelado.");
});

// --- Initial Setup ---
// Render icons on initial load after the script runs and lucide is available
document.addEventListener('DOMContentLoaded', () => {
    // Check if auth container is visible initially
    if (getComputedStyle(authContainer).display !== 'none') {
      renderIcons(); // Render for auth screen if needed
    } else if (getComputedStyle(appContainer).display !== 'none') {
      renderIcons(); // Render icons in the app if it's visible initially
       setActivePage('pedidos'); // Ensure default page is set if app loads directly
    }
    updateMenuToggleIcon(); // Set initial menu icon state

    // Initial render of icons within the customer form specifically
    lucide.createIcons({
        nodes: customerForm.querySelectorAll('[data-lucide]')
    });

});

// Handle window resize to adjust sidebar behavior
window.addEventListener('resize', () => {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) {
        // If resizing to desktop, ensure mobile specific classes are removed
        appContainer.classList.remove('sidebar-visible');
        isSidebarVisibleMobile = false; // Reset mobile visibility state
         // Re-apply collapsed state if it was set
        if (isSidebarCollapsed) {
             appContainer.classList.add('sidebar-collapsed');
        } else {
             appContainer.classList.remove('sidebar-collapsed'); // Ensure it's removed if not collapsed
        }
    } else {
         // If resizing to mobile
         appContainer.classList.remove('sidebar-collapsed'); // Remove desktop collapsed state
         // Keep sidebar visible if it was already open on mobile
         if(isSidebarVisibleMobile) {
             appContainer.classList.add('sidebar-visible');
         } else {
             appContainer.classList.remove('sidebar-visible');
         }
    }
    updateMenuToggleIcon(); // Update icon based on new size/state
});