let html5QrCode;

function mostrarPantalla(idPantalla) {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById(idPantalla).classList.add('activa');
}

function iniciarCamara() {
    document.getElementById('btn-iniciar-camara').style.display = 'none';

    if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("lector-contenedor");
    }
    
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode.start({ facingMode: "environment" }, config, 
        (textoDecodificado) => {
            html5QrCode.stop().then(() => {
                if(navigator.vibrate) navigator.vibrate(200);
                
                // Llenamos el casillero con lo que leyó la cámara y lo bloqueamos
                let inputOblea = document.getElementById('codigo-oblea');
                inputOblea.value = textoDecodificado;
                inputOblea.setAttribute('readonly', true); 
                
                mostrarPantalla('pantalla-formulario');
                document.getElementById('extintor-num').focus();
                
                document.getElementById('btn-iniciar-camara').style.display = 'block';
            });
        },
        (mensajeError) => {}
    ).catch(err => {
        alert("Error al prender la cámara. Revisá los permisos.");
        document.getElementById('btn-iniciar-camara').style.display = 'block';
    });
}

// === NUEVA FUNCIÓN: INGRESO MANUAL ===
function ingresoManual() {
    // Si la cámara estaba prendida buscando un código, la apagamos primero
    if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(abrirFormularioLimpio).catch(abrirFormularioLimpio);
    } else {
        abrirFormularioLimpio();
    }
}

function abrirFormularioLimpio() {
    let inputOblea = document.getElementById('codigo-oblea');
    inputOblea.value = ''; // Vaciamos el texto
    inputOblea.removeAttribute('readonly'); // Desbloqueamos por si estaba bloqueado
    
    mostrarPantalla('pantalla-formulario');
    inputOblea.focus(); // Ponemos el cursor ahí para que el teclado se abra solo
}

function volverAEscanear() {
    mostrarPantalla('pantalla-escaner');
}

function simularGuardado() {
    mostrarPantalla('pantalla-exito');
    setTimeout(() => {
        document.getElementById('codigo-oblea').value = ''; 
        document.getElementById('extintor-num').value = ''; 
        mostrarPantalla('pantalla-escaner');
    }, 2000);
}
