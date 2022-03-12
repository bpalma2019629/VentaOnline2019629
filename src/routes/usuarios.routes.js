const express = require('express');
const usuariosController = require('../controllers/usuarios.controller');
const md_autenticacion = require('../middlewares/autenticacion');

var api= express.Router();

api.post('/login', usuariosController.Login);
api.post('/registrarCliente', usuariosController.RegistrarCliente);
api.post('/agregarUsuario',md_autenticacion.Auth,usuariosController.agregarUsuario);
api.put('/agregarProductoCarrito',md_autenticacion.Auth,usuariosController.agregarProductoCarrito);
api.put('/editarUsuario/:idUsuario',md_autenticacion.Auth,usuariosController.EditarCliente);
api.delete('/eliminarUsuario/:idUsuario',md_autenticacion.Auth,usuariosController.EliminarCliente);

module.exports = api;