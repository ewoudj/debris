import { EntityInterface } from './entity';
import { Game } from './game';
import { move } from './math';
import { Body, Circle } from './body';

export class Bullet implements EntityInterface {
  finished = false;
  body: Body = {
    kind: 'Bullet',
    mass: 200,
    position: [0, 0],
    velocity: [0, 0],
    acceleration: [0, 0],
    attractedTo: [],
    shape: new Circle(5),
  };
  private readonly game: Game;
  private readonly speed: number = 10;
  private readonly range: number = 150;
  private readonly startPosition: [number, number];
  private direction: [number, number];
  private lastUpdated: number = 0;

  constructor(game: Game, position: [number, number], direction: [number, number]) {
    this.game = game;
    this.startPosition = [position[0], position[1]];
    this.body.position = [position[0], position[1]];
    this.direction = [direction[0], direction[1]];
  }

  update(now: number): void {
    move(this.body.position, this.direction, this.speed, now - this.lastUpdated);
    this.lastUpdated = now;
    const totalDistance = Math.abs(
      Math.hypot(
        this.body.position[0] - this.startPosition[0],
        this.body.position[1] - this.startPosition[1]
      )
    );
    if (totalDistance > this.range) {
      this.finished = true;
    }
  }

  render(): void {
    const c = this.game.context;
    c.save();
    c.translate(this.body.position[0], this.body.position[1]);
    c.fillStyle = 'white';
    c.fillRect(0, 0, 5, 5);
    c.restore();
  }
}
