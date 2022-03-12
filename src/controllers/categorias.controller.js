const Categorias = require('../models/categorias.model');
const Productos = require('../models/productos.model');


//agregarCategoria
function agregarCategoria(req, res){
    var parametros = req.body;
    var categoriaModel = new Categorias();

    if (req.user.rol == 'Rol_Admin') {
        if (parametros.categoria, parametros.descripcion) {
            categoriaModel.categoria = parametros.categoria;
            categoriaModel.descripcion = parametros.descripcion;

            categoriaModel.save((err, categoriaGuardada) => {
                if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
                if (!categoriaGuardada) return res.status(400).send({ mensaje: "Error al agregar la categoria" });
                return res.status(200).send({ categoria: categoriaGuardada });
            })

        }else{
            return res.status(500).send({ mensaje: "Rellene todos los campos" });
        }
    } else {
        return res.status(500).send({ mensaje: "No esta Autorizado para crear una categoria" });
    }

}

//verCategorias
function verCategorias(req, res){
    if (req.user.rol == 'Rol_Admin' || req.user.rol=='Rol_Cliente') {
        Categorias.find((err, categoriasEncontradas)=>{
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!categoriasEncontradas) return res.status(400).send({ mensaje: "Error al cargar las categorias" });
            return res.status(200).send({ categoria: categoriasEncontradas });
        })
    } else {
        return res.status(500).send({ mensaje: "No esta Autorizado para ver categorias" });
    }
}

//editarCategoria
function editarCategoria(req,res){
    var idCat = req.params.idCategoria;
    var parametros = req.body;
    if (req.user.rol == 'Rol_Admin') {
        Categorias.findByIdAndUpdate(idCat, parametros,{new:true}, (err, categoriaEditada) =>{
            if (err) return res.status(500).send({mensaje:'Error en la peticion'});
            if (!categoriaEditada) return res.status(404).send({mensaje: 'Error al Editar la categoria'})
            return res.status(200).send({categoria: categoriaEditada});
        })
    } else {
        return res.status(500).send({ mensaje: "No esta Autorizado para editar una categoria" });
    }

}

//eliminarCategoria
function eliminarCategoria(req,res){
    var idCat = req.params.idCategoria;
    if (req.user.rol == 'Rol_Admin') {
        Categorias.findOne({categoria: 'Default'}, (err, categoriaEncontrada)=>{
            if(err) return res.status(400).send({mensaje: 'Error en la peticion de categoria por Defecto'});
            if(!categoriaEncontrada){
              const modeloCategoria = new Categorias();
              modeloCategoria.categoria = 'Default';
              modeloCategoria.descripcion = null;
      
              modeloCategoria.save((err, categoriaGuardada)=>{
                if(err) return res.status(400).send({mensaje:'Error en la peticion'});
                if(!categoriaGuardada) return res.status(500).send({mensaje: 'No se ha podido agregar la categoria'});
      
                Productos.updateMany({ categoria: idCat}, {categoria: categoriaGuardada._id}, (err, productosActualizados)=>{
                  if(err) return res.status(400).send({mensaje: 'Error en la peticion de actualizar Productos'});
                  Categorias.findByIdAndDelete(idCat, (err,categoriaEliminada)=>{
                    if(err) return res.status(400).send({mensaje:'Error en la peticion'});
                    if(!categoriaEliminada) return res.status(500).send({mensaje: 'Error al eliminar la categoria'});
      
                    return res.status(200).send({
                      editado: productosActualizados,
                      eliminado: categoriaEliminada
                    })
                  })
                })
              })
            }else{
              Productos.updateMany({categoria: idCat}, {categoria: categoriaEncontrada._id},
                (err, productosActualizados)=>{
                  if(err) return res.status(400).send({mensaje: 'Error en la peticion'});
                  Categorias.findByIdAndDelete(cursoId,(err, categoriaEliminada)=>{
                    if(err) return res.status(400).send({mensaje: 'Error en la peticion'});
                    return res.status(200).send({
                      editado : productosActualizados,
                      eliminado: categoriaEliminada
                  })
                  })
                })
            }
          })
    } else {
        return res.status(500).send({ mensaje: "No esta Autorizado para eliminar una categoria" });
    }

}

//exports
module.exports = {
    agregarCategoria,
    editarCategoria,
    eliminarCategoria,
    verCategorias
}