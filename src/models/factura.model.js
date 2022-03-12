const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FacturasSchema = Schema({
    idUsuario: {type: Schema.Types.ObjectId, ref:'usuarios'},
    productos:[{
        nombreProducto: String,
        cantidad:Number,
        precioUnitario:Number,
        subTotal:Number
    }],
    total:Number
});

module.exports = mongoose.model('facturas', FacturasSchema);