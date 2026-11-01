// URL DE TU GOOGLE APPS SCRIPT (El mismo que usás para guardar)
const URL_DE_GOOGLE = "https://script.google.com/macros/s/AKfycbwDi-mtRlx3GGvXnqKeyGqpspiiJzhc_qMWad9oD2Hi4Y0CgZ50qRsDWonlk0lPtL2p/exec";

function consultarFechas() {
    let desde = document.getElementById('fecha-desde').value;
    let hasta = document.getElementById('fecha-hasta').value;

    if (!desde || !hasta) {
        alert("Por favor, seleccioná ambas fechas.");
        return;
    }

    let tbody = document.querySelector('#tabla-resultados tbody');
    tbody.innerHTML = `<tr><td colspan="4" class="sin-resultados">Buscando datos...</td></tr>`;

    // Consultamos a Google usando GET con parámetros de fecha
    let urlConsulta = `${URL_DE_GOOGLE}?accion=consultar&desde=${desde}&hasta=${hasta}`;

    fetch(urlConsulta)
        .then(response => response.json())
        .then(datos => {
            tbody.innerHTML = "";

            if (datos.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="sin-resultados">No se encontraron registros en ese período.</td></tr>`;
                return;
            }

            // Recorremos cada fila que nos devolvió Google y la armamos en la tabla
            datos.forEach(fila => {
                let tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${fila.oblea}</td>
                    <td>${fila.extintor}</td>
                    <td>${fila.recarga}</td>
                    <td>${fila.vencimiento}</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error("Error:", error);
            tbody.innerHTML = `<tr><td colspan="4" class="sin-resultados">Error al conectar con la base de datos.</td></tr>`;
        });
}
