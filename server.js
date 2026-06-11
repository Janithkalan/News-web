// ============================================
//  NEWS WEBSITE - SERVER.JS
//  Simple Express + SQLite Backend
// ============================================

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3001;

// ---- Middleware ----
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ---- Multer for image uploads ----
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ---- SQLite Database Setup ----
const db = new sqlite3.Database(path.join(__dirname, 'newsdb.sqlite'));

// Helper: run a query that returns rows
function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err); else resolve(rows);
    });
  });
}

// Helper: run a query that returns one row
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err); else resolve(row);
    });
  });
}

// Helper: run INSERT/UPDATE/DELETE
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err); else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

// ---- Create Tables ----
db.serialize(async () => {
  await dbRun(`CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    image TEXT DEFAULT 'default.jpg',
    author TEXT NOT NULL,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_featured INTEGER DEFAULT 0
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#e74c3c'
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read INTEGER DEFAULT 0
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )`);

  // Seed categories
  const catCount = await dbGet('SELECT COUNT(*) as cnt FROM categories');
  if (catCount.cnt === 0) {
    await dbRun("INSERT INTO categories (name, color) VALUES ('Politics', '#e74c3c')");
    await dbRun("INSERT INTO categories (name, color) VALUES ('Sports', '#27ae60')");
    await dbRun("INSERT INTO categories (name, color) VALUES ('Technology', '#2980b9')");
    await dbRun("INSERT INTO categories (name, color) VALUES ('Business', '#f39c12')");
    await dbRun("INSERT INTO categories (name, color) VALUES ('Entertainment', '#8e44ad')");
    await dbRun("INSERT INTO categories (name, color) VALUES ('Health', '#16a085')");
  }

  // Seed admin user
  const adminCount = await dbGet('SELECT COUNT(*) as cnt FROM admin_users');
  if (adminCount.cnt === 0) {
    await dbRun("INSERT INTO admin_users (username, password) VALUES ('admin', 'admin123')");
  }

  // Seed sample articles
  const articleCount = await dbGet('SELECT COUNT(*) as cnt FROM articles');
  if (articleCount.cnt === 0) {
    await dbRun(`INSERT INTO articles (title, category, content, image, author, is_featured) VALUES (?, ?, ?, ?, ?, ?)`,
      ['Sri Lankan Parliament Passes Historic Port City Economic Reforms', 'Politics', 'The Parliament of Sri Lanka has passed a key piece of legislation aiming to transform Port City Colombo into a leading international financial hub in South Asia. The bill, supported by a significant majority, establishes a simplified regulatory framework and special tax incentives to attract Foreign Direct Investment (FDI) over the next decade. Economists predict that this project will create over 80,000 high-value jobs in technology, banking, and maritime logistics, cementing Sri Lanka\'s position as a major maritime gateway.', 'port_city.png', 'Anura Senanayake', 1]);
    await dbRun(`INSERT INTO articles (title, category, content, image, author, is_featured) VALUES (?, ?, ?, ?, ?, ?)`,
      ['Sri Lanka Cricket Triumphs in Thrilling Asia Cup Final at R. Premadasa Stadium', 'Sports', 'Before a roaring capacity crowd at the R. Premadasa Stadium in Colombo, Sri Lanka\'s national cricket team clinched the Asia Cup title with a spectacular 45-run victory. Batting first, the home side set a challenging target of 285 runs, anchored by a magnificent century by the captain. The spinners then dominated the second innings, bowling out the opponents with two overs to spare. Thousands of jubilant fans took to the streets across Colombo, Galle, and Kandy to celebrate this historic victory, which marks Sri Lanka\'s third consecutive Asia Cup title.', 'cricket_victory.png', 'Roshan Silva', 1]);
    await dbRun(`INSERT INTO articles (title, category, content, image, author, is_featured) VALUES (?, ?, ?, ?, ?, ?)`,
      ['Colombo Tech Summit Showcases Emerging Sri Lankan AI Startups', 'Technology', 'The annual Colombo Tech Summit concluded yesterday, showcasing some of the country\'s most promising startups. Sponsored by the Information and Communication Technology Agency (ICTA), the event highlighted innovative artificial intelligence solutions designed specifically for agricultural logistics and healthcare diagnostics in the South Asian region. One standout startup from the University of Moratuwa introduced an AI-powered system that helps tea plantation managers optimize harvesting cycles using satellite imagery, attracting major investment interest from global venture firms.', 'colombo_tech.png', 'Dilshan Perera', 0]);
    await dbRun(`INSERT INTO articles (title, category, content, image, author, is_featured) VALUES (?, ?, ?, ?, ?, ?)`,
      ['Ceylon Tea Exports Surge to Record Highs Amid Strong Global Demand', 'Business', 'Sri Lanka\'s tea industry is celebrating a remarkable quarter, with Ceylon Tea exports reaching a record high in export earnings. According to the Sri Lanka Tea Board, increased demand from the Middle East, Central Asia, and Europe, combined with favorable weather conditions in the central hills, led to a 15% increase in export volumes. The boost in revenue is expected to stabilize the Sri Lankan Rupee and provide crucial support to local estate communities, highlighting the resilience of Sri Lanka\'s agricultural sector.', 'ceylon_tea.png', 'Suresh Jayawardene', 0]);
    await dbRun(`INSERT INTO articles (title, category, content, image, author, is_featured) VALUES (?, ?, ?, ?, ?, ?)`,
      ['Award-Winning Sri Lankan Film \'Dharani\' Breaks Local Box Office Records', 'Entertainment', 'The critically acclaimed Sri Lankan drama \'Dharani,\' directed by one of the country\'s leading independent filmmakers, has shattered local box office records within its first two weeks of release. Shot entirely in the scenic landscapes of Ella and Ella Rock, the film explores themes of family heritage, rural migration, and modernization. Audiences and critics alike have praised the film\'s spectacular cinematography, authentic soundtrack, and powerful performances by a stellar Sri Lankan cast, prompting international distributors to acquire distribution rights for the European and Australian markets.', 'dharani_film.png', 'Thilini Fernando', 0]);
    await dbRun(`INSERT INTO articles (title, category, content, image, author, is_featured) VALUES (?, ?, ?, ?, ?, ?)`,
      ['Sri Lanka Expands Wildlife Conservation Buffer in Minneriya National Park', 'Health', 'The Department of Wildlife Conservation has announced a new initiative to expand the conservation buffer zones around Minneriya National Park, famous for \'The Gathering\' of wild Asian elephants. The project aims to mitigate the long-standing human-elephant conflict in the surrounding villages by installing smart solar fences and creating dedicated wildlife corridors. Eco-tourism operators have welcomed the decision, stating that protecting these natural habitats is essential for Sri Lanka\'s long-term sustainability goals and biodiversity conservation.', 'minneriya.png', 'Priyani Cooray', 0]);
  }

  console.log('\n ✅ Database ready.');
});

