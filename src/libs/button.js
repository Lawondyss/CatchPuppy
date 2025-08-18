export class Button {
  constructor(k, label, options = {}) {
    this.k = k
    this.label = label
    this.size = options.size ?? 20
    this.padX = options.padX ?? 12
    this.padY = options.padY ?? 6

    // estimate text width
    const estCharWidth = this.size * 0.6
    const estWidth = Math.max(20, Math.ceil(label.length * estCharWidth))
    const estHeight = Math.ceil(this.size * 1.2)

    const pos = options.pos ?? k.center()

    this.button = k.add([
      k.rect(estWidth + this.padX * 2, estHeight + this.padY * 2, { radius: 8 }),
      k.pos(pos),
      k.anchor('center'),
      k.color(k.rgb(255, 255, 255)),
      k.z(999),
      k.outline(4),
    ])

    this.text = this.button.add([
      k.text(label, { size: this.size }),
      k.color(k.rgb(0, 0, 0)),
      k.anchor('center'),
    ])
  }

  set labelText(v) {
    this.text.text = v
  }

  get labelText() {
    return this.text.text
  }
}
