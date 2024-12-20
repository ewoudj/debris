import { EntityInterface } from './entity';
import { Game } from './game';
import { Debris } from './debris';
import { Body } from './body';
import { Ufo } from './ufo';

export class DebrisField implements EntityInterface {
  body?: Body;
  finished = false;
  private readonly game: Game;
  private readonly minimumInterval: number = 200;
  private readonly randomInterval: number = 200;
  private readonly colors: Array<string> = [
    'green',
    'yellow',
    'purple',
    'magenta',
    'cyan',
    'blue',
    'red',
    'orange',
  ];
  private nextTimeToCreateDebris: number = 0;
  private ufo?: Ufo;

  constructor(game: Game) {
    this.game = game;
  }

  update(now: number): void {
    if (this.nextTimeToCreateDebris < now) {
      this.nextTimeToCreateDebris =
        now + (Math.random() * this.randomInterval + this.minimumInterval);
      const startPosition = this.getStartPosition();
      const direction = this.getDirection(startPosition);
      if (Math.floor(Math.random() * Math.floor(25)) === 6 && (!this.ufo || this.ufo.finished)) {
        this.ufo = new Ufo(
          this.game,
          startPosition,
          direction,
          this.colors[Math.floor(Math.random() * this.colors.length)]
        );
        this.game.entities.push(this.ufo);
      } else {
        this.game.entities.push(
          new Debris(
            this.game,
            startPosition,
            direction,
            this.colors[Math.floor(Math.random() * this.colors.length)]
          )
        );
      }
    }
  }

  render(): void {}

  private getDirection(start: [number, number]): [number, number] {
    let result: [number, number] = [0, 0];
    while (result[0] === 0 || result[1] === 0 || isNaN(result[0]) || isNaN(result[1])) {
      result = this.getStartPosition();
      result[0] -= start[0];
      result[1] -= start[0];
      let scale = Math.abs(result[1]) / Math.abs(result[0]);
      if (Math.abs(result[0]) < Math.abs(result[1])) {
        scale = Math.abs(result[0]) / Math.abs(result[1]);
      }
      result[0] = (result[0] * scale) / 100;
      result[1] = (result[1] * scale) / 100;
    }
    return result;
  }

  private getStartPosition(): [number, number] {
    const result: [number, number] = [0, 0];
    const d: number = 30; // debris diameter
    const w: number = this.game.logicalWidth + 2 * d;
    const h: number = this.game.logicalHeight + 2 * d;
    const l: number = w * 2 + h * 2;
    const borderPosition: number = Math.floor(Math.random() * l);
    if (borderPosition < w) {
      (result[0] = borderPosition), (result[1] = 0);
    } else if (borderPosition < w + h) {
      (result[0] = w), (result[1] = borderPosition - w);
    } else if (borderPosition < 2 * w + h) {
      (result[0] = borderPosition - (w + h)), (result[1] = h);
    } else {
      (result[0] = 0), (result[1] = borderPosition - (2 * w + h));
    }
    result[0] -= d;
    result[1] -= d;
    return result;
  }
}
