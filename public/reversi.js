let timerCiclo = null;
let timerMovimiento = null;
let timerPreparacion = null;
const celdasHTML = document.querySelectorAll('.celda');
for (let i = 0; i < celdasHTML.length; i++) {
  celdasHTML[i].addEventListener("click", function () {
    clickUsuario(parsearCoordenadas(this));
  });
}
function parsearCoordenadas(celda) {
  return [parseInt(celda.id.substr(1, 1)), parseInt(celda.id.substr(2, 1))];
}
let tablero = new Tablero();
let ai = new analizarEspacio();
refrescarTablero(tablero);
inicializarMovimientoIA(tablero);
function inicializarMovimientoIA(board) {
  detenerTimers();
  ai.configurarTablero(board);
  if (board.turno == board.BotAI) {
    let restante = tablero.contarCuadricula()[2];
    let ms = 500 + (64 - restante) * 150;
    timerMovimiento = setTimeout(finMovimientoAI, ms);
    timerPreparacion = setTimeout(computacionAI, 1000);
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
    console.log('error ' + ai.buscarMejorMovimiento());
    return;
  }
  refrescarTablero(tablero);
  inicializarMovimientoIA(tablero);
}
function detenerTimers() {
  clearTimeout(timerMovimiento);
  clearTimeout(timerPreparacion);
  clearTimeout(timerCiclo);
  timerMovimiento = null;
  timerPreparacion = null;
  timerCiclo = null;
}
function mostrarMarcador(board) {
  let contadores = board.contarCuadricula();
  document.getElementById('puntuaje-blancos').innerHTML = contadores[0];
  document.getElementById('puntuaje-negros').innerHTML = contadores[1];
}
function refrescarTablero(board) {
  celdasHTML.forEach((element) => {
    if(board.estado(parsearCoordenadas(element)) === 0) {
      element.innerHTML = '';
    } else if(board.estado(parsearCoordenadas(element)) === 1) {
      element.innerHTML = '<div class="ficha blanca"></div>';
    } else {
      element.innerHTML = '<div class="ficha negra"></div>';
    }
  });
  mostrarMarcador(board);
}
function buscarEnPila(board, choice) {
  this.pila = [new nodo(board, 2, choice, null, null)];
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

  this.buscarMejorMovimiento = function bestmove() {
    if (this.pilas.length == 0) return [];
    return this.pilas[0].obtenerMovimientoTop();
  }
  this.buscarMejorProfundidad = function bestprofundidad() {
    if (this.pilas.length == 0) return 0;
    return this.pilas[0].mejorProfundidad;
  }
  this.configurarTablero = function setboard(board) {
    if (board.turno == board.BotAI) {
      let newpila = null;
      for (let j = 0; j < this.pilas.length; ++j) {
        if (this.pilas[j].piezaIgualA(board)) {
          newpila = this.pilas[j];
          break;
        }
      }
      if (newpila == null) {
        newpila = new buscarEnPila(board, null);
      }
      this.pilas = [newpila];
    } else {
      this.pilas = [];
      let opciones = board.buscarMejoresMovimientos();
      for (let j = 0; j < opciones.length; ++j) {
        this.pilas.push(new buscarEnPila(board, opciones[j]));
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
function nodo(b, d, m, a, f) {
  this.move = m;
  this.tablero = new Tablero(b);
  if (m !== null) this.tablero.realizarMovimiento(m);
  this.profundidad = d;
  let promover = (f != null && f.length > 0) ? f.shift() : null;
  this.first = f;
  this.movimientosHijo = (d <= 0 ? [] : b.buscarMejoresMovimientos(promover));
  this.adversario = a;
  this.mejor = (d == 0 ? this.tablero.score() : null);
  this.mejorseq = null;
  this.mantener = function mantener() {
    if (this.mejorseq == null || this.mejorseq.length < 2) return false;
    return this.mejorseq[this.mejorseq.length - 1].length == 0 &&
      this.mejorseq[this.mejorseq.length - 2].length == 0;
  }
  this.buscarMejor = function buscarMejor(s1, s2) {
    if (s1 === null) return false;
    if (s2 === null) return true;
    if (this.tablero.turno == 1) {
      return s1 > s2;
    } else {
      return s1 < s2;
    }
  }
  this.terminarNodosHijo = function terminarNodosHijo(move, score, seq) {
    if (this.buscarMejor(score, this.mejor)) {
      this.mejor = score;
      this.mejorseq = [move];
      if (seq !== null) {
        this.mejorseq = this.mejorseq.concat(seq);
      }
      if (this.adversario !== null && !this.buscarMejor(this.adversario, score)) {
        this.movimientosHijo.length = 0;
      }
    }
  }
  this.avanzarEnProfundidad = function avanzarEnProfundidad() {
    this.profundidad += 1;
    this.first = this.mejorseq;
    this.movimientosHijo = this.tablero.buscarMejoresMovimientos(this.first.shift());
    this.mejor = null;
  }
  this.siguienteNodoHijo = function siguienteNodoHijo() {
    if (0 == this.movimientosHijo.length) return null;
    return new nodo(
      this.tablero,
      this.profundidad - 1,
      this.movimientosHijo.shift(),
      this.mejor,
      this.first);
    this.first = null;
  }


}
function Tablero(orig) {
  if (!orig) {
    this.BotAI = 1;
    this.turno = -1;
    this.estadoTablero = [
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 1, -1, 0, 0, 0,
      0, 0, 0, -1, 1, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0
    ];
  } else 
    {
    this.BotAI = orig.BotAI;
    this.turno = orig.turno;
    this.estadoTablero = orig.estadoTablero.slice();
  }
  this.scoreTablero = [
    99, -8, 8, 6, 6, 8, -8, 99,
    -8, -24, -4, -3, -3, -4, -24, -8,
    8, -4, 7, 4, 4, 7, -4, 8,
    6, -3, 4, 0, 0, 4, -3, 6,
    6, -3, 4, 0, 0, 4, -3, 6,
    8, -4, 7, 4, 4, 7, -4, 8,
    -8, -24, -4, -3, -3, -4, -24, -8,
    99, -8, 8, 6, 6, 8, -8, 99
  ];
  this.score = function score() {
    let cs = this.contarCuadricula();
    if (cs[0] == 0) return -1000;
    if (cs[1] == 0) return 1000;
    if (cs[2] == 0) return 1000 * (cs[0] - cs[1]);
    let lib = this.liberties();
    let poscount = (321 / (lib[1] + 2 + this.turno)
      - 321 / (lib[0] + 2 - this.turno));
    if (cs[2] < 53 && cs[2] > 14) {
      poscount += (cs[1] - cs[0]) * 3;
    } else if (cs[2] < 9) {
      poscount += (cs[0] - cs[1]) * 20;
    }
    for (let j = 0; j < 64; ++j) {
      poscount += this.estadoTablero[j] * this.scoreTablero[j];
    }
    return poscount < 0 ? Math.floor(poscount + 0.4) : Math.ceil(poscount - 0.4);
  }
  this.escalarLinea = function escalarLinea(c, dir, s) {
    let accumulate = [];
    let scan = [c[0] + dir[0], c[1] + dir[1]];
    while (scan[0] >= 0 && scan[0] <= 7 && scan[1] >= 0 && scan[1] <= 7) {
      if (this.estado(scan) != -s) {
        if (this.estado(scan) == s) return accumulate;
        break;
      }
      accumulate.push([scan[0], scan[1]]);
      scan[0] += dir[0];
      scan[1] += dir[1];
    }
    return [];
  }
  this.liberties = function liberties() {
    let lib = [0, 0];
    for (let x = 0; x < 8; ++x) {
      for (let y = 0; y < 8; ++y) {
        this.habilitarPosiblesJugadas(lib, [x, y]);
      }
    }
    return lib;
  }
  this.buscarMejoresMovimientos = function buscarMejoresMovimientos(promover) {
    let opciones = [];
    let promoverMovimiento = false;
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        let pos = [x, y];
        if (this.estado(pos) != 0) continue;
        let rotando = this.rotarTodos(pos, this.turno);
        if (rotando.length == 0) continue;
        if (promover && pos[0] == promover[0] && pos[1] == promover[1]) {
          promoverMovimiento = true;
          continue;
        }
        let score = 2 * this.rotarresultadoado(rotando) +
          this.scorePosicion(pos) + 15 * Math.random();
        opciones.push([score, pos]);
      }
    }
    opciones.sort(function (s, t) {
      return t[0] - s[0];
    });
    let resultado = [];
    if (promoverMovimiento) resultado.push(promover);
    for (let j = 0; j < opciones.length; ++j) resultado.push(opciones[j][1]);
    if (resultado.length == 0) resultado.push([]);
    return resultado;
  }
  this.contarCuadricula = function contarCuadricula() {
    let contadores = [0, 0, 0];
    for (let j = 0; j < 64; ++j) {
      let s = this.estadoTablero[j];
      contadores[(s + 2) % 3] += 1;
    }
    return contadores;
  }
  this.habilitarJugada = function escalarLinea(c, dir, settear) {
    let scan = [c[0] + dir[0], c[1] + dir[1]];
    if (scan[0] <= 0 || scan[0] >= 7 || scan[1] <= 0 || scan[1] >= 7) {
      return;
    }
    let oponente = this.estado(scan);
    scan[0] += dir[0];
    scan[1] += dir[1];
    while (scan[0] >= 0 && scan[0] <= 7 && scan[1] >= 0 && scan[1] <= 7) {
      let actual = this.estado(scan);
      if (actual != oponente) {
        if (actual == -oponente) {
          settear[(actual + 2) % 3] = 1;
        }
        return;
      }
      scan[0] += dir[0];
      scan[1] += dir[1];
    }
    return;
  }
  this.rotarTodos = function rotarTodos(c, s) {
    let rotaciones = [].concat(
      this.escalarLinea(c, [-1, -1], s),
      this.escalarLinea(c, [0, -1], s),
      this.escalarLinea(c, [1, -1], s),
      this.escalarLinea(c, [-1, 0], s),
      this.escalarLinea(c, [1, 0], s),
      this.escalarLinea(c, [-1, 1], s),
      this.escalarLinea(c, [0, 1], s),
      this.escalarLinea(c, [1, 1], s)
    );
    return rotaciones;
  }
  this.piezaIgualA = function piezaIgualA(b) {
    if (this.turno != b.turno) {
      return false;
    }
    if (this.BotAI != b.BotAI) {
      return false;
    }
    for (let j = 0; j < 64; ++j) {
      if (this.estadoTablero[j] != b.estadoTablero[j]) {
        return false;
      }
    }
    return true;
  }
  this.realizarMovimiento = function domove(c) {
    if (c.length == 0) {
      this.pass();
      return true;
    }
    if (this.estado(c) != 0) return false;
    let flips = this.rotarTodos(c, this.turno);
    if (flips.length == 0) return false;
    this.establecerEstado(c, this.turno);
    for (let j = 0; j < flips.length; ++j) {
      this.establecerEstado(flips[j], this.turno);
    }
    this.turno = -this.turno;
    return true;
  }
  this.pass = function pass() {
    this.turno = -this.turno;
  }
  this.habilitarPosiblesJugadas = function habilitarPosiblesJugadas(lib, c) {
    let settear = [0, 0];
    this.habilitarJugada(c, [-1, -1], settear);
    this.habilitarJugada(c, [0, -1], settear);
    this.habilitarJugada(c, [1, -1], settear);
    this.habilitarJugada(c, [-1, 0], settear);
    this.habilitarJugada(c, [1, 0], settear);
    this.habilitarJugada(c, [-1, 1], settear);
    this.habilitarJugada(c, [0, 1], settear);
    this.habilitarJugada(c, [1, 1], settear);
    lib[0] += settear[0];
    lib[1] += settear[1];
  }
  this.rotarresultadoado = function rotarresultadoado(flips) {
    let score = 0;
    for (let j = 0; j < flips.length; ++j) {
      score += this.scorePosicion(flips[j]);
    }
    return score;
  }
  this.estado = function estado(c) {
    return this.estadoTablero[c[0] + 8 * c[1]];
  }
  this.scorePosicion = function scorePosicion(c) {
    return this.scoreTablero[c[0] + 8 * c[1]];
  }
  this.establecerEstado = function establecerEstado(c, s) {
    this.estadoTablero[c[0] + 8 * c[1]] = s;
  }
}