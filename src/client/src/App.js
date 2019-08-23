import React, { Component } from 'react';
import io from 'socket.io-client';
import Constants from './constants'
import { throttle } from 'throttle-debounce'
import './App.css'
// import Konva from 'konva';
// import { render } from 'react-dom';
// import { Stage, Layer, Rect, Text, Circle, Line } from 'react-konva';
import ArrowKeysReact from 'arrow-keys-react';
import {db, auth} from "./firebase"


class App extends Component {
  constructor(props){
    super(props)
    this.socket = io(`https://${window.location.host}`.slice(0, -5), { reconnection: false, secure: true })    
  }
  
  
  state = {
    gameStart: 0,
    connected: false,
    scoreBoard: [],
    player1: {
      x: 300,
      y: 300,
      p1hp: 500,
      timeskilled: 0
    },
    player2: {
      x2: 100,
      y2: 100,
      p2hp: 500,
      timeskilled: 0
    }
  }

  
  componentDidMount() {
    console.log(`ws://${window.location.host}`.slice(0, -5))
    
    //console.log(socket)
    const connectedPromise = new Promise(resolve => {
      this.socket.on('connect', () => {
        console.log('Connected to server!')
        resolve();
      })
      // socket.emit('subscribeToTimer', 1000)  
    })
    
    connectedPromise.then( conn => {
      //console.log(this.socket)
      this.socket.on(Constants.MSG_TYPES.INPUT,  pos => this.updatePosition(pos))
      this.socket.on(Constants.MSG_TYPES.JOIN_GAME, username => this.joinGame(username))
      this.socket.on(Constants.MSG_TYPES.GAME_UPDATE, update => this.updateGame(update))
      this.socket.on(Constants.MSG_TYPES.ATTACK, () => this.handleAttack())
    })    
  }
  
  joinGame = (username) => {
    console.log('player joined')
    console.log(username)
    this.socket.emit(Constants.MSG_TYPES.JOIN_GAME, username)
  }  
  
  handleKeyDown = event => {
    //problem if a key other than wasd is clicked
    const position = this.handleInput(event)
    //console.log('position: '+position)
    this.socket.emit(Constants.MSG_TYPES.INPUT, position)
  }
  
  handleInput = (event) => {
    console.log('input')
    console.log(event)
    var mouseX = event.clientX
    var mouseY = event.clientY
    var velocity = 10 
    // if (Math.hypot(mouseX-this.state.player1.x, mouseY-this.state.player1.y) < 107) {
    //   if (Math.hypot(mouseX - this.state.player2.x2, mouseY - this.state.player2.y2) < 100) {
    //     
      //}
      //}
    //this.handleAttack(, socket)
    
    if (event.keyCode === 87) {
        if (this.state.player1.y > 0) {
          var pos = this.state.player1.y - velocity
          return { y: pos }
        }
    }
    if (event.keyCode === 65) {
      if (this.state.player1.x > 0) {
        var pos = this.state.player1.x - velocity
        return { x: pos }
      }
    }
    if (event.keyCode === 68) {
      if (this.state.player1.x < window.innerWidth - 50) {
        var pos = this.state.player1.x + velocity
        return { x: pos }
      }
    }
    if (event.keyCode === 83) {
      if (this.state.player1.y < window.innerHeight - 50) {
        var pos = this.state.player1.y + velocity
        return { y: pos }
      }
    }
    else {
      return {
        x: this.state.player1.x,
        y: this.state.player1.y
      }
    }
    return null
    // this.handleClick(event)
    //socket.emit(mouseX, mouseY)
  }  
  
  updatePosition = throttle(20, (pos, socket) => {
    //console.log('update position')
    this.socket.emit(Constants.MSG_TYPES.INPUT, pos)
  })
  
