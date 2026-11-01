let html5QrCode;

function mostrarPantalla(idPantalla) {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById(idPantalla).classList.add('activa');
}

// Nueva función universal para ir al menú principal
function volverAlInicio() {
    mostrarPantalla('pantalla-inicio');
}

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
        alert("Error al prender la cámara. Revisá los permisos.");
        volverAlInicio();
    });
}

function cancelarCamara() {
    // Si la cámara está prendida, la apagamos de forma segura antes de volver
    if (html5QrCode && typeof html5QrCode.getState === "function" && html5QrCode.getState() === 2) {
        html5QrCode.stop().then(volverAlInicio).catch(volverAlInicio);
    } else {
        volverAlInicio();
    }
}

function ingresoManual() {
    let inputOblea = document.getElementById('codigo-oblea');
    inputOblea.value = ''; 
    inputOblea.removeAttribute('readonly'); 
    
    mostrarPantalla('pantalla-formulario');
    inputOblea.focus(); 
}

function simularGuardado() {
    mostrarPantalla('pantalla-exito');
    setTimeout(() => {
        document.getElementById('codigo-oblea').value = ''; 
        document.getElementById('extintor-num').value = ''; 
        volverAlInicio();
    }, 2000);
}
