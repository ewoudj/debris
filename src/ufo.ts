import { EntityInterface } from './entity';
import { Game } from './game';
import { Body, Circle } from './body';
import { Bullet } from './bullet';
import { Explosion } from './explosion';
import { collisionSound, laserSound, ufoSound } from './audio';
import { Debris } from './debris';
import { Laser } from './laser';
import { lineIntersection } from './math';
import { Ship } from './ship';

export class Ufo implements EntityInterface {
  finished = false;
  collisions?: Array<EntityInterface>;
  body: Body = {
    kind: 'Ufo',
    mass: 200,
    position: [0, 0],
    velocity: [0, 0],
    acceleration: [0, 0],
    attractedTo: [],
    shape: new Circle(10),
  };
  private color: string;
  private timeLastFired: number;
  private timeLastMadeSound: number;

  private readonly rects: Array<[number, number, number, number]> = [
    [-20, -4, 40, 5],
    [-15, 0, 30, 5],
  ];

  constructor(
    private readonly game: Game,
    position: [number, number],
    direction: [number, number],
    color: string
  ) {
    this.body.position = [position[0], position[1]];
    this.body.velocity = [direction[0] < 0 ? -12 : 12, direction[1] < 0 ? -12 : 12];
    this.color = color;
    this.timeLastFired = game.now;
    this.timeLastMadeSound = game.now;
  }

  update(now: number): void {
    const b = this.body;

    const pd = Math.sin(now / 20 / Math.PI) / 2;
    this.body.position[0] += pd;

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
          this.game.score += 10;
          c.finished = true;
          this.finished = true;
          this.game.entities.push(new Explosion(this.game, [b.position[0], b.position[1]]));
        }
      }
    }
    if (!this.finished && now - this.timeLastFired > 200) {
      const ship = this.game.entities.find(e => e instanceof Ship);
      const s = this.shoot(ship);
      if (s[0] || s[1]) {
        this.timeLastFired = now;
        let d = 25;
        if (ship?.body && ship.body && this.body.position[0] > ship.body.position[0]) {
          d = -25;
        }
        laserSound();
        this.game.entities.push(new Laser(this.game, [b.position[0] + d, b.position[1]], s));
      }
    }
    if (now - this.timeLastMadeSound > 200) {
      this.timeLastMadeSound = now;
      ufoSound();
    }
  }

  shoot(ship?: EntityInterface): [number, number] {
    const result: [number, number] = [0, 0];
    if (ship && !ship.finished && ship.body) {
      const b = this.body;
      const s = ship.body;
      const intersection = lineIntersection(
        b.position[0],
        b.position[1],
        b.position[0] + b.velocity[0],
        b.position[1] + b.velocity[1],
        s.position[0],
        s.position[1],
        s.position[0] + b.velocity[1],
        s.position[1] - b.velocity[0]
      );
      if (intersection.x && intersection.y) {
        const d1 = Math.hypot(intersection.x - b.position[0], intersection.y - b.position[1]);
        const d2 = Math.hypot(intersection.x - s.position[0], intersection.y - s.position[1]);
        if (d1 < 100 || d2 < 20) {
          result[0] = b.position[0] < s.position[0] ? 1 : -1;
          result[1] = b.position[1] < s.position[1] ? 1 : -1;
        }
      }
    }
    return result;
  }

  render(): void {
    const c = this.game.context;
    c.save();
    c.translate(this.body.position[0], this.body.position[1]);
    c.fillStyle = this.color;
    for (var r of this.rects) {
      c.fillRect(r[0], r[1], r[2], r[3] + 0.5);
    }
    c.restore();
  }
}
