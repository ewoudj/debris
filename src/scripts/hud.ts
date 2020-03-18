import { EntityInterface } from './entity';
import { Game } from './game';
import { Body } from './body';
import { renderText } from './text';
import { Ship } from './ship';

export class Hud implements EntityInterface {
  body?: Body;
  finished = false;
  private readonly game: Game;
  private colorTable: Array<string> = [];
  private inputIndex: number = 0;
  private animationLastUpdate: number;
  private animationIndex: number = 5;

  constructor(game: Game) {
    this.game = game;
    this.game.score = 0;
    this.inputIndex = 5;
    this.animationLastUpdate = game.now;
    if (this.game.hiscoreName.indexOf('?') > -1) {
      this.inputIndex = this.game.hiscoreName.indexOf('?');
    }
    this.resetColorTable();
  }

  resetColorTable(): void {
    this.colorTable = new Array<string>(18);
    this.colorTable[0] = 'green';
    this.colorTable[5] = 'white';
    this.colorTable[6] = 'green';
    this.colorTable[13] = 'red';
  }

  update(now: number): void {
    const keyboardInput = this.game.controller.keyboardBuffer;
    if (this.game.hiscoreName === '??????') {
      this.inputIndex = 0;
    }
    if (keyboardInput) {
      const char = keyboardInput.substr(keyboardInput.length - 1, 1);
      this.game.hiscoreName = (this.game.hiscoreName.substr(0, this.inputIndex) + char).padEnd(
        6,
        '?'
      );
      if (this.inputIndex < 5) {
        this.inputIndex++;
      }
    }
    this.resetColorTable();
    if (!this.game.entities.find(e => e instanceof Ship)) {
      this.colorTable[this.animationIndex] = 'transparent';
      this.colorTable[this.animationIndex + 1] = 'green';
      if (now - this.animationLastUpdate > 50) {
        this.animationLastUpdate = now;
        this.animationIndex++;
        if (this.animationIndex > 11) {
          this.animationIndex = 5;
        }
      }
    }
  }

  render(): void {
    const c = this.game.context;
    const h = this.game.logicalHeight;
    const w = this.game.logicalWidth;
    const size = 5;
    const cw = size * 8;
    const margin = 10;
    const offsetBottom = h - (cw + margin);
    const s = `${this.game.hiscore.toString().padStart(5, '0')}>${
      this.game.hiscoreName
    } ${this.game.score.toString().padStart(5, '0')}`;
    renderText(s, 'green', size, c, [margin + 1 * cw, offsetBottom], this.colorTable);
  }
}
