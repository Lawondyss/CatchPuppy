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
      pos: k.vec2(k.center().x, k.height() / 2 - 120),
      anchor: 'center',
    })

    const btn = k.add([
      k.rect(180, 60, { radius: 8 }),
      k.pos(k.vec2(k.center().x, k.height() / 2 - 20)),
      k.area(),
      k.scale(1),
      k.anchor("center"),
      k.outline(4),
      k.color(255, 255, 255),
    ])

    btn.add([
      k.text('Start'),
      k.anchor('center'),
      k.color(0, 0, 0),
    ])

    const toggleBtn = k.add([
      k.rect(280, 50, { radius: 8 }),
      k.pos(k.vec2(k.center().x, k.height() / 2 + 50)),
      k.area(),
      k.anchor('center'),
      k.outline(4),
    ])

    const toggleBtnText = toggleBtn.add([
      k.text(''),
      k.anchor('center'),
      k.color(0, 0, 0),
    ])

    function updateToggleState() {
      const isEnabled = GameStore.isDeviceOrientationEnabled
      const status = isEnabled ? 'ZAP' : 'VYP'
      toggleBtnText.text = `Náklon: ${status}`
      toggleBtn.color = isEnabled ? k.rgb(144, 238, 144) : k.rgb(211, 211, 211) // LightGreen and LightGrey
    }

    updateToggleState()

    new Text(k, 'Rekord: ' + GameStore.highScore, {
      pos: k.vec2(k.width() / 2, k.height() / 2 + 120),
      anchor: 'center',
    })

    btn.onHover(() => {
      btn.color = k.MAGENTA;
      btn.scale = k.vec2(1.2);
      k.setCursor('pointer')
    })

    btn.onHoverEnd(() => {
      btn.scale = k.vec2(1);
      btn.color = k.rgb(255, 255, 255);
      k.setCursor('default')
    })

    btn.onClick(() => {
      k.setCursor('default')
      k.go('game')
    })

    toggleBtn.onHover(() => {
      k.setCursor('pointer')
    })

    toggleBtn.onHoverEnd(() => {
      k.setCursor('default')
    })

    toggleBtn.onClick(() => {
      GameStore.isDeviceOrientationEnabled = !GameStore.isDeviceOrientationEnabled
      updateToggleState()
    })

    k.onKeyPress('space', () => {
      k.go('game')
    })
  })
}
