const Constants = require('../shared/constants')

class Player {
    constructor(id, username, x, y){
        this.username = username
        this.x = x 
        this.y = y
        this.timeskilled = 0
        this.hp = 500
        
    }
    
    distanceTo(otherperson) {
        const dx = this.x - otherperson.x
        const dy = this.y - otherperson.y
        return Math.sqrt(dx * dx + dy * dy)
    }
    
    update() {
        this.x = Math.max(0, Math.min(1000, this.x))
        this.y = Math.max(0, Math.min(1000, this.y))
        return null
    }
    
    takeDamage() {
        this.hp -= 50
        if (this.hp === 0) {
            this.hp = 500
            this.timeskilled++
        }
    }
    
    
    
    setPosition(posObj){
        if (posObj.x){
            this.x = posObj.x
        }
        if (posObj.y){
            this.y = posObj.y
        }
    }
    
    serializeForUpdate() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            hp: this.hp,
            timeskilled: this.timeskilled
        }
    }    
}

module.exports = Player