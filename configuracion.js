const Configuracion = (() => {
  const rutaActual = (window.location.pathname.split("/").pop() || "").toLowerCase();
  const esAltaCliente = rutaActual === "clientes.html" || rutaActual.startsWith("clientes");
  const esGestion = rutaActual.startsWith("gestion");

  function inyectarEstilos() {
    if (document.getElementById("vivatec-estilos-reglas")) return;
    const style = document.createElement("style");
    style.id = "vivatec-estilos-reglas";
    style.textContent = `
      .vivatec-filtro-activo {
        background-color: #fff59d !important;
        transition: background-color 0.15s ease;
      }
      .vivatec-lista-predictiva {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 9999;
        background: #fff;
        border: 1px solid #cbd5e1;
        border-top: none;
        border-radius: 0 0 6px 6px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
        list-style: none;
        margin: 0;
        padding: 0;
        max-height: 210px;
        overflow-y: auto;
        display: none;
      }
      .vivatec-item-predictivo {
        padding: 8px 12px;
        cursor: pointer;
        font-size: 14px;
        border-bottom: 1px solid #f1f5f9;
      }
      .vivatec-item-predictivo:last-child {
        border-bottom: none;
      }
      .vivatec-item-predictivo:first-child,
      .vivatec-item-predictivo:hover,
      .vivatec-item-predictivo.activo {
        background-color: #e2e8f0;
        font-weight: 600;
      }
      .vivatec-sub-predictivo {
        font-size: 12px;
        color: #64748b;
        font-weight: normal;
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
    if (!input || typeof input.value !== "string") return;
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

  function aListaElementos(selectorOElementos) {
    const raw = typeof selectorOElementos === "string"
      ? Array.from(document.querySelectorAll(selectorOElementos))
      : Array.isArray(selectorOElementos)
        ? selectorOElementos
        : selectorOElementos
          ? [selectorOElementos]
          : [];

    return raw.filter((el) => el && typeof el === "object" && el.dataset);
  }

  function activarFechas(selectorOElementos) {
    const elementos = aListaElementos(selectorOElementos);
    const patron = obtenerPatronFecha();

    elementos.forEach((input) => {
      input.placeholder = patron.toUpperCase();
      input.maxLength = patron.length;
      if (!input.dataset.vivatecFechaBind) {
        input.dataset.vivatecFechaBind = "1";
        input.addEventListener("input", () => formatearFechaAuto(input));
      }
      formatearFechaAuto(input);
    });
  }

  function aplicarEstiloFiltro(elemento, columnaElemento = null) {
    if (!elemento || !elemento.classList) return;
    const activo = String(elemento.value || "").trim().length > 0;
    elemento.classList.toggle("vivatec-filtro-activo", activo);
    if (columnaElemento && columnaElemento.classList) {
      columnaElemento.classList.toggle("vivatec-filtro-activo", activo);
    }
  }

  function activarFiltros(selector, tabla = null) {
    const elementos = aListaElementos(selector);

    elementos.forEach((input) => {
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

      if (!input.dataset.vivatecFiltroBind) {
        input.dataset.vivatecFiltroBind = "1";
        input.addEventListener("input", actualizar);
        input.addEventListener("change", actualizar);
      }
      actualizar();
    });
  }

  function configurarBuscadorCliente({
    input,
    clientes = [],
    onSeleccionar,
    onRechazarNoRegistrado
  }) {
    if (!input) return { actualizarClientes: () => {}, cerrar: () => {} };
    inyectarEstilos();

    let listaClientes = Array.isArray(clientes) ? clientes : [];
    const padre = input.parentElement;
    if (padre && getComputedStyle(padre).position === "static") {
      padre.style.position = "relative";
    }

    const listaUl = document.createElement("ul");
    listaUl.className = "vivatec-lista-predictiva";
    padre?.appendChild(listaUl);

    let coincidenciasActuales = [];
    let indiceActivo = 0;
    let validandoBlur = false;

    function obtenerNombre(c) {
      return typeof c === "string" ? c : String(c?.nombre || c?.nombre_cliente || "");
    }

    function obtenerRazon(c) {
      return typeof c === "string" ? "" : String(c?.razon || c?.razon_social || "");
    }

    function ocultarLista() {
      listaUl.style.display = "none";
      listaUl.innerHTML = "";
      coincidenciasActuales = [];
      indiceActivo = 0;
    }

    function resaltarItem() {
      const nodos = listaUl.querySelectorAll(".vivatec-item-predictivo");
      nodos.forEach((li, idx) => {
        li.classList.toggle("activo", idx === indiceActivo);
        if (idx === indiceActivo) li.scrollIntoView({ block: "nearest" });
      });
    }

    function elegir(cliente) {
      input.value = obtenerNombre(cliente);
      ocultarLista();
      onSeleccionar?.(cliente);
    }

    function buscarCoincidencias(texto) {
      const consulta = normalizar(texto);
      if (!consulta) return [];
      const empieza = listaClientes.filter((c) => normalizar(obtenerNombre(c)).startsWith(consulta));
      const incluye = listaClientes.filter((c) => {
        const nom = normalizar(obtenerNombre(c));
        const raz = normalizar(obtenerRazon(c));
        return !nom.startsWith(consulta) && (nom.includes(consulta) || raz.includes(consulta));
      });
      return [...empieza, ...incluye];
    }

    function actualizarLista() {
      coincidenciasActuales = buscarCoincidencias(input.value);
      indiceActivo = 0;
      listaUl.innerHTML = "";

      if (coincidenciasActuales.length === 0) {
        listaUl.style.display = "none";
        return coincidenciasActuales;
      }

      coincidenciasActuales.slice(0, 15).forEach((cliente, idx) => {
        const li = document.createElement("li");
        li.className = "vivatec-item-predictivo" + (idx === 0 ? " activo" : "");
        const razon = obtenerRazon(cliente);
        li.innerHTML = obtenerNombre(cliente) + (razon ? ` <span class="vivatec-sub-predictivo">(${razon})</span>` : "");
        li.addEventListener("mousedown", (e) => {
          e.preventDefault();
          elegir(cliente);
        });
        li.addEventListener("mouseenter", () => {
          indiceActivo = idx;
          resaltarItem();
        });
        listaUl.appendChild(li);
      });

      listaUl.style.display = "block";
      return coincidenciasActuales;
    }

    input.addEventListener("input", actualizarLista);
    input.addEventListener("focus", () => {
      if (normalizar(input.value)) actualizarLista();
    });

    input.addEventListener("keydown", (e) => {
      const visible = listaUl.style.display === "block";

      if (e.key === "ArrowDown" && visible && coincidenciasActuales.length > 0) {
        e.preventDefault();
        indiceActivo = (indiceActivo + 1) % Math.min(coincidenciasActuales.length, 15);
        resaltarItem();
      } else if (e.key === "ArrowUp" && visible && coincidenciasActuales.length > 0) {
        e.preventDefault();
        indiceActivo = (indiceActivo - 1 + Math.min(coincidenciasActuales.length, 15)) % Math.min(coincidenciasActuales.length, 15);
        resaltarItem();
      } else if (e.key === "Enter") {
        const lista = visible && coincidenciasActuales.length > 0 ? coincidenciasActuales : actualizarLista();
        if (lista.length > 0) {
          e.preventDefault();
          elegir(lista[indiceActivo] || lista[0]);
        } else if (!esAltaCliente && String(input.value || "").trim() !== "") {
          e.preventDefault();
          onRechazarNoRegistrado?.(input.value);
        }
      } else if (e.key === "Escape") {
        ocultarLista();
      }
    });

    input.addEventListener("blur", () => {
      if (validandoBlur) return;
      setTimeout(() => {
        ocultarLista();
        if (esAltaCliente || validandoBlur) return;

        const valorNorm = normalizar(input.value);
        if (!valorNorm) return;

        const exacta = listaClientes.find((c) => normalizar(obtenerNombre(c)) === valorNorm);
        if (exacta) {
          input.value = obtenerNombre(exacta);
          onSeleccionar?.(exacta);
        } else {
          validandoBlur = true;
          try {
            onRechazarNoRegistrado?.(input.value);
          } finally {
            setTimeout(() => { validandoBlur = false; }, 200);
          }
        }
      }, 150);
    });

    return {
      actualizarClientes(nuevosClientes) {
        listaClientes = Array.isArray(nuevosClientes) ? nuevosClientes : [];
        if (normalizar(input.value) && document.activeElement === input) {
          actualizarLista();
        }
      },
      cerrar: ocultarLista
    };
  }

  document.addEventListener("DOMContentLoaded", inyectarEstilos);

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
