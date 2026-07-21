// Script para manejar API REST, admin panel e imágenes
const API_URL = '/api';

// Cargar las vistas HTML dinámicamente
async function loadViews() {
  const app = document.getElementById('app');
  
  try {
    // Cargar vista cliente
    const clientRes = await fetch('cliente.html');
    const clientHTML = await clientRes.text();
    
    // Cargar vista admin
    const adminRes = await fetch('admin.html');
    const adminHTML = await adminRes.text();
    
    // Insertar ambas vistas en el contenedor app
    app.innerHTML = clientHTML + adminHTML;
    
    // Inicializar después de cargar las vistas
    initializeApp();
  } catch (error) {
    console.error('Error cargando vistas:', error);
    app.innerHTML = '<p style="color:red;padding:20px;">Error cargando aplicación</p>';
  }
}

// Obtener token del localStorage
function getAuthToken() {
  return localStorage.getItem('admin_token');
}

// Guardar token en localStorage
function setAuthToken(token) {
  localStorage.setItem('admin_token', token);
}

// Limpiar token
function clearAuthToken() {
  localStorage.removeItem('admin_token');
}

// Hacer fetch con token automático
function fetchWithAuth(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers })
    .then(res => {
      // Si recibimos 401, limpiar token y redirigir
      if (res.status === 401) {
        clearAuthToken();
        location.reload();
      }
      return res;
    });
}

