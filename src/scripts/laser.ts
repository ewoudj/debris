import { EntityInterface } from './entity';
import { Game } from './game';
import { Body, Circle } from './body';
import { Bullet } from './bullet';
import { Explosion } from './explosion';
import { collisionSound } from './audio';
import { Debris } from './debris';

export class Laser implements EntityInterface {
  finished = false;
  collisions?: Array<EntityInterface>;
  body: Body = {
    kind: 'Laser',
    mass: 200,
    position: [0, 0],
    velocity: [0, 0],
    acceleration: [0, 0],
    attractedTo: [],
    shape: new Circle(10),
  };
  private color: string = 'white';
  private lastUpdated: number;

  constructor(
    private readonly game: Game,
    position: [number, number],
    direction: [number, number]
  ) {
    this.lastUpdated = game.now;
    this.body.position = [position[0], position[1]];
    const s = 36;
    this.body.velocity = [direction[0] < 0 ? -s : s, direction[1] < 0 ? -s : s];
  }

  update(now: number): void {
    const dt: number = (now - this.lastUpdated) / 100;
    const b = this.body;

    let d = b.shape instanceof Circle ? b.shape.radius * 4 : 0;
    const w = this.game.logicalWidth;
    const h = this.game.logicalHeight;
    if (
      (b.position[0] < -d && b.velocity[0] < 0) ||
      (b.position[1] < -d && b.velocity[1] < 0) ||
      (b.position[0] > w + d && b.velocity[0] > 0) ||
      (b.position[1] > h + d && b.velocity[1] > 0)
    ) {
      this.finished = true;
    }
    if (this.collisions && this.collisions.length && !this.finished) {
      for (const c of this.collisions) {
        if (c instanceof Debris && c.body) {
          this.finished = true;
          const explosion = new Explosion(
            this.game,
            [b.position[0], b.position[1]],
            0,
            false,
            this.color,
            13,
            collisionSound
          );
          explosion.duration = 110;
          this.game.entities.push(explosion);
        }
        if (c instanceof Bullet) {
          c.finished = true;
          this.finished = true;
          this.game.entities.push(new Explosion(this.game, [b.position[0], b.position[1]]));
        }
      }
    }
    this.lastUpdated = now;
  }

  render(): void {
    const c = this.game.context;
    const p = this.body.position;
    const d = this.body.velocity;
    const dx = d[0] > 0 ? 1 : -1;
    const dy = d[1] > 0 ? 1 : -1;
    c.save();
    c.translate(p[0], p[1]);
    c.fillStyle = this.color;
    for (let i = 0; i < 6; i++) {
      c.fillRect(-2.5 + 5 * (i * dx), -2.5 + 5 * (i * dy), 5, 5 + 0.5);
    }
    c.restore();
  }
}
