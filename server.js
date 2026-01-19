"use strict";

const path = require("path");
const fs = require("fs");
const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "pos.db");
const CONFIG_PATH = path.join(__dirname, "config.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS tables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      opened_at TEXT NOT NULL,
      closed_at TEXT,
      total REAL NOT NULL DEFAULT 0,
      FOREIGN KEY(table_id) REFERENCES tables(id)
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      qty INTEGER NOT NULL,
      price REAL NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      unit TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS recipe_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      ingredient_id INTEGER NOT NULL,
      qty REAL NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(product_id) REFERENCES products(id),
      FOREIGN KEY(ingredient_id) REFERENCES ingredients(id)
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS stocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ingredient_id INTEGER NOT NULL UNIQUE,
      qty REAL NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(ingredient_id) REFERENCES ingredients(id)
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      method TEXT NOT NULL,
      amount REAL NOT NULL,
      paid_at TEXT NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id)
    )`
  );
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const now = () => new Date().toISOString();

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: now() });
});

app.post("/api/admin/login", (req, res) => {
  const { password } = req.body || {};
  if (password === config.adminPassword) {
    return res.json({ ok: true });
  }
  return res.status(401).json({ ok: false, message: "Şifre hatalı" });
});

app.get("/api/tables", (_req, res) => {
  const sql = `
    SELECT t.*, o.id as open_order_id, o.total as open_total
    FROM tables t
    LEFT JOIN orders o
      ON o.table_id = t.id AND o.status = 'open'
    ORDER BY t.name ASC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/tables", (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: "Masa adı gerekli" });
  db.run(
    "INSERT INTO tables (name, created_at) VALUES (?, ?)",
    [name, now()],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name });
    }
  );
});

