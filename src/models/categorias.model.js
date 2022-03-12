const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategoriasSchema = Schema({
    categoria: String,
    descripcion: String
});

module.exports = mongoose.model('categorias', CategoriasSchema);