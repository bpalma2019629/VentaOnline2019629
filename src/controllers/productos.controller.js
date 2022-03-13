const Productos = require('../models/productos.model');
const Categorias = require('../models/categorias.model');

//agregar
function agregarProducto(req,res){
    var parametros = req.body;
    var productoModel = new Productos();

    if (req.user.rol == 'Rol_Admin') {
        if (parametros.producto, parametros.stock, parametros.categoria, parametros.precio) {
            productoModel.producto = parametros.producto;
            productoModel.stock = parametros.stock;
            productoModel.precio = parametros.precio;
            productoModel.vendidos = 0;
            Productos.find({producto: parametros.producto}, (err, productoEncontrado)=> {
                if(productoEncontrado.length == 0){
                    Categorias.find({categoria: parametros.categoria}, (err, categoriaEncontrada)=> {
                        if (!categoriaEncontrada) return res.status(400).send({ mensaje: "Error al encontrar la categoria" });
                        productoModel.categoria = categoriaEncontrada[0]._id;
        
                        productoModel.save((err, productoGuardado) => {
                            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
                            if (!productoGuardado) return res.status(400).send({ mensaje: "Error al agregar el producto" });
                            return res.status(200).send({ producto: productoGuardado });
                        })
                    })
                } else {
                    return res.status(500).send({mensaje: 'Este producto ya existe'})
                }
            })
        }else{
            return res.status(500).send({ mensaje: "Rellene todos los campos" });
        }
    } else {
        return res.status(500).send({ mensaje: "No esta Autorizado para crear un producto" });
    }
}

//editar
function editarProducto(req,res){
    var idProd = req.params.idProducto;
    var parametros = req.body;

    if (req.user.rol == 'Rol_Admin') {
        if(parametros.categoria){
            Categorias.find({categoria: parametros.categoria}, (err, categoriaEncontrada)=> {
                if (!categoriaEncontrada) return res.status(400).send({ mensaje: "Error al encontrar la categoria" });
                parametros.categoria = categoriaEncontrada[0]._id;
                Productos.findByIdAndUpdate(idProd, parametros ,{new:true}, (err, productoEditado) =>{
                    console.log(err);
                    if (err) return res.status(500).send({mensaje:'Error en la peticion'});
                    if (!productoEditado) return res.status(404).send({mensaje: 'Error al Editar el producto'})
                    return res.status(200).send({producto: productoEditado});
                })
            })
        }else{
            Productos.findByIdAndUpdate(idProd, parametros,{new:true}, (err, productoEditado) =>{
                if (err) return res.status(500).send({mensaje:'Error en la peticion'});
                if (!productoEditado) return res.status(404).send({mensaje: 'Error al Editar el producto'})
                return res.status(200).send({producto: productoEditado});
            })
        }
    } else {
        return res.status(500).send({ mensaje: "No esta Autorizado para editar un producto" });
    }

}

function editarStock(req,res){
    var idProd = req.params.idProducto;
    var parametros = req.body;
    if (req.user.rol == 'Rol_Admin') {
        Productos.findById(idProd, (err, productoEncontrado) => {
            if (!productoEncontrado) return res.status(404).send({mensaje: 'Error al obtener los datos'});
            if(parametros.stock<=0){
                if(Number(productoEncontrado.stock)+Number(parametros.stock)<0){
                    return res.status(500).send({mensaje:'El stock que desea quitar sobrepasa el actual'});
                }else{
                    Productos.findByIdAndUpdate(idProd, { $inc :{stock:parametros.stock}},{new: true},(err, productoActualizado)=>{
                        if(err) return res.status(404).send({mensaje: 'Error en la peticion'});
                        if(!productoActualizado) return res.status(500).send({mensaje:'Error al Editar el stock'});
        
                        return res.status(200).send({producto: productoActualizado});
                    })
                }
            }else{
                Productos.findByIdAndUpdate(idProd, { $inc :{stock:parametros.stock}},{new: true},(err, productoActualizado)=>{
                    if(err) return res.status(404).send({mensaje: 'Error en la peticion'});
                    if(!productoActualizado) return res.status(500).send({mensaje:'Error al Editar el stock'});
    
                    return res.status(200).send({producto: productoActualizado});
                })
            }
        })  
    } else {
        return res.status(500).send({ mensaje: "No esta Autorizado" });
    }
}

//eliminar
function eliminarProducto(req,res){
    var idProd = req.params.idProducto;
    if (req.user.rol == 'Rol_Admin') {
        Productos.findByIdAndDelete(idProd,(err, productoEliminado) =>{
            if (err) return res.status(500).send({mensaje:'Error en la peticion'});
            if (!productoEliminado) return res.status(404).send({mensaje: 'Error al eliminar el producto'})
            return res.status(200).send({producto: productoEliminado});
        })
    } else {
        return res.status(500).send({ mensaje: "No esta Autorizado para eliminar un producto" });
    }
}

//buscar
function verProductos(req,res){
    if (req.user.rol == 'Rol_Admin' || req.user.rol =='Rol_Cliente') {
        Productos.find((err, productosEncontrados)=>{
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!productosEncontrados) return res.status(400).send({ mensaje: "Error al cargar llos productos" });
            return res.status(200).send({ productos: productosEncontrados });
        })        
    } else {
        return res.status(500).send({ mensaje: "No esta Autorizado" });
    }
}

function verStock(req,res){
    var nomProd = req.body.producto;
    if (req.user.rol == 'Rol_Admin') {
        Productos.find({producto: nomProd},(err, productosEncontrados)=>{
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!productosEncontrados) return res.status(400).send({ mensaje: "Error al cargar los productos" });
            return res.status(200).send({ stock: productosEncontrados[0].stock });
        })        
    } else {
        return res.status(500).send({ mensaje: "No esta Autorizado" });
    }
}

function buscarPorNombre(req,res){
    var nomProd = req.body.producto;
    if (req.user.rol == 'Rol_Admin' || req.user.rol =='Rol_Cliente') {
        Productos.find({producto: nomProd},(err, productosEncontrados)=>{
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!productosEncontrados) return res.status(400).send({ mensaje: "Error al cargar los productos" });
            return res.status(200).send({ productos: productosEncontrados });
        })        
    } else {
        return res.status(500).send({ mensaje: "No esta Autorizado" });
    }
}

function buscarPorCategoria(req,res){
    var nomCat = req.body.categoria;
    if (req.user.rol == 'Rol_Admin' || req.user.rol =='Rol_Cliente') {
        Categorias.find({categoria: nomCat}, (err, categoriaEncontrada)=> {
            if (!categoriaEncontrada) return res.status(400).send({ mensaje: "Error al encontrar la categoria" });
            nomCat = categoriaEncontrada[0]._id;

            Productos.find({categoria: nomCat},(err, productosEncontrados)=>{
                if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
                if (!productosEncontrados) return res.status(400).send({ mensaje: "Error al cargar las categorias" });
                return res.status(200).send({ productos: productosEncontrados });
            })
        })        
    } else {
        return res.status(500).send({ mensaje: "No esta Autorizado" });
    }

}

module.exports={
    agregarProducto,
    buscarPorCategoria,
    buscarPorNombre,
    editarProducto,
    eliminarProducto,
    verProductos,
    editarStock,
    verStock
}