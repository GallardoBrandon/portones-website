# AI Agent Guidelines for Portones & Mercancía Website

## Project Overview
A full-stack web application for managing doors/gates (portones) and merchandise. Built with Node.js + Express backend, SQLite database, and vanilla HTML/CSS/JavaScript frontend. Features a public customer form and admin panel with authentication.

**Language**: Spanish (site content and documentation)
**Status**: Production-ready (npm install + npm start should work)

---

## Tech Stack
- **Backend**: Node.js + Express 4.18
- **Database**: SQLite3 (file-based: `database.db`)
- **Frontend**: HTML + CSS + JavaScript (Fetch API, no frameworks)
- **Dependencies**: express, sqlite3, cors, body-parser

---

## Quick Start for Agents

### Installation & Running
```bash
npm install
npm start  # or: npm run dev
```
- Server runs on **http://localhost:3000**
- Database auto-initializes on first run
- Static files (HTML, CSS, JS) served from root directory

### Project Structure
```
server.js         # Express API server & route handlers
database.js       # SQLite initialization & database functions
index.html        # Frontend: public view + admin panel (single file)
script.js         # Client-side logic: form submissions, API calls, admin panel
styles.css        # All CSS (public + admin panel styles)
database.db       # SQLite database (auto-created)
package.json      # Dependencies & npm scripts
SETUP.md          # Full setup documentation (link rather than duplicate)
```

---

## Database Schema

### Table: `customers`
Used for contact form submissions
- `id` (INTEGER PRIMARY KEY)
- `name`, `email`, `phone` (TEXT)
- `message` (TEXT) – inquiry/contact message
- `created_at` (DATETIME)

### Table: `products`
Product pricing and descriptions
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT) – product name
- `price` (REAL) – current price
- `description` (TEXT)
- `updated_at` (DATETIME)

### Table: `images`
Uploaded product images (base64 encoded)
- `id` (INTEGER PRIMARY KEY)
- `title`, `image_data` (TEXT)
- `created_at` (DATETIME)

---

## API Endpoints Reference

### Customers
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST   | `/api/customers` | Create customer contact |
| GET    | `/api/customers` | List all customers (admin) |

**POST Body**: `{ name, email, phone?, message }`

### Products
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET    | `/api/products` | List all products |
| PUT    | `/api/products/:id` | Update product price |

**PUT Body**: `{ price }`

### Images
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST   | `/api/images` | Upload new image |
| GET    | `/api/images` | List all images (admin) |
| GET    | `/api/images/:id` | Get single image by ID |
| DELETE | `/api/images/:id` | Delete image by ID |

**POST Body**: `{ title, image_data }` (image_data = base64 string)

---

## Admin Authentication
- **Method**: Simple password in `script.js`
- **Current password**: `admin123`
- **To change**: Edit `ADMIN_PASSWORD` variable in `script.js`
- **Implementation**: Client-side only (localStorage-based session)

---

## Code Conventions

### Backend (Express routes in `server.js`)
- Routes are organized by resource with section comments: `// ===== RUTAS DE [RESOURCE] =====`
- Error handling: Standard HTTP status codes (400, 500) with JSON error messages
- All responses are JSON
- Database callbacks follow Node callback pattern: `(err, result) => {...}`

### Frontend (`index.html`, `script.js`)
- Single HTML file with embedded CSS and JavaScript
- Admin panel toggle: Check `isAdminAuthenticated` variable in localStorage
- All API calls use Fetch API with async/await
- CSS classes use kebab-case (e.g., `.admin-panel`, `.product-form`)

### Database (`database.js`)
- Callback-based API (not Promises)
- `initDatabase()` runs on startup and creates tables if they don't exist
- Example: `db.addCustomer(name, email, phone, message, callback)`

---

## Common Development Tasks

### Adding a New API Endpoint
1. Add route handler in `server.js` with appropriate HTTP method
2. Add database function in `database.js` if needed
3. Update this documentation in API reference table
4. Add frontend logic in `script.js` to call the endpoint

### Modifying the Database Schema
1. Update `initDatabase()` in `database.js` (CREATE TABLE IF NOT EXISTS is safe)
2. Add corresponding database function to handle the new table
3. Add routes in `server.js`

### Updating Admin Features
1. Admin UI in `index.html` (look for `class="admin-panel"`)
2. Admin logic in `script.js` (check `isAdminAuthenticated`)
3. Protected routes use admin password check before responding

---

## Important Notes for Agents
- **Spanish content**: UI text and docs are in Spanish; maintain consistency
- **Frontend framework**: No React/Vue/Angular; vanilla JS only
- **Database**: SQLite file-based; no migrations system (manual schema updates)
- **Authentication**: Admin authentication is client-side only; for production consider server-side auth
- **Images**: Stored as base64 in database (50MB limit set in express middleware)
- **CORS enabled**: Allows cross-origin requests from any domain
- **Static serving**: Express serves all files from project root; `__dirname` is the root

---

## Debugging Tips
- **Port conflicts**: If 3000 is in use, modify `PORT` variable in `server.js`
- **Database issues**: Delete `database.db` to reset; tables auto-create on startup
- **Admin access**: Check browser console localStorage for `admin_token` and `admin_password`
- **Image upload failures**: Check if base64 data exceeds 50MB limit in middleware
- **API errors**: Check browser Network tab; server returns detailed error messages in JSON

---

## Related Documentation
See [SETUP.md](SETUP.md) for complete installation steps and database structure details.
