import { Background } from '../libs/background.js'
import { GameStore } from '../libs/store.js'
import { Text } from '../libs/text.js'

export function createLoseScene(k) {
  k.scene('lose', () => {
    new Background(k)

    if (GameStore.score > GameStore.highScore) {
      GameStore.highScore = GameStore.score
    }

    const yOffset = k.height() / 2 - 3 * 30

    new Text(k, 'Konec hry', { line: 0, yOffset, anchor: 'center' })

    new Text(k, 'Chyceno: ' + GameStore.score, { line: 2, yOffset, anchor: 'center' })

    new Text(k, 'Rekord: ' + GameStore.highScore, { line: 3, yOffset, anchor: 'center' })

    new Text(k, 'Pokračuj libovolnou klávesou', { line: 5, yOffset, anchor: 'center' })

    k.onKeyPress(() => {
      k.go('start')
    })
  })
}
