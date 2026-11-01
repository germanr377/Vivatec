let html5QrCode;

function mostrarPantalla(idPantalla) {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById(idPantalla).classList.add('activa');
}

function volverAlInicio() {
    mostrarPantalla('pantalla-inicio');
}

// Función auxiliar para obtener la fecha de hoy en formato YYYY-MM-DD
function obtenerFechaHoy() {
    let hoy = new Date();
    let anio = hoy.getFullYear();
    let mes = String(hoy.getMonth() + 1).padStart(2, '0');
    let dia = String(hoy.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
}

// LÓGICA DE LA CÁMARA
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

function cancelarCamara() {
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

// PASO INTERMEDIO: LLEVA LOS DATOS A LA PANTALLA DE CONFIRMACIÓN
function irAConfirmacion() {
    let oblea = document.getElementById('codigo-oblea').value;
    let extintor = document.getElementById('extintor-num').value;

    if (oblea === "" || extintor === "") {
        alert("Por favor, completá ambos campos antes de continuar.");
        return;
    }

    // Pasamos los valores a los inputs de la pantalla de confirmación
    document.getElementById('conf-oblea').value = oblea;
    document.getElementById('conf-extintor').value = extintor;
    
    // Asignamos la fecha de hoy como fecha de recarga por defecto
    let fechaHoy = obtenerFechaHoy();
    document.getElementById('conf-recarga').value = fechaHoy;

    // Calculamos el vencimiento (exactamente 1 año después)
    calcularVencimientoPrevio();

    // Mostramos la pantalla de confirmación
    mostrarPantalla('pantalla-confirmacion');
}

// CALCULA AUTOMÁTICAMENTE EL VENCIMIENTO SEGÚN LA FECHA DE RECARGA SELECCIONADA
function calcularVencimientoPrevio() {
    let fechaRecargaStr = document.getElementById('conf-recarga').value;
    if (!fechaRecargaStr) return;

    let partes = fechaRecargaStr.split('-');
    let anio = parseInt(partes[0]) + 1; // Sumamos 1 año
    let mes = partes[1];
    let dia = partes[2];

    let fechaVencStr = `${anio}-${mes}-${dia}`;
    document.getElementById('conf-vencimiento').value = fechaVencStr;
}

// GUARDADO DEFINITIVO EN GOOGLE SHEETS
function guardarDefinitivo() {
    let oblea = document.getElementById('conf-oblea').value;
    let extintor = document.getElementById('conf-extintor').value;
    let fechaRecarga = document.getElementById('conf-recarga').value;

    if (oblea === "" || extintor === "" || fechaRecarga === "") {
        alert("Todos los campos de confirmación deben estar completos.");
        return;
    }

    let botonGuardar = document.querySelector('#pantalla-confirmacion .btn-azul');
    botonGuardar.innerText = "GUARDANDO...";
    botonGuardar.disabled = true;

    const URL_DE_GOOGLE = "https://script.google.com/macros/s/AKfycbwDi-mtRlx3GGvXnqKeyGqpspiiJzhc_qMWad9oD2Hi4Y0CgZ50qRsDWonlk0lPtL2p/exec";

    let datos = new URLSearchParams();
    datos.append("oblea", oblea);
    datos.append("extintor", extintor);
    datos.append("fechaRecarga", fechaRecarga); // Mandamos la fecha elegida

    fetch(URL_DE_GOOGLE, {
        method: 'POST',
        body: datos,
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    .then(() => {
        botonGuardar.innerText = "CONFIRMAR Y GUARDAR";
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
        botonGuardar.innerText = "CONFIRMAR Y GUARDAR";
        botonGuardar.disabled = false;
    });
}
