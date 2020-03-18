import { EntityInterface } from './entity';
import { Game } from './game';
import { Body, Circle } from './body';
import { Bullet } from './bullet';
import { Explosion } from './explosion';
import { explosionSound, collisionSound } from './audio';

export class Debris implements EntityInterface {
  finished = false;
  collisions?: Array<EntityInterface>;
  body: Body = {
    kind: 'Debris',
    mass: 200,
    position: [0, 0],
    velocity: [0, 0],
    acceleration: [0, 0],
    attractedTo: ['Debris'],
    shape: new Circle(10),
  };
  private rotationSpeed: number = -360 / 0.7;
  private readonly magneticRotationSpeed: number = -360 / 0.4;
  private color: string;
  private angle: number = 0;
  private lastUpdated: number;

  constructor(
    private readonly game: Game,
    position: [number, number],
    direction: [number, number],
    color: string
  ) {
    this.body.position = [position[0], position[1]];
    this.body.velocity = [direction[0], direction[1]];
    this.color = color;
    this.lastUpdated = game.now;
  }

  get isMagnetic(): boolean {
    return this.rotationSpeed === this.magneticRotationSpeed;
  }

  update(now: number): void {
    const dt: number = (now - this.lastUpdated) / 100;
    const b = this.body;
    const a = ((Math.abs(b.acceleration[0]) + Math.abs(b.acceleration[1])) / 2) * 4;
    this.angle += (this.rotationSpeed / (10 / dt)) * (1 + a);
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
          c.finished = true;
          const explosion = new Explosion(
            this.game,
            [c.body.position[0], c.body.position[1]],
            0,
            false,
            c.color,
            13,
            collisionSound
          );
          explosion.duration = 110;
          this.game.entities.push(explosion);
          b.velocity[0] = (b.velocity[0] + c.body.velocity[0]) / 2;
          b.velocity[1] = (b.velocity[1] + c.body.velocity[1]) / 2;
        }
        if (c instanceof Bullet) {
          this.game.score += this.isMagnetic ? 3 : 1;
          c.finished = true;
          this.finished = true;
          this.game.entities.push(new Explosion(this.game, [b.position[0], b.position[1]]));
        }
      }
      this.rotationSpeed = this.magneticRotationSpeed;
      b.attractedTo = ['Ship'];
    }
    this.lastUpdated = now;
  }

  render(): void {
    const c = this.game.context;
    c.save();
    c.translate(this.body.position[0], this.body.position[1]);
    c.rotate(this.angle * (Math.PI / 180));
    c.fillStyle = this.color;
    c.fillRect(-2.5, -12.5, 5, 25);
    c.fillRect(-12.5, -2.5, 25, 5);
    c.restore();
  }

  private drawRect(position: [number, number]) {
    this.game.context.fillRect(position[0] - 2.5, position[1] - 2.5, 5.5, 5.5);
  }
}