app.delete("/api/tables/:id", (req, res) => {
  db.run("DELETE FROM tables WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

app.get("/api/products", (_req, res) => {
  db.all("SELECT * FROM products WHERE active = 1 ORDER BY name ASC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/products", (req, res) => {
  const { name, price } = req.body || {};
  if (!name || price == null) return res.status(400).json({ error: "Ürün adı ve fiyat gerekli" });
  db.run(
    "INSERT INTO products (name, price, created_at) VALUES (?, ?, ?)",
    [name, price, now()],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, price });
    }
  );
});

app.delete("/api/products/:id", (req, res) => {
  db.run("UPDATE products SET active = 0 WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

app.get("/api/orders", (req, res) => {
  const status = req.query.status || "open";
  db.all(
    "SELECT * FROM orders WHERE status = ? ORDER BY opened_at DESC",
    [status],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.post("/api/orders", (req, res) => {
  const { table_id } = req.body || {};
  if (!table_id) return res.status(400).json({ error: "table_id gerekli" });

  db.get(
    "SELECT * FROM orders WHERE table_id = ? AND status = 'open'",
    [table_id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (row) return res.json(row);

      db.run(
        "INSERT INTO orders (table_id, status, opened_at, total) VALUES (?, 'open', ?, 0)",
        [table_id, now()],
        function (err2) {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ id: this.lastID, table_id, status: "open" });
        }
      );
    }
  );
});

app.get("/api/orders/:id/items", (req, res) => {
  const sql = `
    SELECT oi.*, p.name as product_name
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
    ORDER BY oi.id DESC
  `;
  db.all(sql, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/orders/:id/items", (req, res) => {
  const { product_id, qty } = req.body || {};
  const orderId = req.params.id;
  if (!product_id || !qty) return res.status(400).json({ error: "product_id ve qty gerekli" });

  db.get("SELECT price FROM products WHERE id = ?", [product_id], (err, product) => {
    if (err || !product) return res.status(400).json({ error: "Ürün bulunamadı" });
    const price = product.price;

    db.run(
      "INSERT INTO order_items (order_id, product_id, qty, price, created_at) VALUES (?, ?, ?, ?, ?)",
      [orderId, product_id, qty, price, now()],
      function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });

        db.run(
          "UPDATE orders SET total = total + ? WHERE id = ?",
          [price * qty, orderId],
          (err3) => {
            if (err3) return res.status(500).json({ error: err3.message });
            res.json({ id: this.lastID });
          }
        );
      }
    );
  });
});

app.delete("/api/orders/:orderId/items/:itemId", (req, res) => {
  const { orderId, itemId } = req.params;
  db.get("SELECT qty, price FROM order_items WHERE id = ?", [itemId], (err, item) => {
    if (err || !item) return res.status(404).json({ error: "Kalem bulunamadı" });

    db.run("DELETE FROM order_items WHERE id = ?", [itemId], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      db.run(
        "UPDATE orders SET total = total - ? WHERE id = ?",
        [item.qty * item.price, orderId],
        (err3) => {
          if (err3) return res.status(500).json({ error: err3.message });
          res.json({ ok: true });
        }
      );
    });
  });
});

app.post("/api/orders/:id/payments", (req, res) => {
  const { method, amount } = req.body || {};
  if (!method || !amount) return res.status(400).json({ error: "method ve amount gerekli" });

  db.run(
    "INSERT INTO payments (order_id, method, amount, paid_at) VALUES (?, ?, ?, ?)",
    [req.params.id, method, amount, now()],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.post("/api/orders/:id/close", (req, res) => {
  db.run(
    "UPDATE orders SET status = 'closed', closed_at = ? WHERE id = ?",
    [now(), req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ ok: true });
    }
  );
});

app.get("/api/reports/summary", (req, res) => {
  const from = req.query.from;
  const to = req.query.to;
  if (!from || !to) return res.status(400).json({ error: "from ve to gerekli" });
  const sql = `
    SELECT
      COUNT(DISTINCT o.id) as order_count,
      SUM(p.amount) as total_revenue
    FROM orders o
    JOIN payments p ON p.order_id = o.id
    WHERE date(p.paid_at) BETWEEN date(?) AND date(?)
  `;
  db.get(sql, [from, to], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

app.get("/api/reports/products", (req, res) => {
  const from = req.query.from;
  const to = req.query.to;
  if (!from || !to) return res.status(400).json({ error: "from ve to gerekli" });
  const sql = `
    SELECT p.name, SUM(oi.qty) as qty, SUM(oi.qty * oi.price) as revenue
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    JOIN orders o ON o.id = oi.order_id
    WHERE o.status = 'closed' AND date(o.closed_at) BETWEEN date(?) AND date(?)
    GROUP BY p.id
    ORDER BY revenue DESC
  `;
  db.all(sql, [from, to], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get("/api/ingredients", (_req, res) => {
  db.all("SELECT * FROM ingredients ORDER BY name ASC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/ingredients", (req, res) => {
  const { name, unit } = req.body || {};
  if (!name || !unit) return res.status(400).json({ error: "name ve unit gerekli" });
  db.run(
    "INSERT INTO ingredients (name, unit, created_at) VALUES (?, ?, ?)",
    [name, unit, now()],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.delete("/api/ingredients/:id", (req, res) => {
  db.run("DELETE FROM ingredients WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

app.get("/api/recipes/:productId", (req, res) => {
  const sql = `
    SELECT ri.*, i.name as ingredient_name, i.unit as ingredient_unit
    FROM recipe_items ri
    JOIN ingredients i ON i.id = ri.ingredient_id
    WHERE ri.product_id = ?
  `;
  db.all(sql, [req.params.productId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/recipes/:productId", (req, res) => {
  const { ingredient_id, qty } = req.body || {};
  if (!ingredient_id || !qty) return res.status(400).json({ error: "ingredient_id ve qty gerekli" });
  db.run(
    "INSERT INTO recipe_items (product_id, ingredient_id, qty, created_at) VALUES (?, ?, ?, ?)",
    [req.params.productId, ingredient_id, qty, now()],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.delete("/api/recipes/:productId/:id", (req, res) => {
  db.run("DELETE FROM recipe_items WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

app.get("/api/stocks", (_req, res) => {
  const sql = `
    SELECT s.*, i.name as ingredient_name, i.unit as ingredient_unit
    FROM stocks s
    JOIN ingredients i ON i.id = s.ingredient_id
    ORDER BY i.name ASC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/stocks", (req, res) => {
  const { ingredient_id, qty } = req.body || {};
  if (!ingredient_id || qty == null) return res.status(400).json({ error: "ingredient_id ve qty gerekli" });
  db.run(
    `INSERT INTO stocks (ingredient_id, qty, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(ingredient_id) DO UPDATE SET qty = excluded.qty, updated_at = excluded.updated_at`,
    [ingredient_id, qty, now()],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ ok: true });
    }
  );
});

app.listen(PORT, () => {
  console.log(`POS server running on http://localhost:${PORT}`);
});
