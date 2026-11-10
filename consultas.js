// CREDENCIALES DE SUPABASE
const SUPABASE_URL = "https://cpgdqzrvtensoruahgxn.supabase.co";
const SUPABASE_KEY = "sb_publishable_o529qydnYQpc1UBoqttXpQ_hfdLAWb9";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function consultarFechas() {
    let desde = document.getElementById('fecha-desde').value; // Formato esperado AAAA-MM-DD o input date
    let hasta = document.getElementById('fecha-hasta').value;

    let tbody = document.querySelector('#tabla-resultados tbody');
    
    if (!desde || !hasta) {
        alert("Por favor, seleccioná ambas fechas.");
        return;
    }

    tbody.innerHTML = `<tr><td colspan="4" class="sin-resultados">Buscando datos en Supabase...</td></tr>`;

    try {
        // Consultamos a la tabla 'extintores' filtrando por rango de fechas (ej: vto_carga)
        // Cambiá 'vto_carga' por la columna de fecha que necesites consultar
        const { data, error } = await _supabase
            .from('extintores')
            .select('oblea, extintor_numero, vto_carga, numero_dps')
            .gte('vto_carga', desde)
            .lte('vto_carga', hasta)
            .order('vto_carga', { ascending: true });

        if (error) {
            throw error;
        }

        tbody.innerHTML = "";

        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="sin-resultados">No se encontraron registros en ese período.</td></tr>`;
            return;
        }

        // Recorremos cada fila que nos devolvió Supabase y la armamos en la tabla
        data.forEach(fila => {
            let tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${fila.oblea || "-"}</td>
                <td>${fila.extintor_numero || "-"}</td>
                <td>${fila.numero_dps || "-"}</td>
                <td>${fila.vto_carga || "-"}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Error al consultar Supabase:", error);
        tbody.innerHTML = `<tr><td colspan="4" class="sin-resultados">Error al conectar con la base de datos.</td></tr>`;
    }
}
