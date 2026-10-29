// =====================================================
// 1. NODOS: cada usuario es un vértice del grafo.
// =====================================================
const usuarios = [
  { nombre: "Ana", color: "#8b5cf6", x: 115, y: 95 },
  { nombre: "Luis", color: "#e878a6", x: 320, y: 65 },
  { nombre: "Sofía", color: "#21b9b1", x: 520, y: 130 },
  { nombre: "Diego", color: "#f2a545", x: 110, y: 325 },
  { nombre: "Valeria", color: "#6787f5", x: 325, y: 345 },
  { nombre: "Mateo", color: "#cc75e9", x: 525, y: 320 }
];

// =====================================================
// 2. GRAFO: lista de adyacencia (objeto de JavaScript).
// Cada propiedad es un nodo y su arreglo contiene
// los nombres de sus amigos (nodos conectados).
// =====================================================
const amistadesIniciales = {
  Ana: ["Luis", "Sofía"],
  Luis: ["Ana", "Diego", "Valeria"],
  Sofía: ["Ana", "Valeria"],
  Diego: ["Luis", "Mateo"],
  Valeria: ["Luis", "Sofía", "Mateo"],
  Mateo: ["Diego", "Valeria"]
};

let grafo = copiarGrafo(amistadesIniciales);
let seleccionado = "Ana";
let celdaSeleccionada = null;

function copiarGrafo(original) {
  const copia = {};
  for (const nombre in original) copia[nombre] = [...original[nombre]];
  return copia;
}

// =====================================================
// 3. AGREGAR VÉRTICES: registrar nuevos usuarios.
// Al crear un usuario también se crea su lista de amigos vacía.
// =====================================================
function agregarUsuario(nombre) {
  nombre = nombre.trim().replace(/\s+/g, " ");
  if (!nombre || !/^[\p{L} ]+$/u.test(nombre) || nombre.length > 18) {
    return "Escribe un nombre válido (solo letras, máximo 18 caracteres).";
  }
  if (usuarios.some(u => u.nombre.toLowerCase() === nombre.toLowerCase())) {
    return "Ese usuario ya existe en el grafo.";
  }
  if (usuarios.length >= 12) return "El simulador admite hasta 12 usuarios para mantener el grafo legible.";

  const colores = ["#f472b6", "#38bdf8", "#facc15", "#34d399", "#fb923c", "#a78bfa"];
  usuarios.push({ nombre, color: colores[(usuarios.length - 6) % colores.length], x: 0, y: 0 });
  grafo[nombre] = []; // Un nuevo nodo empieza sin aristas.

  // Reorganizar los nodos en un círculo para que todos se vean.
  usuarios.forEach((usuario, i) => {
    const angulo = (2 * Math.PI * i / usuarios.length) - Math.PI / 2;
    usuario.x = 320 + 235 * Math.cos(angulo);
    usuario.y = 210 + 150 * Math.sin(angulo);
  });
  return `Se agregó a ${nombre} como nuevo nodo del grafo.`;
}

// =====================================================
// 4. MATRIZ DE ADYACENCIA: transforma el grafo en
// una tabla 2D. 1 = amistad; 0 = sin amistad.
// =====================================================
function crearMatriz() {
  const matriz = [];
  for (const persona of usuarios) {
    const fila = [];
    for (const otra of usuarios) {
      fila.push(grafo[persona.nombre].includes(otra.nombre) ? 1 : 0);
    }
    matriz.push(fila);
  }
  return matriz;
}

// =====================================================
// 5. OPERACIONES DEL GRAFO: agregar/quitar aristas.
// Se modifican AMBAS listas porque la amistad es mutua.
// =====================================================
function agregarAmistad(a, b) {
  if (!grafo[a] || !grafo[b]) return "Selecciona dos usuarios válidos.";
  if (a === b) return "Una persona no puede agregarse a sí misma.";
  if (grafo[a].includes(b)) return "¡Estas personas ya son amigas!";
  grafo[a].push(b);
  grafo[b].push(a);
  return `¡Ahora ${a} y ${b} son amigos!`;
}

function eliminarAmistad(a, b) {
  if (!grafo[a] || !grafo[b]) return "Selecciona dos usuarios válidos.";
  if (!grafo[a].includes(b)) return "No existe una amistad entre esas personas.";
  grafo[a] = grafo[a].filter(nombre => nombre !== b);
  grafo[b] = grafo[b].filter(nombre => nombre !== a);
  return `Se eliminó la amistad entre ${a} y ${b}.`;
}

// =====================================================
// 6. SUGERENCIAS: cuenta amigos en común.
// =====================================================
function sugerirAmigos(nombre) {
  const sugerencias = [];
  for (const usuario of usuarios) {
    const candidato = usuario.nombre;
    if (candidato === nombre || grafo[nombre].includes(candidato)) continue;
    const comunes = grafo[nombre].filter(amigo => grafo[candidato].includes(amigo));
    if (comunes.length > 0) sugerencias.push({ nombre: candidato, comunes: comunes.length });
  }
  return sugerencias.sort((a, b) => b.comunes - a.comunes);
}

// Restaura el estado inicial del grafo.
function restablecerGrafo() {
  usuarios.splice(0, usuarios.length,
    { nombre: "Ana", color: "#8b5cf6", x: 115, y: 95 },
    { nombre: "Luis", color: "#e878a6", x: 320, y: 65 },
    { nombre: "Sofía", color: "#21b9b1", x: 520, y: 130 },
    { nombre: "Diego", color: "#f2a545", x: 110, y: 325 },
    { nombre: "Valeria", color: "#6787f5", x: 325, y: 345 },
    { nombre: "Mateo", color: "#cc75e9", x: 525, y: 320 }
  );
  grafo = copiarGrafo(amistadesIniciales);
  seleccionado = "Ana";
}
