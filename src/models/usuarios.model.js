const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UsuariosSchema = Schema({
    nombre: String,
    usuario: String,
    password:String,
    rol:String,
    carrito:[{
        nombreProducto: String,
        cantidad:Number,
        precioUnitario:Number,
        subTotal:Number
    }],
    totalCarrito:Number
});

module.exports = mongoose.model('usuarios', UsuariosSchema);