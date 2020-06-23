let timerCiclo = null;
let timerMovimiento = null;
let timerPreparacion = null;
let tablero = new Tablero();
let ai = new analizarEspacio();
const celdasHTML = document.querySelectorAll('.celda');
for (let i = 0; i < celdasHTML.length; i++) {
  celdasHTML[i].addEventListener("click", function () {
    clickUsuario(parsearCoordenadas(this));
  });
}
setInterval(() => {
  let contadores = tablero.contarCuadricula();
  let ganador;
  if(contadores[0] === contadores[1]) {
    ganador = 'Empate';
  } else if(contadores[0] > contadores[1]) {
    ganador = 'Computadora';
  } else {
    ganador = 'Jugador';
  }
  if(ai.buscarMejorMovimiento().length === 0) {
    tablero = new Tablero();
    refrescarTablero(tablero);
    inicializarMovimientoIA(tablero);
    alert(`Ganador: ${ganador}`);
  }
}, 1000);
refrescarTablero(tablero);
inicializarMovimientoIA(tablero);