import { EntityInterface } from './entity';
import { Game } from './game';
import { Body, Circle, Ellipse } from './body';
import { circleCircle, ellipseEllipse, ellipseCircle } from './math';

export class Physics implements EntityInterface {
  body?: Body;
  finished = false;
  private readonly game: Game;
  private readonly g: number = 3.5 * 0.5;
  private readonly softening: number = 0.15;
  private lastUpdated: number;

  constructor(game: Game) {
    this.game = game;
    this.lastUpdated = game.now;
  }

  update(now: number): void {
    const dt: number = (now - this.lastUpdated) / 100;
    this.applyGravity(dt);
    this.calculateCollisions();
    this.lastUpdated = now;
  }

  private applyGravity(dt: number) {
    for (const entity of this.game.entities) {
      if (entity.body && entity.body.attractedTo !== 'none') {
        const b = entity.body;
        b.position[0] += b.velocity[0] * dt;
        b.position[1] += b.velocity[1] * dt;
        b.velocity[0] += b.acceleration[0] * dt;
        b.velocity[1] += b.acceleration[1] * dt;
        let ax = 0;
        let ay = 0;
        for (const otherEntity of this.game.entities) {
          if (otherEntity !== entity && otherEntity.body) {
            const otherBody = otherEntity.body;
            if (
              b.attractedTo === 'any' ||
              (b.attractedTo.includes && b.attractedTo.includes(otherBody.kind))
            ) {
              const dx = otherBody.position[0] - b.position[0];
              const dy = otherBody.position[1] - b.position[1];
              const distSq = dx * dx + dy * dy;
              const f = (this.g * otherBody.mass) / (distSq * Math.sqrt(distSq + this.softening));
              ax += dx * f;
              ay += dy * f;
            }
          }
        }
        b.acceleration[0] = ax;
        b.acceleration[1] = ay;
      }
    }
  }

  private calculateCollisions() {
    for (const e1 of this.game.entities) {
      e1.collisions = this.game.entities.filter(e2 => this.collide(e1, e2));
    }
  }

  private collide(e1: EntityInterface, e2: EntityInterface): boolean {
    let result: boolean = false;
    if (e1 !== e2 && e1.body && e2.body) {
      const b1 = e1.body;
      const b2 = e2.body;
      if (b1.shape instanceof Circle && b2.shape instanceof Circle) {
        result = circleCircle(
          b1.position[0],
          b1.position[1],
          b1.shape.radius,
          b2.position[0],
          b2.position[1],
          b2.shape.radius
        );
      } else if (b1.shape instanceof Ellipse && b2.shape instanceof Ellipse) {
        result = ellipseEllipse(
          b1.position[0],
          b1.position[1],
          b1.shape.horizontalRadius,
          b1.shape.verticalRadius,
          b2.position[0],
          b2.position[1],
          b2.shape.horizontalRadius,
          b2.shape.verticalRadius
        );
      } else if (b1.shape instanceof Circle && b2.shape instanceof Ellipse) {
        result = ellipseCircle(
          b2.position[0],
          b2.position[1],
          b2.shape.horizontalRadius,
          b2.shape.verticalRadius,
          b1.position[0],
          b1.position[1],
          b1.shape.radius
        );
      } else if (b1.shape instanceof Ellipse && b2.shape instanceof Circle) {
        result = ellipseCircle(
          b1.position[0],
          b1.position[1],
          b1.shape.horizontalRadius,
          b1.shape.verticalRadius,
          b2.position[0],
          b2.position[1],
          b2.shape.radius
        );
      }
    }
    return result;
  }

  render(): void {}
}
