const Usuarios = require('../models/usuarios.model');
const Productos = require('../models/productos.model');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');
const md_autenticacion = require('../middlewares/autenticacion');

//Login

function Login(req, res){
    var parametros = req.body;

    Usuarios.findOne({usuario: parametros.usuario}, (err, usuarioEncontrado) =>{
        if(err) return res.status(500).send({mensaje:"Error en la peticion"});
        if(usuarioEncontrado){
            bcrypt.compare(parametros.password, usuarioEncontrado.password, (err, verificacionPassword)=>{
                if(verificacionPassword){
                    if(parametros.obtenerToken === 'true'){
                        return res.status(200).send({token: jwt.crearToken(usuarioEncontrado)})
                    }else{
                        usuarioEncontrado.password = undefined;
                        return res.status(200).send({usuario: usuarioEncontrado})
                    }
                }else{
                    return res.status(500).send({mensaje: 'la pasword no coincide'})
                }
            })

        }else{
            return res.status(500).send({mensaje:"Error, usuario no se encuentra registrado"})
        }
    })
}

//Registrar

function UsuarioInicial(){
    var usuariosModels = new Usuarios();

        usuariosModels.nombre = 'Administrador';
        usuariosModels.usuario = 'ADMIN';
        usuariosModels.rol = 'Rol_Admin';

        Usuarios.find((err, usuarioEncontrado)=> {
            if(usuarioEncontrado.length == 0){

                bcrypt.hash('123456', null, null, (err, paswordEncriptada)=>{
                    usuariosModels.password = paswordEncriptada;
                });
                usuariosModels.save()
            }
        })
}


function RegistrarCliente(req, res){
    var parametros = req.body;
    var usuariosModels = new Usuarios();

    if(parametros.nombre,parametros.usuario, parametros.password){
        usuariosModels.nombre = parametros.nombre;
        usuariosModels.usuario = parametros.usuario;
        usuariosModels.rol = "Rol_Cliente";
        usuariosModels.totalCarrito = 0;

        Usuarios.find({usuario: parametros.usuario}, (err, usuarioEncontrado)=> {
            if(usuarioEncontrado.length == 0){

                bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada)=>{
                    usuariosModels.password = passwordEncriptada;
                });
                usuariosModels.save((err, usuarioGuardado)=>{
                    if(err) return res.status(500).send({mensaje:"Error en la peticion"});
                    if(!usuarioGuardado) return res.status(400).send({mensaje:"Error al agregar el usuario"});
                    return res.status(200).send({usuario: usuarioGuardado});
                })
            } else {
                return res.status(500).send({mensaje: 'Este usuario ya se encuentra utilizado'})
            }
        })
    }
}

function agregarUsuario(req, res){
    var parametros = req.body;
    var usuariosModels = new Usuarios();

    if(req.user.rol == 'Rol_Admin'){
        if(parametros.nombre,parametros.usuario, parametros.password, parametros.rol){
            usuariosModels.nombre = parametros.nombre;
            usuariosModels.usuario = parametros.usuario;
            usuariosModels.rol = parametros.rol;
    
            Usuarios.find({usuario: parametros.usuario}, (err, usuarioEncontrado)=> {
                if(usuarioEncontrado.length == 0){
    
                    bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada)=>{
                        usuariosModels.password = passwordEncriptada;
                    });
                    usuariosModels.save((err, usuarioGuardado)=>{
                        if(err) return res.status(500).send({mensaje:"Error en la peticion"});
                        if(!usuarioGuardado) return res.status(400).send({mensaje:"Error al agregar el usuario"});
                        return res.status(200).send({usuario: usuarioGuardado});
                    })
                } else {
                    return res.status(500).send({mensaje: 'Este usuario ya se encuentra utilizado'})
                }
            })
        }
    }else{
        return res.status(500).send({ mensaje: "No esta Autorizado para crear un Usuario" });
    }
}

//Editar
function EditarCliente(req,res){
    var idUser = req.params.idUsuario;
    var parametros = req.body;

    if(req.user.rol == 'Rol_Admin' || idUser === req.user.sub){
        Usuarios.findById(idUser, (err, usuarioEncontrado)=>{
            if(usuarioEncontrado.rol == 'Rol_Cliente' && req.user.sub ===idUser){
                parametros.rol = 'Rol_Cliente';
                Usuarios.findByIdAndUpdate(idUser, parametros,{new:true}, (err, usuarioEditado) =>{
                    if (err) return res.status(500).send({mensaje:'Error en la peticion'});
                    if (!usuarioEditado) return res.status(404).send({mensaje: 'Error al Editar el usuario'})
                    return res.status(200).send({usuario: usuarioEditado});
                })
            }else if(usuarioEncontrado.rol=='Rol_Cliente' && req.user.rol=='Rol_Admin'){
                Usuarios.findByIdAndUpdate(idUser, parametros,{new:true}, (err, usuarioEditado) =>{
                    if (err) return res.status(500).send({mensaje:'Error en la peticion'});
                    if (!usuarioEditado) return res.status(404).send({mensaje: 'Error al Editar el usuario'})
                    return res.status(200).send({usuario: usuarioEditado});
                })
            }else{
                return res.status(500).send({mensaje: 'no esta autorizado para editar'});
            }
        })
    }else{
        return res.status(500).send({mensaje: 'no esta autorizado para editar'});
    }
}

