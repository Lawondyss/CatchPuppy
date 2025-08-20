export function createAnimations(k) {
  return {
    emitParticles(pos) {
      k.add([
        k.pos(pos),
        k.particles(
          {
            max: 100,
            speed: [100, 200],
            lifeTime: [2, 3],
            angle: [0, 360],
            opacities: [1.0, 0.0],
          },
          {
            direction: 0,
            spread: 360,
          }
        ),
      ]).emit(20)
    },

    showShout(text, pos) {
      const textSize = 24
      const padding = 10
      const estimatedCharWidth = textSize * 0.6
      const maxTextLength = Math.max(text.length, 7)
      const bubbleWidth = (maxTextLength * estimatedCharWidth) + (padding * 2)
      const bubbleHeight = textSize + (padding * 2)

      const common = [
        k.anchor('center'),
        k.opacity(0.8),
        k.lifespan(1, { fade: 0.5 }),
      ]
      const bubble = k.add([
          ...common,
        k.pos(pos),
        k.rect(bubbleWidth, bubbleHeight, { radius: 4 }),
        k.color(k.WHITE),
        k.outline(2, k.BLACK),
        k.move(k.UP, 50),
        k.z(100),
      ])
      bubble.add([
        ...common,
        k.text(text, { size: textSize, font: 'sans-serif' }),
        k.color(k.BLACK),
      ])
    },
  }
}
