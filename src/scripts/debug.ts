import { EntityInterface } from './entity';
import { Game } from './game';
import { Body } from './body';
import { renderText } from './text';

export class Debug implements EntityInterface {
  body?: Body;
  finished = false;
  frames: Array<number> = [];
  fps: number = 0;
  lastUpdated: number = 0;
  private readonly game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  update(now: number): void {
    if (this.lastUpdated !== 0) {
      this.frames.push(now - this.lastUpdated);
      if (this.frames.length > 60) {
        this.frames.shift;
      }
      if (this.frames.length > 3) {
        let sum = this.frames.reduce((previous, current) => (current += previous));
        this.fps = sum / this.frames.length;
      }
    }
    this.lastUpdated = now;
  }

  render(): void {
    const c = this.game.context;
    const h = this.game.logicalHeight;
    const w = this.game.logicalWidth;
    c.fillStyle = 'red';
    c.fillRect(0, 0, 10, 10);
    c.fillRect(w - 10, 0, 10, 10);
    c.fillRect(0, h - 10, 10, 10);
    c.fillRect(w - 10, h - 10, 10, 10);
    renderText(
      this.game.controller.direction[0] +
        ' ' +
        this.game.controller.direction[1] +
        ' ' +
        Math.ceil(1000 / this.fps),
      'red',
      1,
      c,
      [10, 10],
      []
    );
    //renderText('1234567890', 'red', 5, c, [10,10]);
    //debugRenderText('abcdefghijklmnopqrstuvwxyz', 'red', 3, c, [10,10]);
  }
}
