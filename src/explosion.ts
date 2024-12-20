import { EntityInterface } from './entity';
import { Game } from './game';
import { rotate } from './math';
import { Body } from './body';
import { Bullet } from './bullet';
import { explosionSound } from './audio';

export class Explosion implements EntityInterface {
  finished = false;
  body?: Body;
  public duration: number = 150;
  private readonly pieces: Array<[number, number]> = new Array<[number, number]>();
  private position: [number, number];
  private start: number;
  private color: string = 'white';

  constructor(
    private readonly game: Game,
    position: [number, number],
    delay: number = 0,
    bullets: boolean = true,
    color: string = 'white',
    private readonly numberOfPieces = 24,
    private readonly soundFunction: () => void = explosionSound
  ) {
    this.game = game;
    this.start = game.now + delay;
    this.position = [position[0], position[1]];
    this.color = color;
    for (let i = 0; i < this.numberOfPieces; i++) {
      this.pieces.push([Math.random() * 2 - 1, Math.random() * 2 - 1]);
    }
    if (bullets) {
      for (let i: number = 0; i < 3; i++) {
        var direction = rotate([0, 0], [0, -1], i * 120 + 180);
        this.game.entities.push(
          new Bullet(this.game, [this.position[0], this.position[1]], [direction[0], direction[1]])
        );
      }
    }
    try {
      this.soundFunction();
    } catch {}
  }

  update(now: number): void {
    const dt = now - this.start;
    if (dt > this.duration) {
      this.finished = true;
    }
  }

  render(): void {
    if (this.start < this.game.now) {
      const dt = (this.game.now - this.start) / 5;
      const c = this.game.context;
      c.save();
      c.translate(this.position[0], this.position[1]);
      c.fillStyle = this.color;
      for (var p of this.pieces) {
        c.fillRect(-5 + p[0] * dt, -5 + p[1] * dt, 5, 5);
      }
      c.restore();
    }
  }
}
