const { comprobarJWT } = require("../helpers");

const { ChatMensajes } = require('../models')

const chatMensajes = new ChatMensajes();

const socketController = async( socket, io ) => {

    const token = socket.handshake.headers['x-token'];
    const usuario = await comprobarJWT( token );

    if (!usuario) {
        return socket.disconnect()
    }
    // Agregar usuarios conectado
    chatMensajes.conectarUsuario( usuario  )
    io.emit('usuarios-activos', chatMensajes.usuariosArr )
    socket.emit('recibir-mensajes', chatMensajes.ultimosDiez )

    // Conectarlo a una sala especial
    socket.join( usuario.id ) //globar, socket.id, usuario.id
    // Limpiar cuando alguien se desconecta
    socket.on('disconnect', () => {
        chatMensajes.desconectarUsuario( usuario.id )
    })
    // Enviar mensaje
    socket.on('enviar-mensaje', ({ uid, mensaje }) => {

        if ( uid ) {
            // Mensaje privado
            socket.to( uid ).emit( 'mensaje-privado', { de: usuario.nombre, mensaje })
            chatMensajes.enviarMensaje( usuario.id, usuario.nombre, mensaje )
            io.emit( 'mensaje-privado', chatMensajes.ultimosDiez )

        }else{
            chatMensajes.enviarMensaje( usuario.id, usuario.nombre, mensaje )
            io.emit( 'recibir-mensajes', chatMensajes.ultimosDiez )

        }


    })

}

module.exports = { socketController }