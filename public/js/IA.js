function inicializarMovimientoIA(tablero) {
  detenerTimers();
  ai.configurarTablero(tablero);
  if (tablero.turno == tablero.BotAI) {
    timerMovimiento = setTimeout(finMovimientoAI, 500);
    timerPreparacion = setTimeout(computacionAI, 500);
  }
  timerCiclo = setTimeout(avancePosAI, 1);
}
function avancePosAI() {
  if (!ai.avanzarAI(20)) {
    if (timerPreparacion == null) {
      finMovimientoAI();
    } else {
      clearTimeout(timerMovimiento);
      timerMovimiento = null;
    }
    return;
  }
  clearTimeout(timerCiclo);
  timerCiclo = setTimeout(avancePosAI, 1);
}
function computacionAI() {
  if (timerMovimiento == null) {
    finMovimientoAI();
  } else {
    clearTimeout(timerPreparacion);
    timerPreparacion = null;
  }
}
function finMovimientoAI() {
  detenerTimers();
  if (tablero.BotAI != tablero.turno) return;
  if (!tablero.realizarMovimiento(ai.buscarMejorMovimiento())) {
    let contadores = tablero.contarCuadricula();
    let ganador;
    if(contadores[0] === contadores[1]) {
      ganador = 'Empate';
    } else if(contadores[0] > contadores[1]) {
      ganador = 'Computadora';
    } else {
      ganador = 'Jugador';
    }
    document.getElementById('ganador-actual').innerHTML = ganador;
    tablero = new Tablero();
    refrescarTablero(tablero);
    inicializarMovimientoIA(tablero);
    alert(`Ganador: ${ganador}`);
    return;
  }
  refrescarTablero(tablero);
  inicializarMovimientoIA(tablero);
}