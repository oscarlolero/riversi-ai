function nodo(tableroObj, movimientoInicial, movimiento, oponente, temporal) {
  this.move = movimiento;
  this.tablero = new Tablero(tableroObj);
  if (movimiento !== null) this.tablero.realizarMovimiento(movimiento);
  this.profundidad = movimientoInicial;
  let promover = (temporal != null && temporal.length > 0) ? temporal.shift() : null;
  this.primerJugada = temporal;
  this.movimientosHijo = (movimientoInicial <= 0 ? [] : tableroObj.buscarMejoresMovimientos(promover));
  this.adversario = oponente;
  this.mejor = (movimientoInicial == 0 ? this.tablero.puntuacionJugador() : null);
  this.mejorseq = null;
  this.avanzarEnProfundidad = function avanzarEnProfundidad() {
    this.profundidad += 1;
    this.primerJugada = this.mejorseq;
    this.movimientosHijo = this.tablero.buscarMejoresMovimientos(this.primerJugada.shift());
    this.mejor = null;
  }
  this.buscarMejor = function buscarMejor(jugada1, jugada2) {
    if (jugada1 === null) return false;
    if (jugada2 === null) return true;
    if (this.tablero.turno == 1) {
      return jugada1 > jugada2;
    } else {
      return jugada1 < jugada2;
    }
  }
  this.terminarNodosHijo = function terminarNodosHijo(move, puntuacionJugador, seq) {
    if (this.buscarMejor(puntuacionJugador, this.mejor)) {
      this.mejor = puntuacionJugador;
      this.mejorseq = [move];
      if (seq !== null) {
        this.mejorseq = this.mejorseq.concat(seq);
      }
      if (this.adversario !== null && !this.buscarMejor(this.adversario, puntuacionJugador)) {
        this.movimientosHijo.length = 0;
      }
    }
  }
  this.mantener = function mantener() {
    if (this.mejorseq == null || this.mejorseq.length < 2) return false;
    return this.mejorseq[this.mejorseq.length - 1].length == 0 &&
      this.mejorseq[this.mejorseq.length - 2].length == 0;
  }
  this.siguienteNodoHijo = function siguienteNodoHijo() {
    if (0 == this.movimientosHijo.length) return null;
    return new nodo(
      this.tablero,
      this.profundidad - 1,
      this.movimientosHijo.shift(),
      this.mejor,
      this.primerJugada);
    this.primerJugada = null;
  }
}