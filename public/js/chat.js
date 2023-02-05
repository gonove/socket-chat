let url = (window.location.hostname.includes('localhost') )
? 'http://localhost:8080/api/auth/'
: 'https://abcde.herokuapp.com/api/auth/'

let usuario = null;
let socket = null

// Validar token del localstorage
const validarJWTL = async() => {

    const token = localStorage.getItem('token') || '';

    console.log(token);

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
    const socket = io({
        'extraHeaders' : {
            'x-token' : localStorage.getItem('token')
        }
    })
}
const main = async() => {

    // validar JWT
    await validarJWTL()

}


main();