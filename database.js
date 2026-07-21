const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'database.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error al abrir la base de datos:', err.message);
  } else {
    console.log('Conectado a SQLite en:', DB_PATH);
    initDatabase();
  }
});

function initDatabase() {
  // Tabla de clientes
  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de productos/precios
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      image_data LONGTEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de imágenes
  db.run(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      image_data LONGTEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insertar productos por defecto si no existen
  db.all('SELECT COUNT(*) as count FROM products', (err, rows) => {
    if (rows[0].count === 0) {
      const defaultProducts = [
        { name: 'Motor para portón', price: 250.00, description: 'Motor automático con control remoto y garantía.' },
        { name: 'Bisagras reforzadas', price: 45.00, description: 'Juego de bisagras para portones pesados.' },
        { name: 'Panel metálico', price: 120.00, description: 'Paneles cortados a medida para portones.' }
      ];

      defaultProducts.forEach(product => {
        db.run(
          'INSERT INTO products (name, price, description) VALUES (?, ?, ?)',
          [product.name, product.price, product.description]
        );
      });
      console.log('Productos por defecto insertados');
    }
  });
}

// Funciones para clientes
function addCustomer(name, email, phone, message, callback) {
  db.run(
    'INSERT INTO customers (name, email, phone, message) VALUES (?, ?, ?, ?)',
    [name, email, phone, message],
    function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { id: this.lastID });
      }
    }
  );
}

function getCustomers(callback) {
  db.all('SELECT * FROM customers ORDER BY created_at DESC', callback);
}

// Funciones para productos
function getProducts(callback) {
  db.all('SELECT * FROM products ORDER BY id', callback);
}

function updateProduct(id, name, price, description, imageData, callback) {
  db.run(
    'UPDATE products SET name = ?, price = ?, description = ?, image_data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, price, description, imageData || null, id],
    callback
  );
}

function getProductImage(id, callback) {
  db.get('SELECT image_data FROM products WHERE id = ?', [id], callback);
}

// Funciones para imágenes
function addImage(title, imageData, callback) {
  db.run(
    'INSERT INTO images (title, image_data) VALUES (?, ?)',
    [title, imageData],
    function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { id: this.lastID });
      }
    }
  );
}

function getImages(callback) {
  db.all('SELECT id, title, created_at FROM images ORDER BY created_at DESC', callback);
}

function getImageData(id, callback) {
  db.get('SELECT image_data FROM images WHERE id = ?', [id], callback);
}

function deleteImage(id, callback) {
  db.run('DELETE FROM images WHERE id = ?', [id], callback);
}

module.exports = {
  db,
  addCustomer,
  getCustomers,
  getProducts,
  updateProduct,
  getProductImage,
  addImage,
  getImages,
  getImageData,
  deleteImage
};
