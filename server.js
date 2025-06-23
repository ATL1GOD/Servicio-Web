const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Configurar CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Middleware
app.use(bodyParser.json());

// Conexión a MySQL
const db = mysql.createConnection({
  user: 'root',
  password: 'Atl1God$',
  database: 'cineboletos',
  socketPath: '/cloudsql/white-option-462703-s8:us-central1:cine' 
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

// Ruta para obtener las películas
app.get('/peliculas', (req, res) => {
  db.query('SELECT * FROM peliculas', (err, result) => {
    if (err) {
      return res.status(500).send('Error al obtener las películas');
    }
    res.json(result);
  });
});

// Ruta para obtener las ventas realizadas
app.get('/ventas', (req, res) => {
  db.query('SELECT * FROM ventas', (err, result) => {
    if (err) {
      return res.status(500).send('Error al obtener las ventas');
    }
    res.json(result);
  });
});

// Ruta para limpiar las ventas en la base de datos
app.delete('/limpiarVentas', (req, res) => {
  db.query('DELETE FROM ventas', (err, result) => {
    if (err) {
      return res.status(500).send('Error al limpiar las ventas');
    }
    res.status(200).send('Historial de ventas limpio');
  });
});

/*
// Limpiar las ventas automáticamente cada 1 minuto
setInterval(() => {
  fetch('http://localhost:3000/limpiarVentas', {
    method: 'DELETE',
  })
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(error => console.error('Error al limpiar ventas en la base de datos:', error));
}, 60000);
*/

// Ruta para comprar boletos
app.post('/comprar', (req, res) => {
  const { nombre_cliente, cantidad, pelicula } = req.body;

  // Validar los datos recibidos
  if (!nombre_cliente || !cantidad || !pelicula) {
    return res.status(400).json({ error: 'Faltan datos necesarios' });
  }

  db.query('SELECT stock FROM peliculas WHERE nombre = ?', [pelicula], (err, result) => {
    if (err) {
      return res.status(500).send('Error al verificar los boletos');
    }

    const stockDisponible = result[0].stock;

    if (stockDisponible < cantidad) {
      return res.status(400).json({ error: 'No hay suficientes boletos disponibles' });
    }

    // Actualizar el stock de boletos
    db.query('UPDATE peliculas SET stock = stock - ? WHERE nombre = ?', [cantidad, pelicula], (err) => {
      if (err) {
        return res.status(500).send('Error al actualizar el stock');
      }

      // Guardar la venta
      db.query('INSERT INTO ventas (nombre_cliente, cantidad, pelicula) VALUES (?, ?, ?)', [nombre_cliente, cantidad, pelicula], (err) => {
        if (err) {
          return res.status(500).send('Error al registrar la venta');
        }
        res.status(200).json({ success: true });
      });
    });
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
