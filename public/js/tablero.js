function Tablero(initial) {

  this.puntuacionJugadorTablero = [
    99, -8, 8, 6, 6, 8, -8, 99,
    -8, -24, -4, -3, -3, -4, -24, -8,
    8, -4, 7, 4, 4, 7, -4, 8,
    6, -3, 4, 0, 0, 4, -3, 6,
    6, -3, 4, 0, 0, 4, -3, 6,
    8, -4, 7, 4, 4, 7, -4, 8,
    -8, -24, -4, -3, -3, -4, -24, -8,
    99, -8, 8, 6, 6, 8, -8, 99
  ];
  this.puntuacionJugador = function puntuacionJugador() {
    let cs = this.contarCuadricula();
    if (cs[0] == 0) return -1000;
    if (cs[1] == 0) return 1000;
    if (cs[2] == 0) return 1000 * (cs[0] - cs[1]);
    let habilitandoPos = this.habilitar();
    let contador = (321 / (habilitandoPos[1] + 2 + this.turno)
      - 321 / (habilitandoPos[0] + 2 - this.turno));
    if (cs[2] < 53 && cs[2] > 14) {
      contador += (cs[1] - cs[0]) * 3;
    } else if (cs[2] < 9) {
      contador += (cs[0] - cs[1]) * 20;
    }
    for (let j = 0; j < 64; ++j) {
      contador += this.estadoTablero[j] * this.puntuacionJugadorTablero[j];
    }
    return contador < 0 ? Math.floor(contador + 0.4) : Math.ceil(contador - 0.4);
  }
  if (!initial) {
    this.BotAI = 1;
    this.turno = -1;
    //posiciones iniciales
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
    this.BotAI = initial.BotAI;
    this.turno = initial.turno;
    this.estadoTablero = initial.estadoTablero.slice();
  }
  this.escalarLinea = function escalarLinea(c, dir, s) {
    let pila = [];
    let scan = [c[0] + dir[0], c[1] + dir[1]];
    while (scan[0] >= 0 && scan[0] <= 7 && scan[1] >= 0 && scan[1] <= 7) {
      if (this.estado(scan) != -s) {
        if (this.estado(scan) == s) return pila;
        break;
      }
      pila.push([scan[0], scan[1]]);
      scan[0] += dir[0];
      scan[1] += dir[1];
    }
    return [];
  }
  this.habilitar = function habilitar() {
    let habilitador = [0, 0];
    for (let x = 0; x < 8; ++x) {
      for (let y = 0; y < 8; ++y) {
        this.habilitarPosiblesJugadas(habilitador, [x, y]);
      }
    }
    return habilitador;
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
        let puntuacionJugador = 2 * this.rotarresultadoado(rotando) +
          this.puntuacionJugadorPosicion(pos) + 15 * Math.random();
        opciones.push([puntuacionJugador, pos]);
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
  this.habilitarJugada = function escalarLinea(c, direccionXY, settear) {
    let scan = [c[0] + direccionXY[0], c[1] + direccionXY[1]];
    if (scan[0] >= 7 || scan[1] >= 7 || scan[1] <= 0 || scan[0] <= 0) {
      return;
    }
    let oponente = this.estado(scan);
    scan[0] += direccionXY[0];
    scan[1] += direccionXY[1];
    while (scan[0] >= 0 && scan[0] <= 7 && scan[1] >= 0 && scan[1] <= 7) {
      let actual = this.estado(scan);
      if (actual != oponente) {
        if (actual == -oponente) {
          settear[(actual + 2) % 3] = 1;
        }
        return;
      }
      scan[0] += direccionXY[0];
      scan[1] += direccionXY[1];
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
  this.realizarMovimiento = function realizarMovimiento(c) {
    if (this.estado(c) != 0) return false;
    let rotadores = this.rotarTodos(c, this.turno);
    if (rotadores.length == 0) return false;
    this.establecerEstado(c, this.turno);
    for (let j = 0; j < rotadores.length; ++j) {
      this.establecerEstado(rotadores[j], this.turno);
    }
    this.turno = -this.turno;
    return true;
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
  this.rotarresultadoado = function rotarresultadoado(rotadores) {
    let puntuacionJugador = 0;
    for (let j = 0; j < rotadores.length; ++j) {
      puntuacionJugador += this.puntuacionJugadorPosicion(rotadores[j]);
    }
    return puntuacionJugador;
  }
  this.estado = function estado(c) {
    return this.estadoTablero[c[0] + 8 * c[1]];
  }
  this.puntuacionJugadorPosicion = function puntuacionJugadorPosicion(c) {
    return this.puntuacionJugadorTablero[c[0] + 8 * c[1]];
  }
  this.establecerEstado = function establecerEstado(c, s) {
    this.estadoTablero[c[0] + 8 * c[1]] = s;
  }
}