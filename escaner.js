// Variable global para manejar la cámara
let html5QrCode;

// === FUNCIÓN PARA CAMBIAR DE PANTALLAS ===
function mostrarPantalla(idPantalla) {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById(idPantalla).classList.add('activa');
}

// === FUNCIÓN PARA VOLVER AL MENÚ PRINCIPAL ===
function volverAlInicio() {
    mostrarPantalla('pantalla-inicio');
}

// === LÓGICA DE LA CÁMARA ===
function abrirCamara() {
    mostrarPantalla('pantalla-camara');
    
    if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("lector-contenedor");
    }
    
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode.start({ facingMode: "environment" }, config, 
        (textoDecodificado) => {
            html5QrCode.stop().then(() => {
                if(navigator.vibrate) navigator.vibrate(200);
                
                let inputOblea = document.getElementById('codigo-oblea');
                inputOblea.value = textoDecodificado;
                inputOblea.setAttribute('readonly', true); 
                
                mostrarPantalla('pantalla-formulario');
                document.getElementById('extintor-num').focus();
            });
        },
        (mensajeError) => {}
    ).catch(err => {
        alert("Error al prender la cámara. Revisá los permisos del navegador.");
        volverAlInicio();
    });
}

// === FUNCIÓN PARA APAGAR LA CÁMARA SI SE ARREPIENTE ===
function cancelarCamara() {
    if (html5QrCode && typeof html5QrCode.getState === "function" && html5QrCode.getState() === 2) {
        html5QrCode.stop().then(volverAlInicio).catch(volverAlInicio);
    } else {
        volverAlInicio();
    }
}

// === LÓGICA DEL INGRESO MANUAL ===
function ingresoManual() {
    let inputOblea = document.getElementById('codigo-oblea');
    inputOblea.value = ''; 
    inputOblea.removeAttribute('readonly'); 
    
    mostrarPantalla('pantalla-formulario');
    inputOblea.focus(); 
}

// === CONEXIÓN A GOOGLE SHEETS (BASE DE DATOS) ===
function simularGuardado() { 
    
    let inputOblea = document.getElementById('codigo-oblea').value;
    let inputExtintor = document.getElementById('extintor-num').value;

    if (inputOblea === "" || inputExtintor === "") {
        alert("Por favor, completá ambos campos antes de guardar.");
        return;
    }

    let botonGuardar = document.querySelector('.btn-azul');
    botonGuardar.innerText = "GUARDANDO...";
    botonGuardar.disabled = true;

    const URL_DE_GOOGLE = "https://script.google.com/macros/s/AKfycbwDi-mtRlx3GGvXnqKeyGqpspiiJzhc_qMWad9oD2Hi4Y0CgZ50qRsDWonlk0lPtL2p/exec";

    let datos = new URLSearchParams();
    datos.append("oblea", inputOblea);
    datos.append("extintor", inputExtintor);

    fetch(URL_DE_GOOGLE, {
        method: 'POST',
        body: datos,
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    .then(() => {
        botonGuardar.innerText = "GUARDAR RECARGA";
        botonGuardar.disabled = false;
        
        mostrarPantalla('pantalla-exito');
        
        setTimeout(() => {
            document.getElementById('codigo-oblea').value = ''; 
            document.getElementById('extintor-num').value = ''; 
            volverAlInicio();
        }, 2000);
    })
    .catch(error => {
        alert("Hubo un error de conexión. Revisá el WiFi o tus datos móviles.");
        botonGuardar.innerText = "GUARDAR RECARGA";
        botonGuardar.disabled = false;
    });
}
