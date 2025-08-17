import { Background } from '../libs/background.js'
import { GameStore } from '../libs/store.js'
import { Text } from '../libs/text.js'

export function createStartScene(k) {
  k.scene('start', () => {
    new Background(k)

    new Text(k, 'Chyť Bárnyho', {
      size: 50,
      pos: k.vec2(k.center().x, k.height() / 2 - 80),
      anchor: 'center',
    })

    const startBtn = new Text(k, 'Start', {
      pos: k.vec2(k.center().x, k.height() / 2),
      anchor: 'center',
    })
    startBtn.gameObject.use(k.area({ scale: 2 }))

    new Text(k, 'Rekord: ' + GameStore.highScore, {
      pos: k.vec2(k.width() / 2, k.height() / 2 + 80),
      anchor: 'center',
    })

    startBtn.gameObject.onHover(() => {
      k.setCursor('pointer')
    })

    startBtn.gameObject.onHoverEnd(() => {
      k.setCursor('default')
    })

    startBtn.gameObject.onClick(() => {
      k.setCursor('default')
      k.go('game')
    })
  })
}
