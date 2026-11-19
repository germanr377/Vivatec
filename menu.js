document.addEventListener("DOMContentLoaded", function() {
    // Detectar en qué página estamos parados actualmente
    const paginaActual = window.location.pathname.split("/").pop() || "gestion.html";

    // Inyectar los estilos CSS con barra fina y dibujos ajustados a los bordes
    const style = document.createElement('style');
    style.innerHTML = `
        .vivatec-navbar {
            background-color: #2c3e50;
            padding: 2px 15px; /* Barra bien fina verticalmente */
            border-radius: 4px;
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
        }
        .vivatec-nav-item {
            position: relative;
            display: inline-block;
        }
        .vivatec-nav-link {
            color: #bdc3c7;
            text-decoration: none;
            padding: 3px 10px; /* Dibujos bien pegados arriba y abajo */
            border-radius: 3px;
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            background: transparent;
            cursor: pointer;
            border: none;
        }
        .vivatec-nav-link.icono-papiro {
            font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, 'Times New Roman', serif;
            font-style: italic;
            font-weight: 900;
            font-size: 21px;
            line-height: 1;
            padding: 2px 8px;
            border: 1px solid rgba(245, 222, 179, 0.35);
            border-radius: 4px;
            color: #f3e5ab;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
        }
        .vivatec-nav-link.icono-papiro:hover {
            border-color: #f3e5ab;
            color: #fff8dc;
        }
        .vivatec-nav-link:hover {
            background-color: #34495e;
            color: #fff;
        }
        .vivatec-nav-link.activo {
            background-color: #2980b9;
            color: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .vivatec-nav-link.icono-papiro.activo {
            border-color: #fff8dc;
            color: #fff;
        }
        /* Estilo especial para el botón de salir con tono rojizo al pasar el mouse */
        .vivatec-nav-link.logout:hover {
            background-color: #c0392b;
            color: white;
        }
        .vivatec-tooltip {
            position: absolute;
            bottom: -32px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #34495e;
            color: white;
            padding: 4px 8px;
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
        .vivatec-nav-item:hover .vivatec-tooltip {
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

    // Lista de pantallas y acciones del menú (Incluye Historial y Clientes)
    const items = [
        { href: "gestion.html", icon: "🧯", label: "Gestión / Carga", type: "link" },
        { href: "consultas.html", icon: "📊", label: "Consultas y Filtros", type: "link" },
        { href: "historial.html", icon: "H", label: "Historial", type: "link", extraClass: "icono-papiro" },
        { href: "importar.html", icon: "📥", label: "Importación Masiva", type: "link" },
        { href: "informes.html", icon: "📑", label: "Informes", type: "link" },
        { href: "clientes.html", icon: "🏢", label: "Clientes", type: "link" },
        { href: "configuracion.html", icon: "⚙️", label: "Configuración", type: "link" },
        { href: "#", icon: "🚪", label: "Cerrar Sesión", type: "logout" }
    ];

    let html = '<div class="vivatec-navbar">';
    items.forEach(item => {
        const esActivo = (item.type === "link" && paginaActual === item.href) ? 'activo' : '';
        const logoutClass = item.type === "logout" ? 'logout' : '';
        const customClass = item.extraClass || '';
        html += `
            <div class="vivatec-nav-item">
                <a href="${item.href}" class="vivatec-nav-link ${esActivo} ${logoutClass} ${customClass}" data-type="${item.type}" title="${item.label}">
                    ${item.icon}
                </a>
                <div class="vivatec-tooltip">${item.label}</div>
            </div>
        `;
    });
    html += '</div>';

    contenedorMenu.innerHTML = html;

    // Navegación directa en un clic
    const links = contenedorMenu.querySelectorAll('.vivatec-nav-link');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const type = this.getAttribute('data-type');
            if (type === "logout") {
                ejecutarCierreSesion();
            } else {
                const destino = this.getAttribute('href');
                if (destino && destino !== "#") {
                    window.location.href = destino;
                }
            }
        });
    });
});

// Función global de cierre de sesión directa (sin confirmación previa)
async function ejecutarCierreSesion() {
    if (typeof _supabase !== 'undefined') {
        await _supabase.auth.signOut();
    }
    window.location.href = "login.html";
}
