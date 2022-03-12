const express = require('express');
const facturasController = require('../controllers/factura.controller');
const md_autenticacion = require('../middlewares/autenticacion');

var api= express.Router();

api.post('/emitirFactura',md_autenticacion.Auth, facturasController.facturar);
api.get('/agotados',md_autenticacion.Auth, facturasController.productosAgotados);
api.get('/obtenerProductosMasVendidos',md_autenticacion.Auth, facturasController.buscarPorMasVendido);
api.get('/productosDeFactura/:idFactura',md_autenticacion.Auth, facturasController.productosDeUnaFactura);
api.get('/verFacturas',md_autenticacion.Auth, facturasController.verFacturas);
api.get('/verFacturasDeUsuario/:idUsuario',md_autenticacion.Auth, facturasController.verFacturasUsuario);

module.exports = api;