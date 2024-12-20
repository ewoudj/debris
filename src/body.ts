export class Body {
  public kind: string = '';
  public mass: number = 0;
  public position: [number, number] = [0, 0];
  public velocity: [number, number] = [0, 0];
  public acceleration: [number, number] = [0, 0];
  public attractedTo: Array<string> | 'any' | 'none' = 'any';
  public shape: Circle | Ellipse = new Circle();
}

export class Circle {
  radius: number = 0;
  constructor(r: number = 0) {
    this.radius = r;
  }
}

export class Ellipse {
  horizontalRadius: number = 0;
  verticalRadius: number = 0;
  constructor(h: number = 0, v: number = 0) {
    this.horizontalRadius = h;
    this.verticalRadius = v;
  }
}
