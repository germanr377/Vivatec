const VivatecReglas = (() => {
  const rutaActual = (window.location.pathname.split("/").pop() || "").toLowerCase();
  const esAltaCliente = rutaActual === "clientes.html";
  const esGestion = rutaActual.startsWith("gestion");

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

    let salida = "";
    if (patron === "mm/aa") {
      salida = digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos;
    } else {
      if (digitos.length <= 2) salida = digitos;
      else if (digitos.length <= 4) salida = `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
      else salida = `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
    }
    input.value = salida;
  }

  function aplicarEstiloFiltro(elemento, columnaElemento) {
    const activo = String(elemento.value || "").trim().length > 0;
    elemento.classList.toggle("vivatec-filtro-activo", activo);
    if (columnaElemento) {
      columnaElemento.classList.toggle("vivatec-filtro-activo", activo);
    }
  }

  function configurarBuscadorCliente({ input, clientes, onSeleccionar, onRechazarNoRegistrado }) {
    let coincidenciasActuales = [];

    function actualizarLista() {
      const consulta = normalizar(input.value);
      coincidenciasActuales = clientes.filter((c) => normalizar(c.nombre).includes(consulta));
      return coincidenciasActuales;
    }

    input.addEventListener("input", () => {
      actualizarLista();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const lista = actualizarLista();
        if (lista.length > 0) {
          e.preventDefault();
          input.value = lista[0].nombre;
          onSeleccionar?.(lista[0]);
        } else if (!esAltaCliente) {
          e.preventDefault();
          onRechazarNoRegistrado?.(input.value);
        }
      }
    });

    input.addEventListener("blur", () => {
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
    aplicarEstiloFiltro,
    configurarBuscadorCliente
  };
})();
