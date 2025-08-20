import kaplay from 'kaplay'
import { createGameScene } from './scenes/game.js'
import { createLoseScene } from './scenes/lose.js'
import { createStartScene } from './scenes/start.js'

function computeScale() {
  const size = window.screen.orientation.type.startsWith('landscape')
    ? window.innerWidth
    : window.innerHeight

  // default desktop
  let scale = 1
  // mobile
  if (size < 800) scale = 0.55
  // tablet
  else if (800 <= size && size <= 1100) scale = 0.8

  // slightly reduce scale on very high DPR devices to keep UI readable
  if ((window.devicePixelRatio || 1) > 1.5) scale *= 0.9

  // clamp to reasonable bounds
  return Math.max(0.45, Math.min(scale, 1))
}


const k = kaplay({
  font: 'sans-serif',
  scale: computeScale(),
})

k.loadRoot('./')
k.loadSprite('puppy', 'sprites/puppy.png')
k.loadSprite('girl', 'sprites/girl2.png')
k.loadSprite('bush', 'sprites/bush.png')
k.loadSprite('biscuit', 'sprites/biscuit.png')

const SPEED = 320
const START_TIMER = 10

createStartScene(k)
createGameScene(k, SPEED, START_TIMER)
createLoseScene(k)

k.go('start')
