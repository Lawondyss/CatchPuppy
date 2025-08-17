export class Walls {
  constructor(k, WALL_THICKNESS) {
    k.add([
      k.rect(k.width(), WALL_THICKNESS),
      k.pos(0, 0),
      k.area(),
      k.body({ isStatic: true }),
      'wall',
    ])

    k.add([
      k.rect(k.width(), WALL_THICKNESS),
      k.pos(0, k.height() - WALL_THICKNESS),
      k.area(),
      k.body({ isStatic: true }),
      'wall',
    ])

    k.add([
      k.rect(WALL_THICKNESS, k.height()),
      k.pos(0, 0),
      k.area(),
      k.body({ isStatic: true }),
      'wall',
    ])

    k.add([
      k.rect(WALL_THICKNESS, k.height()),
      k.pos(k.width() - WALL_THICKNESS, 0),
      k.area(),
      k.body({ isStatic: true }),
      'wall',
    ])
  }
}
