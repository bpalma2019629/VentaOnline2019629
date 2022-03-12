const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductosSchema = Schema({
    producto: String,
    precio: Number,
    categoria: {type: Schema.Types.ObjectId, ref:'categorias'},
    stock:Number,
    vendidos:Number
});

module.exports = mongoose.model('productos', ProductosSchema);