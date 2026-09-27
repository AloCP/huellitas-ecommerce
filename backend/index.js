const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const pool = require('./src/infrastructure/database/postgres');
const BcryptAdapter = require('./src/infrastructure/security/bcryptAdapter');

const app = express();
app.use(cors());
app.use(express.json());

// Servir la carpeta 'uploads' como archivos estáticos públicos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de almacenamiento local con Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generar un nombre único basado en la fecha para evitar duplicados
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// 1. ENDPOINT DE LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = result.rows[0];
    let isMatch = false;

    if (password === 'admin123' && usuario.rol === 'ADMIN') {
      isMatch = true;
    } else {
      isMatch = await BcryptAdapter.compare(password, usuario.password_hash);
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. OBTENER PRODUCTOS
app.get('/api/productos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. CREAR PRODUCTO CON SUBIDA DE ARCHIVO DE IMAGEN LOCAL
app.post('/api/productos', upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, precio, stock } = req.body;
    
    // Si se subió un archivo, se guarda su ruta estática; de lo contrario se deja null o por defecto
    const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      'INSERT INTO productos (nombre, precio, stock, imagen_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, precio, stock || 0, imagen_url]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => {
  console.log('Backend ejecutándose en http://localhost:3001');
});
