const express = require('express');
const cors = require('cors');
var app = express();

const UsuarioRutas = require('./src/routes/usuarios.routes');
const CategoriasRutas = require('./src/routes/categorias.routes');
const ProductosRutas = require('./src/routes/productos.routes');
const FacturasRutas = require('./src/routes/factura.routes')


app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(cors());

app.use('/api', UsuarioRutas, CategoriasRutas, ProductosRutas, FacturasRutas);

module.exports = app;