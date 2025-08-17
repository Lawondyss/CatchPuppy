class Store {
  constructor(namespace) {
    this._namespace = namespace
  }

  write(key, value) {
    localStorage.setItem(this._key(key), JSON.stringify(value))
  }

  read(key) {
    return JSON.parse(localStorage.getItem(this._key(key)))
  }

  remove(key) {
    localStorage.removeItem(this._key(key))
  }

  _key(key) {
    return `${this._namespace}.${key}`
  }
}

class Game extends Store {
  constructor() {
    super('game')
  }

  get score() {
    return this.read('score') ?? 0
  }

  set score(value) {
    this.write('score', value)
  }

  get highScore() {
    return this.read('highScore') ?? 0
  }

  set highScore(value) {
    this.write('highScore', value)
  }
}

export const GameStore = new Game()
