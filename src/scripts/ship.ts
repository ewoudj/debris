import { EntityInterface } from './entity';
import { Game } from './game';
import { Controller } from './controller';
import { rotate, move } from './math';
import { Bullet } from './bullet';
import { Body, Circle, Ellipse } from './body';
import { Debris } from './debris';
import { Explosion } from './explosion';
import { laserSound, moveSound } from './audio';
import { Ufo } from './ufo';
import { Laser } from './laser';

export class Ship implements EntityInterface {
  collisions?: Array<EntityInterface>;
  body: Body = {
    kind: 'Ship',
    mass: 1200,
    position: [0, 0],
    velocity: [0, 0],
    acceleration: [0, 0],
    attractedTo: 'none',
    shape: new Circle(10),
  };
  finished = false;
  private readonly rects: Array<[number, number, number, number]>;
  private readonly speed: number = 4;
  private readonly shieldElements: number = 8;
  private readonly gunRotationSpeed: number = -360 / 4;
  private readonly depletionDuration: number = 900;
  private readonly chargingDuration: number = 600;
  private readonly maxBullets: number = 6;
  private readonly bulletInterval: number = 75;
  private readonly shieldDiameter: number = 32;
  private readonly shieldEllipseFactor: number = 1.6;
  private bulletsRemaining: number = 0;
  private timeBulletLastFired: number;
  private bulletPosition: [number, number] = [0, 0];
  private bulletDirection: [number, number] = [0, 0];
  private gunAngle: number = 0;
  private windowIndexLastChangedTime: number;
  private lastUpdated: number;
  private windowIndex: number = 0;
  private state: 'Ready' | 'Charging' | 'Depleted' | 'Exploding' = 'Ready';
  private buttonDown: boolean = false;
  private buttonDownTime: number;
  private percentageCharged: number = 100;
  private currentDimmedShieldlementIndex: number = 0;
  private dimmedShieldlementLastChanged: number;
  private moveSoundLastInvoke: number;
  private explosionStart: number = 0;
  private explosion?: Explosion;

  constructor(private readonly game: Game) {
    this.timeBulletLastFired = game.now;
    this.windowIndexLastChangedTime = game.now;
    this.lastUpdated = game.now;
    this.buttonDownTime = game.now;
    this.dimmedShieldlementLastChanged = game.now;
    this.moveSoundLastInvoke = game.now;
    this.body.position = [game.logicalWidth / 2, game.logicalHeight / 2];
    this.rects = [
      [-5, -8, 10, 5],
      [-10, -3, 20, 5],
      [-20, 2, 40, 5],
      [-10, 7, 20, 5],
    ];
    this.body.shape = new Ellipse(
      this.shieldDiameter,
      this.shieldDiameter / this.shieldEllipseFactor
    );
  }

  constrainToScreen(): void {
    const p = this.body.position;
    const w = this.game.logicalWidth;
    const h = this.game.logicalHeight;
    if (p[0] > w) {
      p[0] = w;
    } else if (p[0] < 0) {
      p[0] = 0;
    }
    if (p[1] > h) {
      p[1] = h;
    } else if (p[1] < 0) {
      p[1] = 0;
    }
  }

