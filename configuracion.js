const Configuracion = (() => {
  const rutaActual = (window.location.pathname.split("/").pop() || "").toLowerCase();
  const esAltaCliente = rutaActual === "clientes.html";
  const esGestion = rutaActual.startsWith("gestion");

  function inyectarEstilos() {
    if (document.getElementById("vivatec-estilos-reglas")) return;
    const style = document.createElement("style");
    style.id = "vivatec-estilos-reglas";
    style.textContent = `
      .vivatec-filtro-activo {
        background-color: #fff59d !important;
      }
      .vivatec-lista-predictiva {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 9999;
        background: #fff;
        border: 1px solid #cbd5e1;
        list-style: none;
        margin: 0;
        padding: 0;
        max-height: 200px;
        overflow-y: auto;
      }
      .vivatec-item-predictivo {
        padding: 6px 10px;
        cursor: pointer;
      }
      .vivatec-item-predictivo:first-child,
      .vivatec-item-predictivo:hover {
        background-color: #e2e8f0;
      }
    `;
    document.head.appendChild(style);
  }

  function normalizar(texto) {
    return String(texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function obtenerPatronFecha() {
    return esGestion ? "mm/aa" : "dd/mm/aa";
  }

  function formatearFechaAuto(input) {
    const patron = obtenerPatronFecha();
    const maxDigitos = patron === "mm/aa" ? 4 : 6;
    const digitos = input.value.replace(/\D/g, "").slice(0, maxDigitos);

    if (patron === "mm/aa") {
      input.value = digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos;
    } else if (digitos.length <= 2) {
      input.value = digitos;
    } else if (digitos.length <= 4) {
      input.value = `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
    } else {
      input.value = `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
    }
  }

  function activarFechas(selector) {
    document.querySelectorAll(selector).forEach((input) => {
      input.placeholder = obtenerPatronFecha();
      input.addEventListener("input", () => formatearFechaAuto(input));
    });
  }

  function aplicarEstiloFiltro(elemento, columnaElemento) {
    const activo = String(elemento.value || "").trim().length > 0;
    elemento.classList.toggle("vivatec-filtro-activo", activo);
    if (columnaElemento) {
      columnaElemento.classList.toggle("vivatec-filtro-activo", activo);
    }
  }

  function activarFiltros(selector, tabla = null) {
    document.querySelectorAll(selector).forEach((input) => {
      const actualizar = () => {
        const colIdx = input.dataset.colIndex;
        const columna = tabla && colIdx !== undefined
          ? tabla.querySelector(`th:nth-child(${Number(colIdx) + 1})`)
          : null;
        aplicarEstiloFiltro(input, columna);
        if (tabla && colIdx !== undefined) {
          const activo = String(input.value || "").trim().length > 0;
          tabla.querySelectorAll(`td:nth-child(${Number(colIdx) + 1})`).forEach((td) => {
            td.classList.toggle("vivatec-filtro-activo", activo);
          });
        }
      };
      input.addEventListener("input", actualizar);
      input.addEventListener("change", actualizar);
      actualizar();
    });
  }

  function configurarBuscadorCliente({ input, clientes, onSeleccionar, onRechazarNoRegistrado }) {
    if (!input) return;
    inyectarEstilos();

    const padre = input.parentElement;
    if (padre && getComputedStyle(padre).position === "static") {
      padre.style.position = "relative";
    }

    const listaUl = document.createElement("ul");
    listaUl.className = "vivatec-lista-predictiva";
    listaUl.style.display = "none";
    padre?.appendChild(listaUl);

    let coincidenciasActuales = [];

    function ocultarLista() {
      listaUl.style.display = "none";
      listaUl.innerHTML = "";
    }

    function elegir(cliente) {
      input.value = cliente.nombre;
      ocultarLista();
      onSeleccionar?.(cliente);
    }

    function actualizarLista() {
      const consulta = normalizar(input.value);
      if (!consulta) {
        coincidenciasActuales = [];
        ocultarLista();
        return coincidenciasActuales;
      }

      coincidenciasActuales = clientes.filter((c) => normalizar(c.nombre).includes(consulta));
      listaUl.innerHTML = "";

      coincidenciasActuales.slice(0, 12).forEach((cliente) => {
        const li = document.createElement("li");
        li.className = "vivatec-item-predictivo";
        li.textContent = cliente.nombre;
        li.addEventListener("mousedown", (e) => {
          e.preventDefault();
          elegir(cliente);
        });
        listaUl.appendChild(li);
      });

      listaUl.style.display = coincidenciasActuales.length ? "block" : "none";
      return coincidenciasActuales;
    }

    input.addEventListener("input", actualizarLista);

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const lista = actualizarLista();
        if (lista.length > 0) {
          e.preventDefault();
          elegir(lista[0]);
        } else if (!esAltaCliente) {
          e.preventDefault();
          onRechazarNoRegistrado?.(input.value);
        }
      } else if (e.key === "Escape") {
        ocultarLista();
      }
    });

    input.addEventListener("blur", () => {
      setTimeout(ocultarLista, 120);
      if (esAltaCliente) return;

      const exacta = clientes.find((c) => normalizar(c.nombre) === normalizar(input.value));
      if (exacta) {
        input.value = exacta.nombre;
        onSeleccionar?.(exacta);
      } else if (String(input.value || "").trim() !== "") {
        onRechazarNoRegistrado?.(input.value);
      }
    });
  }

  return {
    esAltaCliente,
    esGestion,
    normalizar,
    obtenerPatronFecha,
    formatearFechaAuto,
    activarFechas,
    aplicarEstiloFiltro,
    activarFiltros,
    configurarBuscadorCliente
  };
})();
