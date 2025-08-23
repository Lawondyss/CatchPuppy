/**
 * @typedef {import('kaplay').KaplayCtx} KaplayCtx
 */

import { Background } from '../libs/background.js'
import { GameStore } from '../libs/store.js'
import { Text } from '../libs/text.js'

/**
 * @param {KaplayCtx} k
 */
export function createStartScene(k) {
  k.scene('start', () => {
    new Background(k)

    new Text(k, 'Chyť Bárnyho', {
      size: 50,
      pos: k.vec2(k.center().x, k.height() / 2 - 80),
      anchor: 'center',
    })

    const btn = k.add([
      k.rect(180, 60, { radius: 8 }),
      k.pos(k.vec2(k.center().x, k.height() / 2)),
      k.area(),
      k.scale(1),
      k.anchor("center"),
      k.outline(4),
      k.color(255, 255, 255),
    ])

    // add a child object that displays the text
    btn.add([
      k.text('Start'),
      k.anchor('center'),
      k.color(0, 0, 0),
    ])

    new Text(k, 'Rekord: ' + GameStore.highScore, {
      pos: k.vec2(k.width() / 2, k.height() / 2 + 80),
      anchor: 'center',
    })

    btn.onHover(() => {
      btn.color = k.MAGENTA;
      btn.scale = k.vec2(1.2);
      k.setCursor('pointer')
    })

    btn.onHoverEnd(() => {
      btn.scale = k.vec2(1);
      btn.color = k.rgb();
      k.setCursor('default')
    })

    btn.onClick(() => {
      k.setCursor('default')
      k.go('game')
    })

    k.onKeyPress('space', () => {
      k.go('game')
    })
  })
}
