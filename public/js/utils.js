function parsearCoordenadas(celda) {
  return [parseInt(celda.id.substr(1, 1)), parseInt(celda.id.substr(2, 1))];
}
function detenerTimers() {
  clearTimeout(timerMovimiento);
  clearTimeout(timerPreparacion);
  clearTimeout(timerCiclo);
  timerMovimiento = null;
  timerPreparacion = null;
  timerCiclo = null;
}
function mostrarMarcador(tablero) {
  let contadores = tablero.contarCuadricula();
  document.getElementById('puntuaje-blancos').innerHTML = contadores[0];
  document.getElementById('puntuaje-negros').innerHTML = contadores[1];
  let ganador;
  if(contadores[0] === contadores[1]) {
    ganador = 'Empate';
  } else if(contadores[0] > contadores[1]) {
    ganador = 'Computadora';
  } else {
    ganador = 'Jugador';
  }
  document.getElementById('ganador-actual').innerHTML = ganador;
}
function refrescarTablero(tablero) {
  celdasHTML.forEach((element) => {
    if(tablero.estado(parsearCoordenadas(element)) === 0) {
      element.innerHTML = '';
    } else if(tablero.estado(parsearCoordenadas(element)) === 1) {
      element.innerHTML = '<div class="ficha blanca"></div>';
    } else {
      element.innerHTML = '<div class="ficha negra"></div>';
    }
  });
  mostrarMarcador(tablero);
}
function buscarEnPila(tablero, choice) {
  this.pila = [new nodo(tablero, 2, choice, null, null)];
  this.mejorMovimiento = this.pila[0].movimientosHijo[0];
  this.mejorProfundidad = 1;
  this.piezaIgualA = function piezaIgualA(b) {
    if (this.pila.length == 0) return false;
    return this.pila[0].tablero.piezaIgualA(b);
  }
  this.obtenerMovimientoTop = function obtenerMovimientoTop() {
    if (this.pila.length > 0 && this.pila[0].mejorMovimiento) {
      return this.pila[0].mejorMovimiento;
    } else {
      return this.mejorMovimiento;
    }
  }
  this.avanzarMovimiento = function avanzarMovimiento() {
    if (this.pila.length == 0) return false;
    let n = this.pila[this.pila.length - 1];
    let c = n.siguienteNodoHijo();
    if (c !== null) {
      this.pila.push(c);
    } else {
      this.pila.pop();
      if (this.pila.length > 0) {
        this.pila[this.pila.length - 1].terminarNodosHijo(n.move, n.mejor, n.mejorseq);
      } else {
        this.mejorMovimiento = n.mejorseq[0];
        this.mejorProfundidad = n.profundidad;
        if (!n.mantener() && n.mejor < 1000 && n.mejor > -1000) {
          n.avanzarEnProfundidad();
          this.pila.push(n);
        } else {
          this.pila.push(n);
          return false;
        }
      }
    }
    return true;
  }
}
function analizarEspacio() {
  this.pilas = []
  this.pilaActual = 0;

  this.buscarMejorMovimiento = function buscarMejorMovimiento() {
    if (this.pilas.length == 0) return [];
    return this.pilas[0].obtenerMovimientoTop();
  }
  this.buscarMejorProfundidad = function buscarMejorProfundidad() {
    if (this.pilas.length == 0) return 0;
    return this.pilas[0].mejorProfundidad;
  }
  this.configurarTablero = function settablero(tablero) {
    if (tablero.turno == tablero.BotAI) {
      let newpila = null;
      for (let j = 0; j < this.pilas.length; ++j) {
        if (this.pilas[j].piezaIgualA(tablero)) {
          newpila = this.pilas[j];
          break;
        }
      }
      if (newpila == null) {
        newpila = new buscarEnPila(tablero, null);
      }
      this.pilas = [newpila];
    } else {
      this.pilas = [];
      let opciones = tablero.buscarMejoresMovimientos();
      for (let j = 0; j < opciones.length; ++j) {
        this.pilas.push(new buscarEnPila(tablero, opciones[j]));
      }
    }
    this.pilaActual = 0;
  }
  this.avanzarAI = function avanzarMovimiento(iteraciones) {
    if (this.pilas.length == 0) return false;
    let finished = 0;
    while (iteraciones > 0) {
      let buscarEnPila = this.pilas[this.pilaActual++];
      if (this.pilaActual >= this.pilas.length) this.pilaActual = 0;
      while (iteraciones > 0) {
        if (!buscarEnPila.avanzarMovimiento()) {
          finished += 1;
          break;
        }
        iteraciones -= 1;
      }
      if (finished >= this.pilas.length) return false;
    }
    return true;
  }

}
function clickUsuario(c) {
  if (tablero.BotAI == tablero.turno) return;
  if (tablero.realizarMovimiento(c)) {
    refrescarTablero(tablero);
    inicializarMovimientoIA(tablero);
  }
}