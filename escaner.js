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
    
    // Si la cámara no existe, la creamos
    if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("lector-contenedor");
    }
    
    // Configuración: 10 cuadros por segundo y un cuadrado de enfoque de 250x250
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode.start({ facingMode: "environment" }, config, 
        (textoDecodificado) => {
            // ÉXITO: Cuando lee un código, frenamos la cámara
            html5QrCode.stop().then(() => {
                // Vibra el celular si lo permite
                if(navigator.vibrate) navigator.vibrate(200);
                
                // Llenamos el casillero con la oblea y lo bloqueamos para no borrarlo por error
                let inputOblea = document.getElementById('codigo-oblea');
                inputOblea.value = textoDecodificado;
                inputOblea.setAttribute('readonly', true); 
                
                // Pasamos al formulario y abrimos el teclado numérico
                mostrarPantalla('pantalla-formulario');
                document.getElementById('extintor-num').focus();
            });
        },
        (mensajeError) => {
            // Ignoramos los errores que tira mientras intenta enfocar
        }
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
    inputOblea.value = ''; // Limpiamos cualquier dato viejo
    inputOblea.removeAttribute('readonly'); // Desbloqueamos el casillero
    
    mostrarPantalla('pantalla-formulario');
    inputOblea.focus(); // Abrimos el teclado en la oblea
}

// === CONEXIÓN A GOOGLE SHEETS (BASE DE DATOS) ===
function simularGuardado() { 
    
    let inputOblea = document.getElementById('codigo-oblea').value;
    let inputExtintor = document.getElementById('extintor-num').value;

    // 1. Verificamos que no deje campos en blanco
    if (inputOblea === "" || inputExtintor === "") {
        alert("Por favor, completá ambos campos antes de guardar.");
        return;
    }

    // 2. Cambiamos el botón a "Guardando..." y lo bloqueamos para que no lo toque dos veces
    let botonGuardar = document.querySelector('.btn-azul');
    botonGuardar.innerText = "GUARDANDO...";
    botonGuardar.disabled = true;

    // =========================================================================
    // ⚠️ ACÁ TENÉS QUE PEGAR LA URL QUE TE DIO GOOGLE APPS SCRIPT AL IMPLEMENTAR
    // =========================================================================
    const URL_DE_GOOGLE = "https://script.google.com/macros/s/TU_LINK_LARGUISIMO_AQUI/exec";

    // 3. Preparamos el paquete de datos
    let datos = new FormData();
    datos.append("oblea", inputOblea);
    datos.append("extintor", inputExtintor);

    // 4. Lo enviamos por internet a tu Google Sheets
    fetch(URL_DE_GOOGLE, {
        method: 'POST',
        body: datos,
        mode: 'no-cors' // Fundamental para que no haya bloqueos de seguridad cruzada
    })
    .then(() => {
        // ÉXITO: El dato llegó a Google. Volvemos el botón a la normalidad
        botonGuardar.innerText = "GUARDAR RECARGA";
        botonGuardar.disabled = false;
        
        // Mostramos el tilde verde gigante
        mostrarPantalla('pantalla-exito');
        
        // A los 2 segundos, limpiamos todo y volvemos al menú principal
        setTimeout(() => {
            document.getElementById('codigo-oblea').value = ''; 
            document.getElementById('extintor-num').value = ''; 
            volverAlInicio();
        }, 2000);
    })
    .catch(error => {
        // ERROR: Si se corta el WiFi en el medio
        alert("Hubo un error de conexión. Revisá el WiFi o tus datos móviles.");
        botonGuardar.innerText = "GUARDAR RECARGA";
        botonGuardar.disabled = false;
    });
}
