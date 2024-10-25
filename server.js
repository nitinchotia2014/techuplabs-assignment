const express = require("express");
const multer = require("multer");
const sqlite3 = require("sqlite3").verbose();
const app = express();

// Connect to SQLite database
const db = new sqlite3.Database("./images.db", (err) => {
  if (err) {
    console.error("Error opening database", err);
  } else {
    console.log("Connected to the SQLite database.");
    db.run(`CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      data BLOB
    )`);
  }
});

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const { originalname, buffer } = req.file;

  db.run(
    "INSERT INTO images (name, data) VALUES (?, ?)",
    [originalname, buffer],
    function (err) {
      if (err) {
        console.error("Error saving image to database", err);
        return res.status(500).send("Error saving image");
      }
      res.send({ id: this.lastID });
    }
  );
});

// Endpoint to retrieve an image
app.get("/api/image/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM images WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error("Error retrieving image", err);
      return res.status(500).send("Error retrieving image");
    }
    if (!row) {
      return res.status(404).send("Image not found");
    }
    res.contentType("image/jpeg"); // Adjust content type as needed
    res.send(row.data);
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
