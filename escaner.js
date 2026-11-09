// escaner.js - Módulo reutilizable de lectura OCR para Vivatec

let streamVideo = null;
let scanInterval = null;
let isReading = false;
let workerOCR = null;
let inputDestino = null; // Variable para saber en qué casillero escribir el resultado

// Iniciar OCR en segundo plano al cargar la web
window.addEventListener("load", async function() {
    try {
        workerOCR = await Tesseract.createWorker('eng');
        await workerOCR.setParameters({
            tessedit_char_whitelist: '0123456789', // Solo números
        });
        console.log("Motor de escaneo OCR listo.");
    } catch (e) {
        console.error("Error iniciando OCR:", e);
    }
});

// Función para prender la cámara. Recibe como parámetro el ID del casillero.
function encenderCamara(idCasillero) {
    inputDestino = idCasillero; // Guardamos dónde tiene que ir el número
    
    let visor = document.getElementById("visorCamara");
    let video = document.getElementById("videoEnVivo");
    document.getElementById("estadoLectura").textContent = "Buscando número automáticamente... Mantené firme.";
    visor.style.display = "block";

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
            streamVideo = stream;
            video.srcObject = stream;
            
            // Arranca a sacar una foto por segundo
            scanInterval = setInterval(escanearAutomaticamente, 1000);
        })
        .catch(err => {
            console.error("Error al acceder a la cámara:", err);
            alert("No se pudo iniciar la cámara. Verificá los permisos.");
            visor.style.display = "none";
        });
}

function apagarCamara() {
    if (scanInterval) clearInterval(scanInterval);
    isReading = false;
    
    if (streamVideo) {
        streamVideo.getTracks().forEach(track => track.stop());
        streamVideo = null;
    }
    document.getElementById("visorCamara").style.display = "none";
}

async function escanearAutomaticamente() {
    if (!streamVideo || isReading || !workerOCR) return;
    
    let video = document.getElementById("videoEnVivo");
    if (video.videoWidth === 0) return; 

    isReading = true;

    let canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    let ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Recortar la franja central
    let canvasRecorte = document.createElement("canvas");
    canvasRecorte.width = canvas.width;
    canvasRecorte.height = canvas.height * 0.3;
    let ctxRecorte = canvasRecorte.getContext("2d");
    
    ctxRecorte.drawImage(
        canvas, 
        0, canvas.height * 0.35, canvas.width, canvas.height * 0.3, 
        0, 0, canvasRecorte.width, canvasRecorte.height
    );

    try {
        let result = await workerOCR.recognize(canvasRecorte);
        let numeros = result.data.text.replace(/[^0-9]/g, '').trim();
        
        if (numeros.length >= 4) {
            // Escribe el número en el casillero que le indicamos al encender la cámara
            document.getElementById(inputDestino).value = numeros;
            apagarCamara(); 
        }
    } catch(err) {
        console.error("Error OCR:", err);
    }
    
    isReading = false; 
}
