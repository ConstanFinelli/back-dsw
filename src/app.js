import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

let categorias = [];
//crear categoria
app.post('/categorias', (req, res) => {
  const { id, descripcion, tipoUsuario } = req.body;

  if (!id || !descripcion || !tipoUsuario) {
    return res.status(400).json({ mensaje: 'Faltan datos' });
  }

  const exists = categories.find(cat => cat.id === id);
  if (exists) {
    return res.status(409).json({ mensaje: 'ID ya registrado' });
  }

  const nuevaCategoria = { id, descripcion, tipoUsuario };
  categorias.push(nuevaCategoria);
  res.status(201).json(nuevaCategoria);
});

// Verificar si ya existe
  const existe = categorias.find(cat => cat.id === id);
  if (existe) {
    return res.status(409).json({ mensaje: 'La categoría ya existe' });
  }

  const nuevaCategoria = { id, descripcion, tipoUsuario };
  categorias.push(nuevaCategoria);
  res.status(201).json(nuevaCategoria);

  // Obtener todas las categorías
app.get('/categorias', (req, res) => {
  res.json(categorias);
});
 // Obtener una categoría por ID
app.get('/categorias/:id', (req, res) => {
  const categoria = categorias.find(cat => cat.id === req.params.id);
  if (!categoria) {
    return res.status(404).json({ mensaje: 'Categoría no encontrada' });
  }
  res.json(categoria);
});

// Actualizar una categoría
app.put('/categorias/:id', (req, res) => {
  const { descripcion, tipoUsuario } = req.body;
  const categoria = categorias.find(cat => cat.id === req.params.id);

  if (!categoria) {
    return res.status(404).json({ mensaje: 'Categoría no encontrada' });
  }

  if (description) categoria.descripcion = descripcion;
  if (usertype) categoria.tipoUsuario = tipoUsuario;

  res.json(categoria);
});

// Eliminar una categoría
app.delete('/categories/:id', (req, res) => {
  const index = categories.findIndex(cat => cat.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ mensaje: 'Categoría no encontrada' });
  }
  categorias.splice(index, 1);
  res.status(204).send();
});


app.listen(3000, () => {
  console.log('Servidor escuchando en http://localhost:3000');
});



