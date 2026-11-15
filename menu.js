document.addEventListener("DOMContentLoaded", function() {
    // Detectar en qué página estamos parados actualmente
    const paginaActual = window.location.pathname.split("/").pop() || "gestion.html";

    // Inyectar los estilos CSS (con soporte para los tooltips/descripciones)
    const style = document.createElement('style');
    style.innerHTML = `
        .vivatec-navbar {
            background-color: #2c3e50;
            padding: 10px 20px;
            border-radius: 6px;
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            align-items: center;
            justify-content: center;
        }
        .vivatec-nav-item {
            position: relative;
            display: inline-block;
        }
        .vivatec-nav-link {
            color: #bdc3c7;
            text-decoration: none;
            padding: 10px 14px;
            border-radius: 6px;
            font-size: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            background: transparent;
            cursor: pointer;
        }
        .vivatec-nav-link:hover {
            background-color: #34495e;
            color: #fff;
        }
        .vivatec-nav-link.activo {
            background-color: #2980b9;
            color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .vivatec-tooltip {
            position: absolute;
            bottom: -35px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #34495e;
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-family: Arial, sans-serif;
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            z-index: 10;
        }
        .vivatec-tooltip.show {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);

    // Buscar o crear el contenedor del menú
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

    // Lista de pantallas con sus íconos y descripciones (incluyendo informes.html)
    const items = [
        { href: "gestion.html", icon: "🛠️", label: "Gestión / Carga" },
        { href: "consultas.html", icon: "📊", label: "Consultas y Filtros" },
        { href: "importar.html", icon: "📥", label: "Importación Masiva" },
        { href: "informes.html", icon: "📑", label: "Informes" }
    ];

    let html = '<div class="vivatec-navbar">';
    items.forEach(item => {
        const esActivo = paginaActual === item.href ? 'activo' : '';
        html += `
            <div class="vivatec-nav-item">
                <a href="${item.href}" class="vivatec-nav-link ${esActivo}">
                    ${item.icon}
                </a>
                <div class="vivatec-tooltip">${item.label}</div>
            </div>
        `;
    });
    html += '</div>';

    contenedorMenu.innerHTML = html;

    // Lógica de 1 clic (muestra la descripción) y 2 clics rápidos (navega)
    const links = contenedorMenu.querySelectorAll('.vivatec-nav-link');
    links.forEach(link => {
        let clickTimer = null;

        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tooltip = this.parentElement.querySelector('.vivatec-tooltip');

            if (clickTimer === null) {
                clickTimer = setTimeout(() => {
                    clickTimer = null;
                    // 1 Clic: Muestra u oculta la descripción flotante
                    document.querySelectorAll('.vivatec-tooltip').forEach(t => {
                        if (t !== tooltip) t.classList.remove('show');
                    });
                    tooltip.classList.toggle('show');
                }, 300); // Ventana de tiempo para detectar el doble clic
            } else {
                clearTimeout(clickTimer);
                clickTimer = null;
                // 2 Clics rápidos: Va hacia la nueva página
                window.location.href = this.href;
            }
        });
    });

    // Ocultar descripciones si se hace clic en cualquier otra parte de la pantalla
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.vivatec-navbar')) {
            document.querySelectorAll('.vivatec-tooltip').forEach(t => t.classList.remove('show'));
        }
    });
});
