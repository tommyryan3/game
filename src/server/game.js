const Constants = require('../shared/constants')
const Player = require('./player')

class Game {
  constructor() {
    this.sockets = {}
    this.players = {}
    this.lastUpdateTime = Date.now()
    this.shouldSendUpdate = false
    setInterval(() => this.update(this.sockets, this.players), 1000 / 60)
  }

  addPlayer(socket, username) {
    console.log('adding player')
    // Generate a position to start this player at.
    this.sockets[socket.id] = socket
    console.log(Object.keys(this.sockets))
    // Create player
    
    const x = 1000 * (0.25 + Math.random() * 0.5)
    const y = 1000 * (0.25 + Math.random() * 0.5)
    this.players[socket.id] = new Player(socket.id, username, x, y)
  }

  removePlayer(socket){
    delete this.sockets[socket.id]
    delete this.players[socket.id]
  }

  handleInput(socket, pos){
    // console.log('handling update')
    if (this.players[socket.id]) {
      this.players[socket.id].setPosition(pos)
    }
  }
  
  handleAttack(socket, hp){
    // console.log('handling update')
    if (this.players[socket.id]) {
      const players = Object.keys(this.sockets).map( id => this.players[id])
      if (players.length === 2) {
        const d = players[0].distanceTo(players[1])
        console.log(d)
        
        if (d < 100) {
          this.players[socket.id].takeDamage(hp)
        } else {
          console.log('too far!')
        }
      }
    }
  }

  createUpdate(player, players) {
    // console.log('creating update for player')
    const otherPlayers = Object.values(players).filter(p => p !== player)
    return {
        t: Date.now(),
        me: player.serializeForUpdate(),
        other: otherPlayers.map(p => p.serializeForUpdate()),
    }
  }
}

Game.prototype.update = function(sockets, players) {
  // console.log('updating game')
  // console.log(sockets)
  sockets && Object.keys(sockets).forEach(id => {
    const player = this.players[id]
    player.update()
  })
  // console.log(this.sockets)
  // Update each player

  // Apply collisions

  // Check if any players are dead

  // Send a game update to each player every other time
  // this.sockets && console.log(this.sockets)
  sockets && Object.keys(sockets).forEach(playerID => {
    const socket = sockets[playerID]
    const player = players[playerID]
    socket.emit(Constants.MSG_TYPES.GAME_UPDATE, this.createUpdate(player, players))
  })
}

module.exports = Game