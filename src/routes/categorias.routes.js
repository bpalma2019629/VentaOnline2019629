const express = require('express');
const categoriaController = require('../controllers/categorias.controller');
const md_autenticacion = require('../middlewares/autenticacion');

var api= express.Router();

api.get('/obtenerCategorias',md_autenticacion.Auth, categoriaController.verCategorias);
api.post('/agregarCategoria',md_autenticacion.Auth,categoriaController.agregarCategoria);
api.put('/editarCategoria/:idCategoria',md_autenticacion.Auth,categoriaController.editarCategoria);
api.delete('/eliminarCategoria/:idCategoria',md_autenticacion.Auth,categoriaController.eliminarCategoria);

module.exports = api;