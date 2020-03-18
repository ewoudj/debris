import { EntityInterface } from './entity';
import { Ship } from './ship';
import { Debug } from './debug';
import { Controller } from './controller';
import { DebrisField } from './debrisfield';
import { Physics } from './physics';
import { Hud } from './hud';

export class Game {
  readonly logicalWidth: number = 800;
  readonly logicalHeight: number = 600;
  readonly canvas: HTMLCanvasElement;
  readonly context: CanvasRenderingContext2D;
  readonly controller: Controller;
  readonly entities: Array<EntityInterface> = [];

  private _now: number = 0;
  private _timePauzed: number = 0;
  private _totalTimeInPauze: number = 0;
  private _pauzed: boolean = false;

  score: number = 0;
  hiscore: number = 0;
  hiscoreName: string = '??????';

  public constructor(container: HTMLElement) {
    this.canvas = document.createElement('canvas');
    document.ontouchmove = function(e) {
      e.preventDefault();
    };
    document.body.addEventListener(
      'touchmove',
      function(event) {
        event.preventDefault();
      },
      {
        passive: false,
        capture: false,
      }
    );
    container.appendChild(this.canvas);

    this.context = this.canvas.getContext('2d') || new CanvasRenderingContext2D();
    this.controller = new Controller(this.togglePauze.bind(this));
    this.initializeScalingAndPositioning();
    this.initializeGame();
  }

  get now(): number {
    return this._now;
  }

  public initializeScalingAndPositioning() {
    const game = this;

    function resizeHandler() {
      const c = game.canvas;
      const h = game.logicalHeight;
      const w = game.logicalWidth;
      c.width = document.body.clientWidth;
      c.height = document.body.clientHeight;
      const widthScale = c.width / w;
      const heightScale = c.height / h;
      const smallestScale = widthScale < heightScale ? widthScale : heightScale;
      game.context.translate((c.width - w * smallestScale) / 2, 0);
      game.context.scale(smallestScale, smallestScale);
      game.context.beginPath();
      game.context.rect(0, 0, w, h);
      game.context.clip();
    }

    window.addEventListener('resize', resizeHandler);
    resizeHandler();
  }

  public initializeGame() {
    const c = this.context;
    const h = this.logicalHeight;
    const w = this.logicalWidth;
    const entities = this.entities;
    const controller = this.controller;
    const self = this;

    this.initializeEntities();

    function animationHandler() {
      window.requestAnimationFrame(animationHandler);
      c.clearRect(-1, -1, w + 2, h + 2);
      if (!self._pauzed) {
        self._now = Date.now() - self._totalTimeInPauze;
        controller.update(self._now);
        entities.forEach(e => e.update(self._now));
        entities.forEach(e => e.render());
        const unFinishedEntities = entities.filter(e => !e.finished);
        while (entities.pop()) {}
        entities.push(...unFinishedEntities);
      } else {
        entities.forEach(e => e.render());
      }
    }
    animationHandler();
  }

  public togglePauze() {
    this._pauzed = !this._pauzed;
    if (this._pauzed) {
      this._timePauzed = Date.now();
    } else {
      this._totalTimeInPauze += Date.now() - this._timePauzed;
    }
  }

  public initializeEntities() {
    while (this.entities.pop()) {}
    this._now = Date.now();
    this._totalTimeInPauze = 0;
    this._pauzed = false;
    this.entities.push(new Physics(this));
    this.entities.push(new Hud(this));
    this.entities.push(new Ship(this));
    this.entities.push(new DebrisField(this));
    //this.entities.push(new Debug(this));
  }
}
