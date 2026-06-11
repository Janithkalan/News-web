# 📰 DailyNews - News Website

A simple news website built as a 1st year coursework project.

## Features

- **4 Main Pages**: Home, News, About, Contact
- **Admin Panel** with full CRUD operations
- **SQLite Database** with DML operations (INSERT, SELECT, UPDATE, DELETE)
- **Responsive Design** - works on mobile and desktop

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Featured news, latest articles, sidebar |
| News | `/news` | All articles with category filter |
| About | `/about` | About the organization, team, stats |
| Contact | `/contact` | Contact form, FAQ |
| Admin | `/admin` | Admin panel (login required) |

## Database (SQLite)

Tables: `articles`, `categories`, `contacts`, `admin_users`

DML Operations used:
- **INSERT** – Add new articles, contact messages
- **SELECT** – View all articles, messages, stats
- **UPDATE** – Edit articles, mark messages as read
- **DELETE** – Delete articles and messages

## How to Run

```bash
# Install dependencies
npm install

# Start the server
npm start
```

Then open: http://localhost:3000

## Admin Login

- **URL**: http://localhost:3000/admin
- **Username**: `admin`
- **Password**: `admin123`

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js + Express
- **Database**: SQLite (via better-sqlite3)
- **File Uploads**: Multer

<!-- commit iteration 1 -->

<!-- commit iteration 2 -->

<!-- commit iteration 3 -->

<!-- commit iteration 4 -->

<!-- commit iteration 5 -->