  update(now: number): void {
    const controller: Controller = this.game.controller;
    if (
      (controller.direction[0] !== 0 || controller.direction[1] !== 0) &&
      now - this.moveSoundLastInvoke > 200
    ) {
      moveSound();
      this.moveSoundLastInvoke = now;
    }
    move(this.body.position, controller.direction, this.speed, now - this.lastUpdated);
    this.constrainToScreen();
    if (this.bulletsRemaining && now - this.timeBulletLastFired > this.bulletInterval) {
      this.bulletsRemaining--;
      this.timeBulletLastFired = now;
      laserSound();
      this.game.entities.push(
        new Bullet(
          this.game,
          [this.bulletPosition[0], this.bulletPosition[1]],
          [this.bulletDirection[0], this.bulletDirection[1]]
        )
      );
    }
    if (controller.direction[1] !== 0 || controller.direction[0] !== 0) {
      this.gunAngle += this.gunRotationSpeed / (now - this.lastUpdated);
    }
    if (now - this.windowIndexLastChangedTime > 100) {
      this.windowIndexLastChangedTime = now;
      this.windowIndex += 1;
      if (this.windowIndex > 7) {
        this.windowIndex = 0;
      }
    }
    if (controller.buttonDown && (this.state === 'Ready' || this.state === 'Charging')) {
      this.buttonDown = true;
      this.deplete(now, this.maxBullets);
    } else if (!controller.buttonDown && this.buttonDown) {
      this.buttonDown = false;
    } else if (this.state === 'Depleted' && now - this.buttonDownTime > this.depletionDuration) {
      this.state = 'Charging';
    } else if (this.state === 'Charging') {
      const timeSpendCharging = now - this.buttonDownTime - this.depletionDuration;
      this.percentageCharged = timeSpendCharging / (this.chargingDuration / 100);
      if (this.percentageCharged > 100) {
        this.percentageCharged = 100;
        this.state = 'Ready';
      }
    } else if (this.state === 'Exploding') {
      if (!this.explosion || this.explosion.finished) {
        this.explosion = new Explosion(
          this.game,
          [this.body.position[0], this.body.position[1]],
          0,
          false
        );
        this.game.entities.push(this.explosion);
      }
      if (this.explosion.body) {
        this.explosion.body.position[0] = this.body.position[0];
        this.explosion.body.position[1] = this.body.position[1];
      }
      if (now - this.explosionStart > 5000) {
        this.explosion.duration = 400;
        this.finished = true;
        if (this.game.score >= this.game.hiscore) {
          this.game.hiscore = this.game.score;
          this.game.hiscoreName = '??????';
        }
        setTimeout(() => this.game.initializeEntities(), 5000);
      }
    }
    if (now - this.dimmedShieldlementLastChanged > 30) {
      this.dimmedShieldlementLastChanged = now;
      this.currentDimmedShieldlementIndex--;
      if (this.currentDimmedShieldlementIndex < 0) {
        this.currentDimmedShieldlementIndex = this.shieldElements;
      }
    }
    if (this.collisions && this.collisions.length && this.state !== 'Exploding' && !this.finished) {
      for (const c of this.collisions) {
        if ((c instanceof Debris || c instanceof Ufo || c instanceof Laser) && c.body) {
          if (this.state === 'Depleted' || this.state === 'Charging') {
            this.state = 'Exploding';
            this.explosionStart = now;
            this.body.mass = 0;
          } else {
            if (c instanceof Ufo) {
              this.game.score += 10;
            } else if (c instanceof Debris) {
              this.game.score += c.isMagnetic ? 3 : 1;
            }
          }
          c.finished = true;
          this.game.entities.push(
            new Explosion(this.game, [c.body.position[0], c.body.position[1]])
          );
          if (this.state !== 'Exploding') {
            this.deplete(now, 0);
          }
        }
      }
    }
    if (this.state === 'Depleted' || this.state === 'Charging') {
      this.body.shape = new Ellipse(
        this.shieldDiameter / 2,
        this.shieldDiameter / 2 / this.shieldEllipseFactor
      );
    } else {
      this.body.shape = new Ellipse(
        this.shieldDiameter,
        this.shieldDiameter / this.shieldEllipseFactor
      );
    }
    this.lastUpdated = now;
  }

  private deplete(now: number, remainingBullets: number) {
    this.state = 'Depleted';
    this.bulletsRemaining = remainingBullets;
    this.buttonDownTime = now;
    this.percentageCharged = 0;
  }

  render(): void {
    const c = this.game.context;
    c.save();
    c.translate(this.body.position[0], this.body.position[1]);
    // Renders the ship
    c.fillStyle = this.state === 'Exploding' ? 'white' : 'red';
    for (var r of this.rects) {
      c.fillRect(r[0], r[1], r[2], r[3] + 0.5);
    }
    // Renders the rotating window
    c.fillStyle = 'black';
    c.fillRect(-20 + this.windowIndex * 5, 2, 5, 5.5);
    // Renders the shield
    if (this.state !== 'Exploding') {
      const n: number = this.shieldElements;
      let p: [number, number] = [0, this.shieldDiameter];
      p = rotate([0, 0], p, this.gunAngle);
      for (let i = 0; i < n; i++) {
        p = rotate([0, 0], p, 360 / n);
        if (i === 0) {
          c.fillStyle = 'white';
          this.bulletDirection = [p[0] - 2.5, p[1] / this.shieldEllipseFactor];
          this.bulletPosition = [
            this.body.position[0] + p[0] - 2.5,
            this.body.position[1] + p[1] / this.shieldEllipseFactor,
          ];
        } else {
          if (this.state === 'Charging' && (n - i) / (n / 100) > this.percentageCharged) {
            c.fillStyle =
              'rgba(128, 128, 128, ' +
              (i === this.currentDimmedShieldlementIndex ? '0.3' : '1') +
              ')';
          } else {
            c.fillStyle =
              'rgba(100, 149, 237, ' +
              (i === this.currentDimmedShieldlementIndex ? '1' : '0.8') +
              ')';
          }
        }
        if (this.state !== 'Depleted' || (i === 0 && this.bulletsRemaining > 0)) {
          c.fillRect(p[0] - 2.5, p[1] / this.shieldEllipseFactor, 5, 5);
        }
      }
    }
    c.restore();
  }
}
