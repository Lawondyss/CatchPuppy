import p from '../../package.json' with { type: 'json' }

class Store {
  /**
   * @param {string} namespace
   */
  constructor(namespace) {
    this._namespace = namespace
  }

  /**
   * @param {string} key
   * @param {any} value
   */
  write(key, value) {
    localStorage.setItem(this._key(key), JSON.stringify(value))
  }

  /**
   * @param {string} key
   * @returns {any}
   */
  read(key) {
    return JSON.parse(localStorage.getItem(this._key(key)))
  }

  /**
   * @param {string} key
   */
  remove(key) {
    localStorage.removeItem(this._key(key))
  }

  /**
   * @param {string} key
   * @returns {string}
   */
  _key(key) {
    return `${this._namespace}.${key}`
  }
}

class Game extends Store {
  constructor() {
    super(`game.${p.version}`)
  }

  get score() {
    return this.read('score') ?? 0
  }

  /**
   * @param {number} value
   */
  set score(value) {
    this.write('score', value)
  }

  get highScore() {
    return this.read('highScore') ?? 0
  }

  /**
   * @param {number} value
   */
  set highScore(value) {
    this.write('highScore', value)
  }
}

export const GameStore = new Game()
