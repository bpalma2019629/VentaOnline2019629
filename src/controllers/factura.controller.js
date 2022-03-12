const Usuarios = require('../models/usuarios.model');
const Productos = require('../models/productos.model');
const Facturas = require('../models/factura.model');
const req = require('express/lib/request');
const PDF = require('pdfkit-construct');
const fs = require('fs'); 

//Crear factura
function facturar(req, res){
    const facturaModels = new Facturas();
    const usuario = req.user.nombre;
    if(req.user.rol == 'Rol_Cliente'){
        Usuarios.findById(req.user.sub, (err, usuarioEncontrado)=>{
            if(usuarioEncontrado.carrito.length == 0) return res.status(500).send({mensaje:'No existe un carrito'});
            facturaModels.productos = usuarioEncontrado.carrito;
            facturaModels.idUsuario = req.user.sub;
            facturaModels.total = usuarioEncontrado.totalCarrito;

            facturaModels.save((err, facturaGuardada)=>{
                if(err) return res.status(500).send({mensaje:"Error en la peticion"});
                if(!facturaGuardada) return res.status(400).send({mensaje:"Error al guardar la factura"});
                crearPdf(facturaGuardada,usuario);

                for(let i = 0; i < usuarioEncontrado.carrito.length; i++){
                            Productos.findOneAndUpdate({producto: usuarioEncontrado.carrito[i].nombreProducto},
                                {$inc:{stock: usuarioEncontrado.carrito[i].cantidad*-1, vendidos:usuarioEncontrado.carrito[i].cantidad}}, (err, productoActualizado)=>{
                                    if(err) return res.status(500).send({mensaje:"Error en la peticion"});
                                    if(!productoActualizado) return res.status(400).send({mensaje:"Error al actualizar el producto"});
                            })
                }
                Usuarios.findByIdAndUpdate(req.user.sub, {$set:{carrito:[]},totalCarrito: 0},{new:true},
                    (err, carritoVacio)=>{
                        return res.status(200).send({usuario:facturaGuardada})
                    })
            })
        })
    }else{
        return res.status(500).send({mensaje: 'Usted no puede facturar'});
    } 
}

function crearPdf(facturaGuardada, usuario){
    var f = new Date();
    var Fecha = f.getDate() + "-" + f.getMonth() + "-" + f.getFullYear();
    var Hora = f.getHours() + '-' + f.getMinutes() + '-' + f.getSeconds();
    var doc = new PDF({
        size: 'A4',
        margins: {top: 120, left: 50, right: 10, bottom: 20},
        bufferPages: true,  
    });
            doc.setDocumentHeader({}, () => {
    
                doc.lineJoin('miter')
                    .rect(0, 0, doc.page.width, doc.header.options.heightNumber).fill("#082183");
    
                doc.fill("#FFFFFF")
                    .fontSize(20)
                    .text("Factura No."+facturaGuardada._id, doc.header.x, doc.header.y-93);
            });
            doc.fontSize(20).text('Fecha: '+Fecha);
            doc.fontSize(20).text('Consumidor: '+usuario);
            doc.text(' ');
            doc.text(' ');

            doc.fontSize(12).text('------------------------------------------------');
            doc.fontSize(30).text('Total : '+facturaGuardada.total);
            doc.fontSize(12).text('------------------------------------------------');
            doc.fontSize(15).text('Detalles:');
            doc.text(' ');
            for(let i = 0; i < facturaGuardada.productos.length; i++){
                doc.text('Producto: '+facturaGuardada.productos[i].nombreProducto);
                doc.text('Precio: '+facturaGuardada.productos[i].precioUnitario);
                doc.text('Cantidad: '+facturaGuardada.productos[i].cantidad);
                doc.text('subTotal: '+facturaGuardada.productos[i].subTotal);
                doc.text(' ');
                doc.text('------------------------------------------------');
                doc.text(' ');
            }
            
    
            doc.setDocumentFooter({}, () => {
    
                doc.lineJoin('miter')
                    .rect(0, doc.footer.y, doc.page.width, doc.footer.options.heightNumber).fill("#4D6DEC");
    
                doc.fill("#FFFFFF")
                    .fontSize(15)
                    .text(Hora, doc.footer.x+220, doc.footer.y+3);
            });
    
            doc.render();
    
            doc.pipe(fs.createWriteStream ('Factura-'+usuario+'-'+Fecha+'-'+Hora+'.pdf'));
            doc.end();
}

//buscar productos agotados
function productosAgotados(req,res){
    if (req.user.rol == 'Rol_Admin' || req.user.rol =='Rol_Cliente') {
        Productos.find({stock: 0},(err, productosEncontrados)=>{
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!productosEncontrados) return res.status(400).send({ mensaje: "Error al cargar los productos" });
            return res.status(200).send({ productos: productosEncontrados });
        })        
    } else {
        return res.status(500).send({ mensaje: "No esta Autorizado" });
    }
}

function buscarPorMasVendido(req,res){
    if (req.user.rol == 'Rol_Admin' || req.user.rol =='Rol_Cliente') {
        Productos.find((err, productosEncontrados)=>{
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!productosEncontrados) return res.status(400).send({ mensaje: "Error al cargar los productos" });
            productosEncontrados.sort((a, b)=>{
                if(a.vendidos>b.vendidos){
                    return -1;
                }
                else if(a.vendidos<b.vendidos){
                    return 1;
                }
                else{
                    return 0;
                }
            })
            return res.status(200).send({ productos: productosEncontrados });
        })        
    } else {
        return res.status(500).send({ mensaje: "No esta Autorizado" });
    }
}

function productosDeUnaFactura(req,res){
    var idFac = req.params.idFactura;
    if (req.user.rol == 'Rol_Admin') {
        Facturas.findById(idFac, (err, facturaEncontrada)=>{
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!facturaEncontrada) return res.status(400).send({ mensaje: "Error al cargar los productos" }); 
            return res.status(200).send({ productos: facturaEncontrada.productos});
        })      
    } else {
        return res.status(500).send({ mensaje: "No esta Autorizado" });
    }
}

function verFacturasUsuario(req,res){
    var idUser = req.params.idUsuario;
    if (req.user.rol == 'Rol_Admin') {
        Facturas.find({ idUsuario : idUser}, (err, facturasEncontradas) =>{
            if(err) return res.status(500).send({mensaje: "Error en la peticion"});
            if(!facturasEncontradas) return res.status(500).send({mensaje: "Error al obtener las Encuestas"});
    
            return res.status(200).send({facturas: facturasEncontradas});
        })     
    } else {
        return res.status(500).send({ mensaje: "No esta Autorizado" });
    }
}

function verFacturas(req,res){
    if (req.user.rol == 'Rol_Cliente') {
        Facturas.find({ idUsuario : req.user.sub}, (err, facturasEncontradas) =>{
            if(err) return res.status(500).send({mensaje: "Error en la peticion"});
            if(!facturasEncontradas) return res.status(500).send({mensaje: "Error al obtener las Encuestas"});
    
            return res.status(200).send({facturas: facturasEncontradas});
        })    
    } else {
        return res.status(500).send({ mensaje: "No esta Autorizado" });
    }
}

module.exports={
    facturar,
    productosAgotados,
    buscarPorMasVendido,
    productosDeUnaFactura,
    verFacturas,
    verFacturasUsuario
}