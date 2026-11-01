let html5QrCode;

function mostrarPantalla(idPantalla) {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById(idPantalla).classList.add('activa');
}

function iniciarCamara() {
    document.getElementById('btn-iniciar-camara').style.display = 'none';

    html5QrCode = new Html5Qrcode("lector-contenedor");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode.start({ facingMode: "environment" }, config, 
        (textoDecodificado) => {
            // Cuando lee un código exitosamente:
            html5QrCode.stop().then(() => {
                if(navigator.vibrate) navigator.vibrate(200);
                
                document.getElementById('codigo-leido').innerText = textoDecodificado;
                mostrarPantalla('pantalla-formulario');
                document.getElementById('extintor-num').focus();
                
                document.getElementById('btn-iniciar-camara').style.display = 'block';
            });
        },
        (mensajeError) => {
            // Ignoramos los errores de lectura constantes mientras enfoca
        }
    ).catch(err => {
        alert("Error al prender la cámara. Revisá los permisos.");
        document.getElementById('btn-iniciar-camara').style.display = 'block';
    });
}

function volverAEscanear() {
    mostrarPantalla('pantalla-escaner');
}

function simularGuardado() {
    mostrarPantalla('pantalla-exito');
    setTimeout(() => {
        document.getElementById('extintor-num').value = ''; 
        mostrarPantalla('pantalla-escaner');
    }, 2000);
}
