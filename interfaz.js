// =====================================================
// 6. INTERFAZ: dibuja el grafo y la matriz en pantalla.
// =====================================================
function dibujarGrafo() {
  const svg = document.getElementById("grafo");
  svg.innerHTML = "";
  const ns = "http://www.w3.org/2000/svg";

  // Aristas: dibujar una sola línea por cada amistad.
  for (const persona of usuarios) {
    for (const amigo of grafo[persona.nombre]) {
      if (persona.nombre < amigo) {
        const otro = usuarios.find(u => u.nombre === amigo);
        const linea = document.createElementNS(ns, "line");
        linea.setAttribute("x1", persona.x);
        linea.setAttribute("y1", persona.y);
        linea.setAttribute("x2", otro.x);
        linea.setAttribute("y2", otro.y);
        linea.setAttribute("class", "edge" + (persona.nombre === seleccionado || amigo === seleccionado ? " highlight" : ""));
        svg.appendChild(linea);
      }
    }
  }

  // Nodos: círculo, inicial y nombre de cada persona.
  for (const persona of usuarios) {
    const grupo = document.createElementNS(ns, "g");
    grupo.setAttribute("class", "node" + (persona.nombre === seleccionado ? " selected" : ""));
    const circulo = document.createElementNS(ns, "circle");
    circulo.setAttribute("cx", persona.x);
    circulo.setAttribute("cy", persona.y);
    circulo.setAttribute("r", 30);
    circulo.setAttribute("fill", persona.color);
    const inicial = document.createElementNS(ns, "text");
    inicial.setAttribute("x", persona.x);
    inicial.setAttribute("y", persona.y + 6);
    inicial.setAttribute("font-size", "19");
    inicial.textContent = persona.nombre[0];
    const nombre = document.createElementNS(ns, "text");
    nombre.setAttribute("class", "node-name");
    nombre.setAttribute("x", persona.x);
    nombre.setAttribute("y", persona.y + 49);
    nombre.textContent = persona.nombre;
    grupo.append(circulo, inicial, nombre);
    grupo.addEventListener("click", () => {
      seleccionado = persona.nombre;
      document.getElementById("usuario").value = seleccionado;
      actualizarPantalla();
    });
    svg.appendChild(grupo);
  }
}

function dibujarMatriz() {
  const matriz = crearMatriz();
  const tabla = document.getElementById("matriz");
  tabla.innerHTML = "";
  const cabecera = document.createElement("tr");
  cabecera.innerHTML = "<th></th>" + usuarios.map(u => `<th>${u.nombre}</th>`).join("");
  tabla.appendChild(cabecera);

  for (let i = 0; i < usuarios.length; i++) {
    const fila = document.createElement("tr");
    fila.innerHTML = `<th>${usuarios[i].nombre}</th>`;
    for (let j = 0; j < usuarios.length; j++) {
      const celda = document.createElement("td");
      celda.textContent = matriz[i][j];
      if (matriz[i][j] === 1) celda.classList.add("one");
      if (celdaSeleccionada && celdaSeleccionada[0] === i && celdaSeleccionada[1] === j) celda.classList.add("active");
      celda.addEventListener("click", () => {
        celdaSeleccionada = [i, j];
        const a = usuarios[i].nombre, b = usuarios[j].nombre;
        document.getElementById("explicacionMatriz").textContent =
          i === j ? `${a} consigo mismo: 0 (no se cuenta como amistad).` :
          matriz[i][j] === 1 ? `${a} y ${b} SÍ son amigos. Por eso la celda vale 1.` :
          `${a} y ${b} NO son amigos. Por eso la celda vale 0.`;
        dibujarMatriz();
      });
      fila.appendChild(celda);
    }
    tabla.appendChild(fila);
  }
}

function actualizarPantalla() {
  const persona = usuarios.find(u => u.nombre === seleccionado);
  const sugerencias = sugerirAmigos(seleccionado);
  document.getElementById("tamanoMatriz").textContent = `${usuarios.length} × ${usuarios.length}`;
  document.getElementById("perfil").innerHTML = `<span class="avatar" style="background:${persona.color}">${seleccionado[0]}</span><div><strong>${seleccionado}</strong><small>● Perfil activo en la red</small></div>`;
  document.getElementById("numeroAmigos").textContent = grafo[seleccionado].length;
  document.getElementById("listaAmigos").innerHTML = grafo[seleccionado].length
    ? grafo[seleccionado].map(nombre => `<span class="chip">♥ ${nombre}</span>`).join("") : '<span class="empty">Todavía no tiene amistades.</span>';
  document.getElementById("sugerencias").innerHTML = sugerencias.length
    ? sugerencias.map(s => `<div class="suggestion"><b>${s.nombre}</b><span>${s.comunes} en común</span></div>`).join("")
    : '<span class="empty">No hay sugerencias por ahora.</span>';
  document.getElementById("totalUsuarios").textContent = usuarios.length;
  document.getElementById("totalAmistades").textContent = Object.values(grafo).reduce((n, amigos) => n + amigos.length, 0) / 2;
  document.getElementById("totalSugerencias").textContent = sugerencias.length;
  dibujarGrafo();
  dibujarMatriz();
}

const selector = document.getElementById("usuario");
const otroSelector = document.getElementById("otroUsuario");

// Actualiza los menús cuando se incorpora un vértice.
function actualizarSelectores() {
  const otroAnterior = otroSelector.value;
  selector.innerHTML = "";
  otroSelector.innerHTML = "";
  for (const usuario of usuarios) {
    selector.add(new Option(usuario.nombre, usuario.nombre));
    otroSelector.add(new Option(usuario.nombre, usuario.nombre));
  }
  selector.value = seleccionado;
  otroSelector.value = usuarios.some(u => u.nombre === otroAnterior)
    ? otroAnterior : "Mateo";
}
actualizarSelectores();
selector.addEventListener("change", () => {
  seleccionado = selector.value;
  actualizarPantalla();
});

document.getElementById("crearUsuario").addEventListener("click", () => {
  const campo = document.getElementById("nuevoUsuario");
  const cantidadAnterior = usuarios.length;
  const mensaje = agregarUsuario(campo.value);
  document.getElementById("mensaje").textContent = mensaje;
  if (usuarios.length > cantidadAnterior) {
    seleccionado = usuarios[usuarios.length - 1].nombre;
    celdaSeleccionada = null;
    campo.value = "";
    actualizarSelectores();
    document.getElementById("explicacionMatriz").textContent =
      "Se agregó una fila y una columna para el nuevo usuario.";
  }
  actualizarPantalla();
});
document.getElementById("nuevoUsuario").addEventListener("keydown", e => {
  if (e.key === "Enter") document.getElementById("crearUsuario").click();
});

document.getElementById("agregar").addEventListener("click", () => {
  const mensaje = agregarAmistad(seleccionado, otroSelector.value);
  document.getElementById("mensaje").textContent = mensaje;
  actualizarPantalla();
});
document.getElementById("eliminar").addEventListener("click", () => {
  const mensaje = eliminarAmistad(seleccionado, otroSelector.value);
  document.getElementById("mensaje").textContent = mensaje;
  actualizarPantalla();
});
document.getElementById("restablecer").addEventListener("click", () => {
  restablecerGrafo();
  actualizarSelectores();
  celdaSeleccionada = null;
  document.getElementById("mensaje").textContent = "Se restauraron los seis usuarios y sus amistades originales.";
  document.getElementById("explicacionMatriz").textContent = "Selecciona una celda para ver qué significa.";
  actualizarPantalla();
});
actualizarPantalla();
