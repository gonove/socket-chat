let url = (window.location.hostname.includes('localhost') )
? 'http://localhost:8080/api/auth/'
: 'https://abcde.herokuapp.com/api/auth/'


const formulario = document.querySelector('form')
formulario.addEventListener( 'submit', e => {
    e.preventDefault();
    const formData = {}

    for (const ele of formulario.elements) {
        if (ele.name.length > 0) {
            formData[ele.name] = ele.value
        }
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    fetch( url + 'login', { method: 'POST',
        headers: myHeaders,
        mode: 'cors',
        cache: 'default',
        body: JSON.stringify(formData)
    })
        .then( resp => resp.json() )
        .then( ({ msg, token }) => {
            if (msg) {
                return console.error( msg )
            }

            localStorage.setItem('token', token)
            // redireccion de pagina
            window.location = 'chat.html'
        })
        .catch( err => {
            console.log(err);
        })
})

// Google Token - ID TOKEN
function handleCredentialResponse(response) {
    const id_token = response.credential
    var body = { id_token };


    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var myInit = { method: 'POST',
        headers: myHeaders,
        mode: 'cors',
        cache: 'default',
        body: JSON.stringify(body) };

    var myRequest = new Request(url + 'google', myInit);

    fetch( myRequest )
        .then(resp => resp.json() )
        .then( ({token}) => {
            // console.log(data)
            localStorage.setItem( 'token', token )

            // redireccion de pagina
            window.location = 'chat.html'
        })
        .catch( console.log );
}

const button = document.getElementById('google-signout');
button.onclick = () => {
    console.log(google.accounts.id);
    google.accounts.id.disableAutoSelect()


    google.accounts.id.revoke( localStorage.getItem('token'), done => {
        localStorage.clear()
        location.reload()
    } )
}