  handleAttack = throttle(20, (socket) => {
    console.log('attack')
    this.socket.emit(Constants.MSG_TYPES.ATTACK)
  })
  
  
  // handleClick = (event) => {
  //   if (Math.hypot(event.clientX-this.state.x, event.clientY-this.state.y) < 107) {
  //     //dist between center of other circle and mousex, mousey < opp radius
  //     //x2-x1, y2-y1
  //     if (Math.hypot(event.clientX - this.state.x2, event.clientY - this.state.y2) < 100) {
  //       console.log("test")
  //       var updateHealth = this.state.p2hp - 50
  //       this.setState({p2hp: updateHealth})
  //     }
  //   }
  // }
  
  updateGame = update => {
    //console.log('update')
    //console.log(update)
    this.setState({
      player1:  {
        x: update.me.x,
        y: update.me.y,
        p1hp: update.other[0] && update.other[0].hp,
        timeskilled: update.other[0] && update.other[0].timeskilled,
      },
      player2:  {
        x2: update.other[0] && update.other[0].x,
        y2: update.other[0] && update.other[0].y,
        p2hp: update.me.hp,
        timeskilled: update.me.timeskilled
      }
      
    })
  }
  
  
  
  render() {
    
    return (
      
      <div className="App" onKeyDown={this.handleKeyDown} tabIndex="0" onClick={this.handleAttack}>
        <button onClick={() => this.joinGame("Ryan")}>Join Game</button>
        <h1>{this.state.player1.p1hp}</h1>
        <h3>Times killed: {this.state.player1.timeskilled}</h3>
        <h3>Kills: {this.state.player2.timeskilled}</h3>
        <Circle 
          x={this.state.player1.x} 
          y={this.state.player1.y}/>
        <CircleOpp 
          x2={this.state.player2.x2} 
          y2={this.state.player2.y2 - 50} 
          hp = {this.state.player2.p2hp}/>
        <Ring x={this.state.player1.x} y={this.state.player1.y}/>
        <RingOpp 
        x2={this.state.player2.x2}
        y2={this.state.player2.y2 - 50}/>
      </div>
    );
  }
}


class Circle extends React.Component {

  render() {
    const styles = {
      borderRadius: "50%",
      width: this.props.size,
      height: this.props.size,
      background: this.props.color,
      transition: 'all 0.15s ease-in-out',
      transform: `translateX(${this.props.x}px) translateY(${this.props.y}px)`
    }
    return(
      <div className="Circle" style={styles}></div>
    )
  }
}

class CircleOpp extends React.Component {

  render() {
    const styles = {
      borderRadius: "50%",
      width: this.props.size,
      height: this.props.size,
      background: this.props.color,
      transition: 'all 0.15s ease-in-out',
      transform: `translateX(${this.props.x2}px) translateY(${this.props.y2}px)`
    }
    return(
      <div className="CircleOpp" style={styles}></div>
    )
  }
}

class Ring extends React.Component {

  render() {
    const styles = {
      borderRadius: "50%",
      width: this.props.size * 3,
      height: this.props.size * 3,
      
      transition: 'all 0.15s ease-in-out',
      transform: `translateX(${this.props.x-52}px) translateY(${this.props.y - 150}px)`
      // position: "absolute",
      // left: this.props.x + "px",
      // top: this.props.y + "px"
    }
    return(
      <div className="Ring" style={styles}></div>
    )
  }
}

class RingOpp extends React.Component {

  render() {
    const styles = {
      borderRadius: "50%",
      width: this.props.size * 3,
      height: this.props.size * 3,
      
      transition: 'all 0.15s ease-in-out',
      transform: `translateX(${this.props.x2-53}px) translateY(${this.props.y2 - 260}px)`
      // position: "absolute",
      // left: this.props.x + "px",
      // top: this.props.y + "px"
    }
    return(
      <div className="Ring" style={styles}></div>
    )
  }
  
}

CircleOpp.defaultProps = {size: 50, color: "orange"}
Circle.defaultProps = {size: 50, color: "red"}

Ring.defaultProps = {size: 50, color: "red"}
RingOpp.defaultProps = {size: 50, color: "red"}
export default App;