const DEFAULT_LINE_HEIGHT = 30

export class Text {
  constructor(k, content, options = {}) {
    const textComps = [
      k.text(content, { size: options.size ?? 24 }),
      k.color(options.color ?? k.rgb(0, 0, 0)),
      k.anchor(options.anchor ?? 'topleft'),
    ]

    let position
    if (options.pos) {
      position = options.pos
    } else if (options.line !== undefined) {
      const y = (options.line * (options.lineHeight ?? DEFAULT_LINE_HEIGHT)) + (options.yOffset ?? 0)
      const x = options.x ?? k.center().x
      position = k.vec2(x, y)
    } else {
      position = k.center()
    }
    textComps.push(k.pos(position))

    this.gameObject = k.add(textComps)
  }

  set text(value) {
    this.gameObject.text = value
  }

  get text() {
    return this.gameObject.text
  }
}
