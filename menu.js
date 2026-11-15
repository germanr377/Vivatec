document.addEventListener("DOMContentLoaded", function() {
    // Detectar en qué página estamos parados actualmente
    const paginaActual = window.location.pathname.split("/").pop() || "gestion.html";

    // Inyectar los estilos CSS de la barra directamente
    const style = document.createElement('style');
    style.innerHTML = `
        .vivatec-navbar {
            background-color: #2c3e50;
            padding: 10px 15px;
            border-radius: 6px;
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            align-items: center;
        }
        .vivatec-brand {
            color: #ecf0f1;
            font-weight: bold;
            font-size: 15px;
            margin-right: 15px;
            padding-left: 5px;
            letter-spacing: 0.5px;
        }
        .vivatec-nav-link {
            color: #bdc3c7;
            text-decoration: none;
            padding: 8px 14px;
            border-radius: 4px;
            font-size: 13px;
            font-weight: bold;
            transition: all 0.2s;
        }
        .vivatec-nav-link:hover {
            background-color: #34495e;
            color: #white;
        }
        .vivatec-nav-link.activo {
            background-color: #2980b9;
            color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
    `;
    document.head.appendChild(style);

    // Buscar si existe un contenedor reservado, sino crearlo arriba de todo en el container
    let contenedorMenu = document.getElementById("menu-compartido");
    if (!contenedorMenu) {
        contenedorMenu = document.createElement("div");
        contenedorMenu.id = "menu-compartido";
        const mainContainer = document.querySelector(".container");
        if (mainContainer) {
            mainContainer.insertBefore(contenedorMenu, mainContainer.firstChild);
        } else {
            document.body.insertBefore(contenedorMenu, document.body.firstChild);
        }
    }

    // Dibujar la barra con sus enlaces y marcar la página activa
    contenedorMenu.innerHTML = `
        <div class="vivatec-navbar">
            <span class="vivatec-brand">🔥 VIVATEC</span>
            <a href="gestion.html" class="vivatec-nav-link ${paginaActual === 'gestion.html' ? 'activo' : ''}">🛠️ Gestión / Carga</a>
            <a href="consultas.html" class="vivatec-nav-link ${paginaActual === 'consultas.html' ? 'activo' : ''}">📊 Consultas y Filtros</a>
            <a href="importar.html" class="vivatec-nav-link ${paginaActual === 'importar.html' ? 'activo' : ''}">📥 Importación Masiva</a>
        </div>
    `;
});