// ============================================
//  API ROUTES
// ============================================

// --- ARTICLES ---
// READ ALL
app.get('/api/articles', async (req, res) => {
  try {
    const { category, featured } = req.query;
    let query = 'SELECT * FROM articles';
    const params = [];
    const conditions = [];
    if (category) { conditions.push('category = ?'); params.push(category); }
    if (featured === '1') { conditions.push('is_featured = 1'); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY published_at DESC';
    const articles = await dbAll(query, params);
    res.json(articles);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// READ SINGLE
app.get('/api/articles/:id', async (req, res) => {
  try {
    const article = await dbGet('SELECT * FROM articles WHERE id = ?', [req.params.id]);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// CREATE - INSERT (DML)
app.post('/api/articles', upload.single('image'), async (req, res) => {
  try {
    const { title, category, content, author, is_featured } = req.body;
    const image = req.file ? req.file.filename : 'default.jpg';
    if (!title || !category || !content || !author) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const result = await dbRun(
      'INSERT INTO articles (title, category, content, image, author, is_featured) VALUES (?, ?, ?, ?, ?, ?)',
      [title, category, content, image, author, is_featured === 'on' ? 1 : 0]
    );
    res.json({ success: true, id: result.lastID, message: 'Article created successfully' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// UPDATE (DML)
app.put('/api/articles/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, category, content, author, is_featured } = req.body;
    const existing = await dbGet('SELECT * FROM articles WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Article not found' });
    const image = req.file ? req.file.filename : existing.image;
    await dbRun(
      'UPDATE articles SET title=?, category=?, content=?, image=?, author=?, is_featured=? WHERE id=?',
      [title, category, content, image, author, is_featured === 'on' ? 1 : 0, req.params.id]
    );
    res.json({ success: true, message: 'Article updated successfully' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// DELETE (DML)
app.delete('/api/articles/:id', async (req, res) => {
  try {
    const existing = await dbGet('SELECT * FROM articles WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Article not found' });
    await dbRun('DELETE FROM articles WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Article deleted successfully' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// --- CATEGORIES ---
app.get('/api/categories', async (req, res) => {
  try {
    const cats = await dbAll('SELECT * FROM categories');
    res.json(cats);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// --- CONTACTS ---
// CREATE (INSERT - DML)
app.post('/api/contacts', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const result = await dbRun(
      'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name, email, subject, message]
    );
    res.json({ success: true, id: result.lastID, message: 'Message sent successfully!' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// READ all contacts (admin)
app.get('/api/contacts', async (req, res) => {
  try {
    const msgs = await dbAll('SELECT * FROM contacts ORDER BY received_at DESC');
    res.json(msgs);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Mark as read (UPDATE - DML)
app.put('/api/contacts/:id/read', async (req, res) => {
  try {
    await dbRun('UPDATE contacts SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Marked as read' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Delete contact (DELETE - DML)
app.delete('/api/contacts/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM contacts WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// --- ADMIN LOGIN ---
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await dbGet(
      'SELECT * FROM admin_users WHERE username = ? AND password = ?',
      [username, password]
    );
    if (!user) return res.status(401).json({ error: 'Invalid username or password' });
    res.json({ success: true, message: 'Login successful', username: user.username });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// --- Stats ---
app.get('/api/stats', async (req, res) => {
  try {
    const totalArticles = (await dbGet('SELECT COUNT(*) as cnt FROM articles')).cnt;
    const totalMessages = (await dbGet('SELECT COUNT(*) as cnt FROM contacts')).cnt;
    const unreadMessages = (await dbGet('SELECT COUNT(*) as cnt FROM contacts WHERE is_read = 0')).cnt;
    const categories = await dbAll('SELECT category, COUNT(*) as cnt FROM articles GROUP BY category');
    res.json({ totalArticles, totalMessages, unreadMessages, categories });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ---- Serve HTML pages ----
const pages = ['index', 'news', 'about', 'contact', 'admin', 'article'];
pages.forEach(page => {
  app.get(`/${page === 'index' ? '' : page}`, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', `${page}.html`));
  });
});

app.listen(PORT, () => {
  console.log(`\n ✅ News Website running at: http://localhost:${PORT}`);
  console.log(` 📰 Admin Panel: http://localhost:${PORT}/admin`);
  console.log(` 🔑 Admin Login: username=admin | password=admin123\n`);
});
