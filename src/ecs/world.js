// src/ecs/world.js
import { World } from 'miniplex';

// We define our ECS World. Every object in the Net will be an Entity in this database.
// Entities will have components like { position: { x: 5, y: 5 }, render: { char: '@', color: 'text-neon-green' } }
export const world = new World();