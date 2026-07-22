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

// Mostrar una notificación (toast) en vez de alert()
function showToast(message, type = 'success', duration = 5000) {
  const container = document.getElementById('toastContainer');
  if (!container) {
    alert(message);
    return;
  }

  const icons = { success: '✅', error: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-body"></span>
    <button type="button" class="toast-close" aria-label="Cerrar">✕</button>
  `;
  toast.querySelector('.toast-body').textContent = message;

  const remove = () => {
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 250);
  };

  toast.querySelector('.toast-close').addEventListener('click', remove);
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast-show'));

  if (duration > 0) {
    setTimeout(remove, duration);
  }
}

// ===== GALERÍA PÚBLICA DE INSTALACIONES =====
// container: elemento o id del contenedor. limit: número máximo de imágenes (opcional, si se omite muestra todas)
function loadPublicGallery(container, limit) {
  const galleryGrid = typeof container === 'string' ? document.getElementById(container) : container;
  if (!galleryGrid) return;

  galleryGrid.innerHTML = '<p>Cargando galería...</p>';

  fetch(`${API_URL}/images`)
    .then(res => res.json())
    .then(images => {
      galleryGrid.innerHTML = '';
      let list = images || [];
      if (limit) list = list.slice(0, limit);

      if (list.length === 0) {
        galleryGrid.innerHTML = '<p>Aún no hay imágenes de instalaciones cargadas.</p>';
        return;
      }

      list.forEach(image => {
        const figure = document.createElement('figure');
        figure.innerHTML = `
          <img alt="${image.title}">
          <figcaption>${image.title}</figcaption>
        `;
        galleryGrid.appendChild(figure);

        fetch(`${API_URL}/images/${image.id}`)
          .then(res => res.json())
          .then(data => {
            figure.querySelector('img').src = data.imageData;
          })
          .catch(err => console.error('Error cargando imagen:', err));
      });
    })
    .catch(err => {
      galleryGrid.innerHTML = '<p style="color:red;">Error al cargar la galería</p>';
      console.error('Error:', err);
    });
}

// ===== PRODUCTOS PÚBLICOS =====
function renderProductCards(container, products) {
  const grid = typeof container === 'string' ? document.getElementById(container) : container;
  if (!grid) return;

  grid.innerHTML = '';

  if (!products || products.length === 0) {
    grid.innerHTML = '<p>No hay productos disponibles por el momento.</p>';
    return;
  }

  products.forEach(product => {
    const card = document.createElement('article');
    card.className = 'card';
    const imgSrc = product.image_data || `https://via.placeholder.com/400x300?text=${encodeURIComponent(product.name)}`;
    card.innerHTML = `
      <img src="${imgSrc}" alt="${product.name}">
      <div class="card-body">
        <h4>${product.name}</h4>
        <p class="price">$${Number(product.price).toFixed(2)}</p>
        <p>${product.description || ''}</p>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Productos destacados (más vendidos) para la página de inicio
function loadFeaturedProducts(container) {
  const grid = typeof container === 'string' ? document.getElementById(container) : container;
  if (!grid) return;
  grid.innerHTML = '<p>Cargando productos...</p>';

  fetch(`${API_URL}/products?featured=1`)
    .then(res => res.json())
    .then(products => renderProductCards(grid, (products || []).slice(0, 3)))
    .catch(err => {
      grid.innerHTML = '<p style="color:red;">Error al cargar productos</p>';
      console.error('Error:', err);
    });
}

// Catálogo completo de productos (página independiente)
function loadAllProducts(container) {
  const grid = typeof container === 'string' ? document.getElementById(container) : container;
  if (!grid) return;
  grid.innerHTML = '<p>Cargando productos...</p>';

  fetch(`${API_URL}/products`)
    .then(res => res.json())
    .then(products => renderProductCards(grid, products))
    .catch(err => {
      grid.innerHTML = '<p style="color:red;">Error al cargar productos</p>';
      console.error('Error:', err);
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
        showToast('Por favor completa los campos requeridos.', 'error');
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
          showToast('¡Mensaje enviado! Abriendo WhatsApp para confirmar tu solicitud...', 'success');
          const whatsappNumber = '526671034487';
          const lines = [
            '🔔 *Nuevo contacto desde la web*',
            '',
            `👤 Nombre: ${name}`,
            `📧 Email: ${email}`
          ];
          if (phone) lines.push(`📱 Teléfono: ${phone}`);
          lines.push('', `📝 Mensaje: ${message}`);
          const text = lines.join('\n');
          const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
          setTimeout(() => window.open(waUrl, '_blank'), 600);
          contactForm.reset();
        } else {
          showToast('No se pudo enviar el mensaje. Intenta de nuevo.', 'error');
        }
      })
      .catch(err => {
        console.error('Error:', err);
        showToast('Ocurrió un error al enviar tu mensaje. Intenta de nuevo.', 'error');
      });
    });
  }

  loadPublicGallery('galleryGrid', 3);
  loadFeaturedProducts('featuredProductsGrid');

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
        showToast('Contraseña incorrecta', 'error');
      }
    })
    .catch(err => {
      showToast('Error al autenticar', 'error');
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
          priceItem.dataset.name = product.name.toLowerCase();
          priceItem.innerHTML = `
            <div class="product-summary">
              <span class="product-summary-name">${product.name}</span>
              <span class="product-summary-price">$${product.price}</span>
              <span class="toggle-icon">▸</span>
            </div>
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
              <div class="form-group form-group-checkbox">
                <label>
                  <input type="checkbox" class="product-featured" data-id="${product.id}" ${product.featured ? 'checked' : ''}>
                  Destacado (mostrar en la página de inicio)
                </label>
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

          // Alternar expandir/colapsar al hacer clic en el resumen
          priceItem.querySelector('.product-summary').addEventListener('click', function(){
            priceItem.classList.toggle('expanded');
          });
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
            const featured = form.querySelector('.product-featured').checked;

            if(!name || isNaN(price)){
              showToast('Por favor completa los campos requeridos', 'error');
              return;
            }

            // Si hay imagen nueva, convertir a base64
            if(imageInput.files[0]){
              const reader = new FileReader();
              reader.onload = function(e){
                updateProductData(productId, name, price, description, e.target.result, featured);
              };
              reader.readAsDataURL(imageInput.files[0]);
            } else {
              // Actualizar sin cambiar imagen
              updateProductData(productId, name, price, description, null, featured);
            }
          });
        });

        // Aplicar filtro de búsqueda actual (si el usuario ya había escrito algo)
        const searchInput = document.getElementById('productSearchInput');
        if(searchInput && searchInput.value){
          filterProductsList(searchInput.value);
        }
      })
      .catch(err => {
        pricesList.innerHTML = '<p style="color:red;">Error al cargar productos</p>';
        console.error('Error:', err);
      });
  }

  // Filtrar la lista de productos por nombre
  function filterProductsList(query){
    const term = query.trim().toLowerCase();
    document.querySelectorAll('#pricesList .product-edit-item').forEach(item => {
      const matches = !term || (item.dataset.name || '').includes(term);
      item.classList.toggle('hidden', !matches);
    });
  }

  const productSearchInput = document.getElementById('productSearchInput');
  if(productSearchInput){
    productSearchInput.addEventListener('input', function(){
      filterProductsList(this.value);
    });
  }

  // Botón para agregar un producto nuevo
  const addProductBtn = document.getElementById('addProductBtn');
  if(addProductBtn){
    addProductBtn.addEventListener('click', function(){
      if(document.getElementById('newProductForm')) return; // ya está abierto

      const pricesList = document.getElementById('pricesList');
      const newItem = document.createElement('div');
      newItem.className = 'product-edit-item expanded';
      newItem.id = 'newProductForm';
      newItem.innerHTML = `
        <div class="product-edit-form">
          <div class="form-group">
            <label>Nombre del producto:</label>
            <input type="text" class="product-name">
          </div>
          <div class="form-group">
            <label>Precio:</label>
            <input type="number" step="0.01" class="product-price">
          </div>
          <div class="form-group">
            <label>Descripción:</label>
            <input type="text" class="product-description">
          </div>
          <div class="form-group">
            <label>Imagen:</label>
            <input type="file" accept="image/*" class="product-image">
            <div class="product-image-preview" style="margin-top:10px;"></div>
          </div>
          <div class="form-group form-group-checkbox">
            <label>
              <input type="checkbox" class="product-featured" checked>
              Destacado (mostrar en la página de inicio)
            </label>
          </div>
          <div class="new-product-actions">
            <button type="button" class="create-product-btn">Crear producto</button>
            <button type="button" class="cancel-product-btn">Cancelar</button>
          </div>
        </div>
      `;
      pricesList.prepend(newItem);

      const imageInput = newItem.querySelector('.product-image');
      const preview = newItem.querySelector('.product-image-preview');
      imageInput.addEventListener('change', function(){
        const file = this.files[0];
        if(file){
          const reader = new FileReader();
          reader.onload = function(e){
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="width:100%;max-width:200px;border-radius:5px;">`;
          };
          reader.readAsDataURL(file);
        }
      });

      newItem.querySelector('.cancel-product-btn').addEventListener('click', function(){
        newItem.remove();
      });

      newItem.querySelector('.create-product-btn').addEventListener('click', function(){
        const name = newItem.querySelector('.product-name').value.trim();
        const price = parseFloat(newItem.querySelector('.product-price').value);
        const description = newItem.querySelector('.product-description').value.trim();
        const featured = newItem.querySelector('.product-featured').checked;

        if(!name || isNaN(price)){
          showToast('Por favor completa nombre y precio', 'error');
          return;
        }

        const createProduct = (imageData) => {
          fetchWithAuth(`${API_URL}/products`, {
            method: 'POST',
            body: JSON.stringify({ name, price, description, imageData, featured })
          })
          .then(res => res.json())
          .then(data => {
            if(data.success){
              showToast('Producto creado correctamente', 'success');
              loadPricesUI();
            } else {
              showToast('No se pudo crear el producto', 'error');
            }
          })
          .catch(err => {
            console.error('Error:', err);
            showToast('Ocurrió un error al crear el producto', 'error');
          });
        };

        if(imageInput.files[0]){
          const reader = new FileReader();
          reader.onload = function(e){ createProduct(e.target.result); };
          reader.readAsDataURL(imageInput.files[0]);
        } else {
          createProduct(null);
        }
      });
    });
  }

  function updateProductData(id, name, price, description, imageData, featured){
    const body = { name, price, description, featured };
    if(imageData) body.imageData = imageData;

    fetchWithAuth(`${API_URL}/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(data => {
      if(data.success){
        showToast('Producto actualizado correctamente', 'success');
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
      showToast('Completa todos los campos', 'error');
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
          loadPublicGallery('galleryGrid', 3);
          imagePreview.innerHTML = '';
          imageInput.value = '';
          imageTitle.value = '';
          showToast('Imagen cargada correctamente', 'success');
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
                  loadPublicGallery('galleryGrid', 3);
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

// Inicialización para páginas independientes (productos.html, galeria.html)
function initStaticPage() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const allProductsGrid = document.getElementById('allProductsGrid');
  if (allProductsGrid) loadAllProducts(allProductsGrid);

  const fullGalleryGrid = document.getElementById('fullGalleryGrid');
  if (fullGalleryGrid) loadPublicGallery(fullGalleryGrid);
}

// Iniciar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function(){
  if (document.getElementById('app')) {
    loadViews();
  } else {
    initStaticPage();
  }
});