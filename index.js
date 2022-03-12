const mongoose = require('mongoose');
const app = require ('./app');
const usuariosController = require('./src/controllers/usuarios.controller');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/VentaOnline2019629',
{useNewUrlParser: true, useUnifiedTopology:true}).then(()=>{
 console.log('Se establecio conexion con la base de datos');
 app.listen(3000, function(){
     console.log('el control se esta ejecutando en el puerto 3000');
     usuariosController.UsuarioInicial();
 });   
}).catch(er => console.log(err));