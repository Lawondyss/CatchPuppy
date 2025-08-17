import kaplay from 'kaplay'
import { createGameScene } from './scenes/game.js'
import { createLoseScene } from './scenes/lose.js'
import { createStartScene } from './scenes/start.js'

const k = kaplay({
  font: 'sans-serif',
  scale: 1.5,
})

if (!k.isTouchscreen()) k.scale(1)

//k.debug.inspect = true

k.loadRoot('./')
k.loadSprite('puppy', 'sprites/puppy.png')
k.loadSprite('girl', 'sprites/girl2.png')
k.loadSprite('bush', 'sprites/bush.png')
k.loadSprite('bean', 'sprites/bean.png')

const SPEED = 320
const WALL_THICKNESS = 50
const START_TIMER = 10

createStartScene(k)
createGameScene(k, SPEED, WALL_THICKNESS, START_TIMER)
createLoseScene(k)

k.go('start')