//Eliminar
function EliminarCliente(req,res){
    var idUser = req.params.idUsuario;
    if(idUser === req.user.sub || req.user.rol == 'Rol_Admin'){
        Usuarios.findById(idUser, (err, usuarioEncontrado)=>{
            if(usuarioEncontrado.rol == 'Rol_Cliente' && req.user.sub ===idUser){
                Usuarios.findByIdAndDelete(idUser, (err, usuarioEliminado) =>{
                    if (err) return res.status(500).send({mensaje:'Error en la peticion'});
                    if (!usuarioEliminado) return res.status(404).send({mensaje: 'Error al Eliminar el usuario'})
                    return res.status(200).send({Usuario: usuarioEliminado});
                })
            }else if(usuarioEncontrado.rol=='Rol_Cliente' && req.user.rol=='Rol_Admin'){
                Usuarios.findByIdAndDelete(idUser, (err, usuarioEliminado) =>{
                    if (err) return res.status(500).send({mensaje:'Error en la peticion'});
                    if (!usuarioEliminado) return res.status(404).send({mensaje: 'Error al Eliminar el usuario'})
                    return res.status(200).send({Usuario: usuarioEliminado});
                })
            }else{
                return res.status(500).send({mensaje: 'no esta autorizado para Eliminar'});
            }
        })
    }else{
        return res.status(500).send({mensaje: 'No esta autorizado para eliminar'});
    } 
}

//Agregar a carrito
function agregarProductoCarrito(req,res){
    const parametros = req.body;
    var totalCarritoLocal = 0;
    var cantidadLocal = 0;

    if (req.user.rol == 'Rol_Cliente') {
        Productos.findOne({producto: parametros.nombreProducto}, (err, productoEncontrado)=>{
            if(err) return res.status(404).send({mensaje: 'Eror en la peticion'});
            if(!productoEncontrado) return res.status(500).send({mensaje:'Error al obtener el producto'});
            if(parametros.cantidad>productoEncontrado.stock){
                return res.status(500).send({ mensaje: "La cantidad solicitada supera el stock" });
            }else{
                Usuarios.findOne({_id:req.user.sub, carrito:{$elemMatch: {nombreProducto: parametros.nombreProducto}}}, (err, carritoExistente)=>{
                    if(err) return res.status(500).send({mensaje: "Error en la peticion"});
                    if(!carritoExistente){
                        Usuarios.findByIdAndUpdate(req.user.sub, { $push:{carrito:{nombreProducto: parametros.nombreProducto,
                            cantidad: parametros.cantidad, precioUnitario: productoEncontrado.precio,subTotal:productoEncontrado.precio*parametros.cantidad}}}, {new: true},
                            (err, usuarioActualizado)=>{
                                if(err) return res.status(404).send({mensaje: 'Eror en la peticion del Usuario'});
                                if(!usuarioActualizado) return res.status(500).send({mensaje:'Error al agregar un poroducto al carrito'});
                    
                    
                                for(let i=0; i<usuarioActualizado.carrito.length; i++){
                                    totalCarritoLocal += usuarioActualizado.carrito[i].subTotal;
                                }
                        
                                Usuarios.findByIdAndUpdate(req.user.sub, {totalCarrito: totalCarritoLocal},{new:true},
                                    (err, totalActualizado)=>{
                                        if(err) return res.status(500).send({mensaje:'Error en la peticion de total Carrito'});
                                        if(!totalActualizado) return res.status(500).send({mensaje: 'Error al modificar el total del carrito'});
                                        return res.status(200).send({usuario: totalActualizado});
                                    })
                        })
                    }else{
                        for(let i=0; i<carritoExistente.carrito.length; i++){
                            if(carritoExistente.carrito[i].nombreProducto == parametros.nombreProducto){
                            cantidadLocal= Number(carritoExistente.carrito[i].cantidad)+Number(parametros.cantidad); 
                            if(cantidadLocal<=productoEncontrado.stock){
                                Usuarios.findOneAndUpdate({carrito:{$elemMatch:{_id:carritoExistente.carrito[i]._id}}},{$inc:{'carrito.$.cantidad':parametros.cantidad},'carrito.$.subTotal':cantidadLocal*productoEncontrado.precio}, {new: true},
                                    (err, usuarioEditado)=>{
                                        if(err) return res.status(404).send({mensaje: 'Eror en la peticion del Usuario'});
                                        if(!usuarioEditado) return res.status(500).send({mensaje:'Error al actualizar el carrito'});
                            
                    
                                        for(let i=0; i<usuarioEditado.carrito.length; i++){
                                            totalCarritoLocal += usuarioEditado.carrito[i].subTotal;
                                        }
                                
                                        Usuarios.findByIdAndUpdate(req.user.sub, {totalCarrito: totalCarritoLocal},{new:true},
                                            (err, totalEditado)=>{
                                                if(err) return res.status(500).send({mensaje:'Error en la peticion de total Carrito'});
                                                if(!totalEditado) return res.status(500).send({mensaje: 'Error al modificar el total del carrito'});
                                                return res.status(200).send({usuario: totalEditado});
                                            })
                                })
                            }else{
                                return res.status(500).send({mensaje: 'La cantidad solicitada supera el stock'});
                            }
                            }else{
                                
                            }
                        }
                    }
                })
            }
        })
    } else {
        return res.status(500).send({ mensaje: "No esta Autorizado para eliminar un producto" });
    }
}


//Exports
module.exports={
    EditarCliente,
    EliminarCliente,
    Login,
    RegistrarCliente,
    UsuarioInicial,
    agregarUsuario,
    agregarProductoCarrito
}

