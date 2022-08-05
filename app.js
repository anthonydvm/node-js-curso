const iniciDebug = require('debug')('app:inicio');

const express = require('express');
const config = require('config');
const logger = require('./logger.js');
const morgan = require('morgan');
const joi = require('@hapi/joi');
const Joi = require('@hapi/joi');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

//configuracion de entornos de trabajo
console.log('Aplicacion: ' + config.get('nombre'))
//console.log('Base de datos: ' + config.get('configDB.host'))

//USO DE MIDDLEWARE DE TERCERO
if(app.get('env') === 'development'){
    app.use(morgan('tiny'));
    console.log('morgan habilitado')
    iniciDebug('Morgan esta habilitado')
}

//app.use(logger); a



// app.get(); //peticion de datos
// app.post(); //envio de datos 
// app.put(); //actualizacion de datos
// app.delete(); //eliminar datos

const usuarios = [
    {id:1, nombre: "Anthony"},
    {id:2, nombre: "Ilay"},
    {id:3, nombre: "Liam"}
];


app.get('/', (req, res) => {
    res.send('Hola mundo')
})

app.get('/api/usuarios', (req, res)=>{
    res.send(usuarios)
});

app.get('/api/usuarios/:id', (req, res)=> {
    let usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    if(!usuario){
        res.status(404).send('El usuario no fue encontrado');
    }else{
        res.status(200).send(`El ${usuario.id} es ${usuario.nombre}`);
    }
})

app.post('/api/usuarios', (req, res) =>{
    
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    })
    const {error, value} = schema.validate({nombre:req.body.nombre})

    if(!error){
        const usuario = {
            id: usuarios.length + 1 , 
            nombre: value.nombre
        }
        usuarios.push(usuario);

        res.send(usuario)
    }else{
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }
})

app.put('/api/usuarios/:id', (req,res) => {
    
    //let usuario = usuarios.find(u => u.id === parseInt(req.params.id));

    let usuario = existeUsuario(req.params.id);
    
    if(!usuario){
        res.status(404).send('El usuario no fue encontrado')
        return
    }
    
    const{error, value} = validarUsuario(req.body.nombre)
    
    if(error){
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
        return
    }

    usuario.nombre=value.nombre;

    res.send(usuario)
    
})

app.delete('/api/usuarios/:id', (req, res) =>{

    let usuario = existeUsuario(req.params.id);

    if(!usuario){
        res.status(404).send('El usuario no fue encontrado')
        return
    }

    const index = usuarios.indexOf(usuario);
    usuarios.splice(index, 1);

    res.send(usuarios);
})


const existeUsuario = (id) => {
    return(usuarios.find(u => u.id === parseInt(id)));
}

const validarUsuario = (name) => {
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });
    return(schema.validate({nombre:name}));
}

const port = process.env.PORT || 3000;

app.listen(3000, () => {
    console.log(`Escuchando en el puerto ${port}...`);
});