// Función principal de inicialización
function initializeApp() {
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // Contact Form - Guardar en BD
  const contactForm = document.getElementById('contactForm');
  if(contactForm){
    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const phone = contactForm.phone ? contactForm.phone.value.trim() : '';
      const message = contactForm.message.value.trim();
      if(!name || !email || !message){
        alert('Por favor complete los campos requeridos.');
        return;
      }

      // Guardar en la BD
      fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message })
      })
      .then(res => res.json())
      .then(data => {
        if(data.success){
          alert('Mensaje guardado. Se abrirá WhatsApp para confirmar.');
          const whatsappNumber = '526671034487';
          const text = `Nuevo contacto desde web%0ANombre: ${name}%0AEmail: ${email}%0ATeléfono: ${phone}%0AMensaje: ${message}`;
          const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
          window.open(waUrl, '_blank');
          contactForm.reset();
        }
      })
      .catch(err => console.error('Error:', err));
    });
  }

  // ===== VISTAS =====
  const clientView = document.getElementById('clientView');
  const adminView = document.getElementById('adminView');
  let adminLoggedIn = false;

  function showClientView(){
    clientView.style.display = 'block';
    adminView.style.display = 'none';
  }

  function showAdminView(){
    clientView.style.display = 'none';
    adminView.style.display = 'block';
  }

  // ===== ADMIN PANEL =====
  const adminBtn = document.getElementById('adminBtn');
  const adminLoginModal = document.getElementById('adminLoginModal');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const closeBtn = document.querySelector('.close');
  const logoutBtn = document.getElementById('logoutBtn');

  // Abrir modal de login
  adminBtn.addEventListener('click', function(){
    if(!adminLoggedIn){
      adminLoginModal.style.display = 'block';
    }
  });

  // Cerrar modal
  closeBtn.addEventListener('click', function(){
    adminLoginModal.style.display = 'none';
  });

  window.addEventListener('click', function(e){
    if(e.target === adminLoginModal){
      adminLoginModal.style.display = 'none';
    }
  });

  // Login admin
  adminLoginForm.addEventListener('submit', function(e){
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;
    
    // Enviar contraseña al servidor para obtener token
    fetch(`${API_URL}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
    .then(res => res.json())
    .then(data => {
      if(data.success && data.token){
        // Guardar token
        setAuthToken(data.token);
        adminLoggedIn = true;
        adminLoginModal.style.display = 'none';
        document.getElementById('adminPassword').value = '';
        loadPricesUI();
        loadUploadedImages();
        showAdminView();
      } else {
        alert('Contraseña incorrecta');
      }
    })
    .catch(err => {
      alert('Error al autenticar');
      console.error('Error:', err);
    });
  });

  // Logout
  logoutBtn.addEventListener('click', function(){
    const token = getAuthToken();
    
    // Notificar al servidor
    if(token){
      fetchWithAuth(`${API_URL}/logout`, { method: 'POST' })
        .catch(err => console.error('Error en logout:', err));
    }
    
    // Limpiar sesión local
    clearAuthToken();
    adminLoggedIn = false;
    showClientView();
  });

  // ===== TAB NAVIGATION =====
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function(){
      const tabName = this.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
      this.classList.add('active');
      document.getElementById(tabName + 'Tab').classList.add('active');
    });
  });

  // ===== PRODUCTS MANAGEMENT =====
  function loadPricesUI(){
    const pricesList = document.getElementById('pricesList');
    pricesList.innerHTML = '<p>Cargando productos...</p>';
    
    fetchWithAuth(`${API_URL}/products`)
      .then(res => res.json())
      .then(products => {
        pricesList.innerHTML = '';
        products.forEach((product) => {
          const priceItem = document.createElement('div');
          priceItem.className = 'product-edit-item';
          priceItem.innerHTML = `
            <div class="product-edit-form">
              <div class="form-group">
                <label>Nombre del producto:</label>
                <input type="text" class="product-name" value="${product.name}" data-id="${product.id}">
              </div>
              <div class="form-group">
                <label>Precio:</label>
                <input type="number" step="0.01" class="product-price" value="${product.price}" data-id="${product.id}">
              </div>
              <div class="form-group">
                <label>Descripción:</label>
                <input type="text" class="product-description" value="${product.description || ''}" data-id="${product.id}">
              </div>
              <div class="form-group">
                <label>Imagen:</label>
                <input type="file" accept="image/*" class="product-image" data-id="${product.id}">
                <div class="product-image-preview" data-id="${product.id}" style="margin-top:10px;"></div>
              </div>
              <button type="button" class="update-product-btn" data-id="${product.id}">Guardar cambios</button>
            </div>
          `;
          pricesList.appendChild(priceItem);

          // Cargar imagen del producto si existe
          if(product.image_data){
            const preview = priceItem.querySelector('.product-image-preview');
            preview.innerHTML = `<img src="${product.image_data}" alt="${product.name}" style="width:100%;max-width:200px;border-radius:5px;">`;
          }
        });

        // Listeners para cambio de imagen
        document.querySelectorAll('.product-image').forEach(input => {
          input.addEventListener('change', function(){
            const file = this.files[0];
            if(file){
              const reader = new FileReader();
              reader.onload = function(e){
                const preview = document.querySelector(`.product-image-preview[data-id="${input.dataset.id}"]`);
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="width:100%;max-width:200px;border-radius:5px;">`;
              };
              reader.readAsDataURL(file);
            }
          });
        });

        // Listeners para guardar cambios
        document.querySelectorAll('.update-product-btn').forEach(btn => {
          btn.addEventListener('click', function(){
            const productId = this.dataset.id;
            const form = this.closest('.product-edit-form');
            const name = form.querySelector('.product-name').value.trim();
            const price = parseFloat(form.querySelector('.product-price').value);
            const description = form.querySelector('.product-description').value.trim();
            const imageInput = form.querySelector('.product-image');

            if(!name || isNaN(price)){
              alert('Por favor completa los campos requeridos');
              return;
            }

            // Si hay imagen nueva, convertir a base64
            if(imageInput.files[0]){
              const reader = new FileReader();
              reader.onload = function(e){
                updateProductData(productId, name, price, description, e.target.result);
              };
              reader.readAsDataURL(imageInput.files[0]);
            } else {
              // Actualizar sin cambiar imagen
              updateProductData(productId, name, price, description, null);
            }
          });
        });
      })
      .catch(err => {
        pricesList.innerHTML = '<p style="color:red;">Error al cargar productos</p>';
        console.error('Error:', err);
      });
  }

  function updateProductData(id, name, price, description, imageData){
    const body = { name, price, description };
    if(imageData) body.imageData = imageData;

    fetchWithAuth(`${API_URL}/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(data => {
      if(data.success){
        alert('Producto actualizado correctamente');
        loadPricesUI();
      }
    })
    .catch(err => console.error('Error:', err));
  }

  // ===== IMAGE UPLOAD =====
  const uploadForm = document.getElementById('uploadForm');
  const imageInput = document.getElementById('imageInput');
  const imagePreview = document.getElementById('imagePreview');
  const imageTitle = document.getElementById('imageTitle');

  imageInput.addEventListener('change', function(){
    const file = this.files[0];
    if(file){
      const reader = new FileReader();
      reader.onload = function(e){
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      };
      reader.readAsDataURL(file);
    }
  });

  uploadForm.addEventListener('submit', function(e){
    e.preventDefault();
    const file = imageInput.files[0];
    const title = imageTitle.value.trim();
    if(!file || !title){
      alert('Completa todos los campos');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e){
      const imageData = e.target.result;
      
      fetchWithAuth(`${API_URL}/images`, {
        method: 'POST',
        body: JSON.stringify({ title, imageData })
      })
      .then(res => res.json())
      .then(data => {
        if(data.success){
          loadUploadedImages();
          imagePreview.innerHTML = '';
          imageInput.value = '';
          imageTitle.value = '';
          alert('Imagen cargada correctamente');
        }
      })
      .catch(err => console.error('Error:', err));
    };
    reader.readAsDataURL(file);
  });

  function loadUploadedImages(){
    const uploadedImagesDiv = document.getElementById('uploadedImages');
    uploadedImagesDiv.innerHTML = '<p>Cargando imágenes...</p>';
    
    fetchWithAuth(`${API_URL}/images`)
      .then(res => res.json())
      .then(images => {
        uploadedImagesDiv.innerHTML = '';

        if(images.length === 0){
          uploadedImagesDiv.innerHTML = '<p style="grid-column:1/-1;color:#999">No hay imágenes cargadas aún</p>';
          return;
        }

        images.forEach(image => {
          const imgItem = document.createElement('div');
          imgItem.className = 'uploaded-img-item';
          imgItem.innerHTML = `
            <img src="data:image/png;base64,..." alt="${image.title}" style="width:100%;height:120px;background:#eee;border-radius:3px;" data-image-id="${image.id}">
            <p>${image.title}</p>
            <button type="button" data-id="${image.id}">Eliminar</button>
          `;
          uploadedImagesDiv.appendChild(imgItem);

          // Cargar la imagen
          fetchWithAuth(`${API_URL}/images/${image.id}`)
            .then(res => res.json())
            .then(data => {
              const img = imgItem.querySelector('img');
              img.src = data.imageData;
            })
            .catch(err => console.error('Error cargando imagen:', err));
        });

        document.querySelectorAll('.uploaded-img-item button').forEach(btn => {
          btn.addEventListener('click', function(){
            const id = this.dataset.id;
            fetchWithAuth(`${API_URL}/images/${id}`, { method: 'DELETE' })
              .then(res => res.json())
              .then(data => {
                if(data.success){
                  loadUploadedImages();
                }
              })
              .catch(err => console.error('Error:', err));
          });
        });
      })
      .catch(err => {
        uploadedImagesDiv.innerHTML = '<p style="color:red;">Error al cargar imágenes</p>';
        console.error('Error:', err);
      });
  }

  // Mostrar vista cliente por defecto, o admin si hay token válido
  const token = getAuthToken();
  if(token){
    // Validar que el token sea válido haciendo un request a una ruta protegida
    fetchWithAuth(`${API_URL}/products`)
      .then(res => {
        if(res.status === 401){
          clearAuthToken();
          showClientView();
        } else {
          adminLoggedIn = true;
          loadPricesUI();
          loadUploadedImages();
          showAdminView();
        }
      })
      .catch(err => {
        clearAuthToken();
        showClientView();
      });
  } else {
    showClientView();
  }
}

// Iniciar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function(){
  loadViews();
});