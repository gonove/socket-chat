let url = (window.location.hostname.includes('localhost') )
? 'http://localhost:8080/api/auth/'
: 'https://abcde.herokuapp.com/api/auth/'

let usuario = null;
let socket = null

// Referencias HTML
const txtUid = document.querySelector('#txtUid')
const txtMensaje = document.querySelector('#txtMensaje')
const ulUsuarios = document.querySelector('#ulUsuarios')
const ulMensajes = document.querySelector('#ulMensajes')
const btnSalir = document.querySelector('#btnSalir')

// Validar token del localstorage
const validarJWTL = async() => {

    const token = localStorage.getItem('token') || '';

    // console.log(token);

    if ( token.length <= 10 ) {
        window.location = 'index.html'
        throw new Error('No hay token en el servidor')
    }

    const respuesta = await fetch( url, {
        headers : { 'x-token' : token }
    });

    // Se renueva el token y db en localstorage
    const { usuario: userDB, token : tokenDB } =  await respuesta.json()
    // console.log(userDB, tokenDB);

    localStorage.setItem('token', tokenDB)
    usuario = userDB

    document.title = usuario.nombre

    await conectarSocket()
}

const conectarSocket = async() => {
    socket = io({
        'extraHeaders' : {
            'x-token' : localStorage.getItem('token')
        }
    })

    // Eventos
    socket.on('connect', () => {
        console.log('Sockets online');
    })

    socket.on('disconnect', () => {
        console.log('Sockets offline');
    })

    socket.on('recibir-mensajes', renderMensajes )

    socket.on('usuarios-activos', renderUsuarios )

    socket.on('mensaje-privado', renderPrivado )
}

const renderUsuarios = ( usuarios = [] ) => {
    let usersHtml = '';

    usuarios.forEach( ({ nombre, uid }) => {
        usersHtml += `
            <li>
                <p>
                <h5 class="text-success">${nombre}</h5>
                <span class="fs-6 text-muted">${uid}</span>
                </p>
            </li>
        `
    })
    ulUsuarios.innerHTML = usersHtml;
}

const renderMensajes = ( mensajes = [] ) => {
    // console.log(mensajes);
    let mensajesHtml = '';

    mensajes.forEach( ({ nombre, mensaje }) => {
        mensajesHtml += `
            <li>
                <p>
                    <span class="text-success">${ nombre }</span>
                    <span>${ mensaje }</span>
                </p>
            </li>
        `
    })

    ulMensajes.innerHTML = mensajesHtml;
}

// const renderPrivado = ( {de, mensaje} ) => {

//     if (!mensaje) {
//         return;
//     }
//     let mensajePriv = ''

//     mensajePriv += `
//             <li>
//                 <p>
//                     <span class="text-success">${ de }</span>
//                     <span>${ mensaje }</span>
//                 </p>
//             </li>
//     `
//     ulMensajes.innerHTML = mensajePriv
// }

const renderPrivado = ( message ) => {

    Object.entries( message )
    let mensajePriv = ''
    // console.log(message);

    message.forEach( ({ de, mensaje }) => {
        mensajePriv += `
             <li>
                 <p>
                     <span class="text-success">${ de }</span>
                     <span>${ mensaje }</span>
                 </p>
             </li>
        `
    })
    ulMensajes.innerHTML = mensajePriv

}

txtMensaje.addEventListener('keyup', ({ key }) => {

    const mensaje = txtMensaje.value;
    const uid = txtUid.value

    if ( key !== "Enter" ) { return }
    if (mensaje.length === 0) { return }

    socket.emit('enviar-mensaje', { mensaje, uid })

    txtMensaje.value = ''

})

const main = async() => {

    // validar JWT
    await validarJWTL()

}


main();