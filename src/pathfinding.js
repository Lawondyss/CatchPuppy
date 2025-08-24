/**
 * @typedef {import('./world/bushes.js').Bushes} Bushes
 * @typedef {import('kaplay').Vec2} Vec2
 */

/**
 * Represents a node in the pathfinding grid.
 */
class PathNode {
  /**
   * @param {number} x - The x-coordinate of the node in the grid.
   * @param {number} y - The y-coordinate of the node in the grid.
   */
  constructor(x, y) {
    this.x = x
    this.y = y
    this.gCost = 0 // Cost from the start node
    this.hCost = 0 // Heuristic cost to the end node
    this.fCost = 0 // Total cost (gCost + hCost)
    /** @type {PathNode | null} */
    this.parent = null
  }
}

export class Pathfinding {
  /**
   * @param {Bushes} bushes - The Bushes instance containing grid information.
   */
  constructor(bushes) {
    this.bushes = bushes
    this.grid = bushes.grid
    this.walkableNodes = new Set(this.bushes.freePositions.map(p => `${p.x},${p.y}`))
    this.gridToWorldMap = new Map(
      this.bushes.freePositions.map(p => [`${p.x},${p.y}`, p.pos])
    )
  }

  /**
   * Finds the shortest path between two world positions using the A* algorithm.
   * @param {Vec2} startWorldPos - The starting world position.
   * @param {Vec2} endWorldPos - The ending world position.
   * @returns {Vec2[] | null} - An array of world positions representing the path, or null if no path is found.
   */
  findPath(startWorldPos, endWorldPos) {
    const startNode = this._getNodeFromWorldPos(startWorldPos)
    const endNode = this._getNodeFromWorldPos(endWorldPos)

    if (!startNode || !endNode || (startNode.x === endNode.x && startNode.y === endNode.y)) {
      return null // Start or end position is not on a walkable node, or they are the same
    }

    const openList = [startNode]
    const closedList = new Set()

    while (openList.length > 0) {
      // Find the node with the lowest fCost in the open list
      let currentNode = openList[0]
      for (let i = 1; i < openList.length; i++) {
        if (openList[i].fCost < currentNode.fCost || (openList[i].fCost === currentNode.fCost && openList[i].hCost < currentNode.hCost)) {
          currentNode = openList[i]
        }
      }

      // Move current node from open to closed list
      openList.splice(openList.indexOf(currentNode), 1)
      closedList.add(`${currentNode.x},${currentNode.y}`)

      // Path found
      if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
        return this._reconstructPath(currentNode)
      }

      // Process neighbors
      for (const neighbor of this._getNeighbors(currentNode)) {
        if (closedList.has(`${neighbor.x},${neighbor.y}`)) {
          continue
        }

        const distance = Math.sqrt(Math.pow(currentNode.x - neighbor.x, 2) + Math.pow(currentNode.y - neighbor.y, 2));
        const newGCost = currentNode.gCost + distance

        if (newGCost < neighbor.gCost || !openList.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
          neighbor.gCost = newGCost
          neighbor.hCost = this._calculateHeuristic(neighbor, endNode)
          neighbor.fCost = neighbor.gCost + neighbor.hCost
          neighbor.parent = currentNode

          if (!openList.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
            openList.push(neighbor)
          }
        }
      }
    }

    return null // No path found
  }

  /**
   * Finds the closest grid node corresponding to a world position.
   * @param {Vec2} worldPos
   * @returns {PathNode | null}
   */
  _getNodeFromWorldPos(worldPos) {
    let closestNodeData = null
    let minDistance = Infinity

    for (const freePos of this.bushes.freePositions) {
      const distance = worldPos.dist(freePos.pos)
      if (distance < minDistance) {
        minDistance = distance
        closestNodeData = freePos
      }
    }

    return closestNodeData ? new PathNode(closestNodeData.x, closestNodeData.y) : null
  }

  /**
   * Gets the walkable neighbors of a node.
   * @param {PathNode} node
   * @returns {PathNode[]}
   */
  _getNeighbors(node) {
    const neighbors = []
    const directions = [
      { x: 0, y: 1 },  // Down
      { x: 0, y: -1 }, // Up
      { x: 1, y: 0 },  // Right
      { x: -1, y: 0 }, // Left
      { x: 1, y: 1 },  // Down-Right
      { x: 1, y: -1 }, // Up-Right
      { x: -1, y: 1 },  // Down-Left
      { x: -1, y: -1 },// Up-Left
    ]

    for (const dir of directions) {
      const checkX = node.x + dir.x
      const checkY = node.y + dir.y

      if (this.walkableNodes.has(`${checkX},${checkY}`)) {
        neighbors.push(new PathNode(checkX, checkY))
      }
    }

    return neighbors
  }

  /**
   * Calculates the heuristic (Diagonal distance) between two nodes.
   * @param {PathNode} nodeA
   * @param {PathNode} nodeB
   * @returns {number}
   */
  _calculateHeuristic(nodeA, nodeB) {
    const dx = Math.abs(nodeA.x - nodeB.x)
    const dy = Math.abs(nodeA.y - nodeB.y)
    return Math.max(dx, dy) + (Math.sqrt(2) - 1) * Math.min(dx, dy)
  }

  /**
   * Reconstructs the path from the end node to the start node.
   * @param {PathNode} endNode
   * @returns {Vec2[]}
   */
  _reconstructPath(endNode) {
    const path = []
    let currentNode = endNode
    while (currentNode !== null) {
      const worldPos = this.gridToWorldMap.get(`${currentNode.x},${currentNode.y}`)
      if (worldPos) {
        path.push(worldPos)
      }
      currentNode = currentNode.parent
    }
    return path.reverse()
  }
}
