const express = require('express');
const productosController = require('../controllers/productos.controller');
const md_autenticacion = require('../middlewares/autenticacion');

var api= express.Router();

api.get('/verProductos',md_autenticacion.Auth, productosController.verProductos);
api.get('/verStock',md_autenticacion.Auth, productosController.verStock);
api.get('/obtenerProductosPorNombre',md_autenticacion.Auth, productosController.buscarPorNombre);
api.get('/obtenerProductosPorCategorias',md_autenticacion.Auth, productosController.buscarPorCategoria);
api.post('/agregarProducto',md_autenticacion.Auth,productosController.agregarProducto);
api.put('/editarProducto/:idProducto',md_autenticacion.Auth,productosController.editarProducto);
api.put('/editarStock/:idProducto',md_autenticacion.Auth,productosController.editarStock);
api.delete('/eliminarProducto/:idProducto',md_autenticacion.Auth,productosController.eliminarProducto);

module.exports = api;