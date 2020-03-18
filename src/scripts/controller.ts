export class Controller {
  private _direction: [number, number] = [0, 0];
  private _buttonDown: boolean = false;
  private _upKeyDown: boolean = false;
  private _downKeyDown: boolean = false;
  private _leftKeyDown: boolean = false;
  private _rightKeyDown: boolean = false;
  private _anyUserInteraction: boolean = false;
  private _firstInterActionListeners: Array<() => void> = [];
  private _keyboardBuffer: string = '';
  private _activeController: 'keyboard' | string = 'keyboard';
  private _leftTouchID: number = -1;
  private _rightTouchID: number = -1;
  private _secondRightTouchID: number = -1;
  private _leftTouchPos: [number, number] = [0, 0];
  private _leftTouchStartPos: [number, number] = [0, 0];
  private _leftVector: [number, number] = [0, 0];
  private _touchable: boolean = 'createTouch' in document;
  private _touches?: TouchList;
  private _pauzeHandler: () => void;

  private gamepadConfiguration: { [label: string]: GamepadConfiguration } = {
    'USB Gamepad  (STANDARD GAMEPAD Vendor: 0079 Product: 0011)': {
      steering: 'buttons',
      horizontalAxis: 0,
      verticalAxis: 0,
      leftButton: 14,
      rightButton: 15,
      upButton: 12,
      downButton: 13,
      fireButton: 1,
    },
    'SPEEDLINK COMPETITION PRO (Vendor: 0738 Product: 2217)': {
      steering: 'axes',
      horizontalAxis: 0,
      verticalAxis: 1,
      leftButton: 0,
      rightButton: 0,
      upButton: 0,
      downButton: 0,
      fireButton: 0,
    },
  };

  constructor(pauzeHandler: () => void) {
    this._pauzeHandler = pauzeHandler;
    document.addEventListener('keydown', this.keyDownHandler.bind(this));
    document.addEventListener('keyup', this.keyUpHandler.bind(this));
    if (this._touchable) {
      window.addEventListener('touchstart', this.onTouchStart.bind(this), false);
      window.addEventListener('touchmove', this.onTouchMove.bind(this), false);
      window.addEventListener('touchend', this.onTouchEnd.bind(this), false);
    }
  }

  onTouchStart(e: TouchEvent) {
    let foundLeft = false;
    let foundRight = false;
    for (var i = 0, l = e.touches.length; i < l; i++) {
      if (e.touches[i].identifier === this._leftTouchID) {
        foundLeft = true;
      } else if (e.touches[i].identifier === this._rightTouchID) {
        foundRight = true;
      }
    }
    if (!foundLeft) {
      this._leftTouchID = -1;
    }
    if (!foundRight) {
      this._rightTouchID = -1;
    }
    for (var i = 0, l = e.changedTouches.length; i < l; i++) {
      var touch = e.changedTouches[i];
      if (this._leftTouchID < 0 && touch.clientX < window.innerWidth / 2) {
        this._leftTouchID = touch.identifier;
        this._leftTouchStartPos = [touch.clientX, touch.clientY];
        this._leftVector = [0, 0];
      }
      // else if(this.inMenuArea(touch.clientX, touch.clientY)){
      //   // Button down event
      //   this.secondRightTouchID = touch.identifier;
      //   this.engine.rightButtonDown = true;
      // }
      else if (this._rightTouchID < 0) {
        // Button down event
        this._rightTouchID = touch.identifier;
        this._buttonDown = true;
      }
    }
    this._touches = e.touches;
  }

  onTouchMove(e: TouchEvent) {
    e.preventDefault(); // Prevent the browser from doing its default thing (scroll, zoom)
    for (var i = 0, l = e.changedTouches.length; i < l; i++) {
      var touch = e.changedTouches[i];
      if (this._leftTouchID === touch.identifier) {
        this._direction = [
          (touch.clientX - this._leftTouchStartPos[0]) / 100,
          (touch.clientY - this._leftTouchStartPos[1]) / 100,
        ];
        break;
      }
    }
    this._touches = e.touches;
  }

  onTouchEnd(e: TouchEvent) {
    this._touches = e.touches;
    for (var i = 0, l = e.changedTouches.length; i < l; i++) {
      var touch = e.changedTouches[i];
      if (this._leftTouchID === touch.identifier) {
        this._leftTouchID = -1;
        this._direction = [0, 0];
      } else if (this._rightTouchID === touch.identifier) {
        this._rightTouchID = -1;
        this._buttonDown = false;
      }
      // else if(this.secondRightTouchID === touch.identifier && this.inMenuArea(touch.clientX, touch.clientY)){
      //   this.secondRightTouchID = -1;
      //   this.engine.rightButtonDown = false;
      // }
    }
  }

  addFirstInterActionListener(handler: () => void): void {
    if (this._anyUserInteraction) {
      handler();
    } else {
      this._firstInterActionListeners.push(handler);
    }
  }

  private handleInterAction(): void {
    if (!this._anyUserInteraction) {
      this._anyUserInteraction = true;
      for (let handler of this._firstInterActionListeners) {
        handler();
      }
    }
  }

  update(now: number): void {
    [...navigator.getGamepads()]
      .filter(p => p && p.connected)
      .forEach(p => {
        if (p && this.gamepadConfiguration[p.id]) {
          const c = this.gamepadConfiguration[p.id];
          if (c.steering === 'buttons') {
            this._leftKeyDown = p.buttons[c.leftButton].pressed;
            this._rightKeyDown = p.buttons[c.rightButton].pressed;
            this._upKeyDown = p.buttons[c.upButton].pressed;
            this._downKeyDown = p.buttons[c.downButton].pressed;
          } else {
            this._leftKeyDown = p.axes[c.horizontalAxis] === -1;
            this._rightKeyDown = p.axes[c.horizontalAxis] === 1;
            this._upKeyDown = p.axes[c.verticalAxis] === -1;
            this._downKeyDown = p.axes[c.verticalAxis] === 1;
          }
          if (
            this._leftKeyDown ||
            this._rightKeyDown ||
            this._upKeyDown ||
            this._downKeyDown ||
            p.buttons[c.fireButton].pressed
          ) {
            this._activeController = p.id;
          }
          if (this._activeController === p.id) {
            this._buttonDown = p.buttons[c.fireButton].pressed;
            this.updateDirection();
          }
        }
      });
  }

  get keyboardBuffer(): string {
    const result = this._keyboardBuffer;
    this._keyboardBuffer = '';
    return result;
  }

  get direction(): [number, number] {
    return this._direction;
  }

  get buttonDown(): boolean {
    return this._buttonDown;
  }

  keyDownHandler(keyboardEvent: KeyboardEvent) {
    this.handleInterAction();
    if (keyboardEvent.key === 'ArrowUp') {
      this._upKeyDown = true;
    }
    if (keyboardEvent.key === 'ArrowLeft') {
      this._leftKeyDown = true;
    }
    if (keyboardEvent.key === 'ArrowDown') {
      this._downKeyDown = true;
    }
    if (keyboardEvent.key === 'ArrowRight') {
      this._rightKeyDown = true;
    }
    if (keyboardEvent.key === 'Control') {
      this._buttonDown = true;
    }
    if (
      this._leftKeyDown ||
      this._rightKeyDown ||
      this._upKeyDown ||
      this._downKeyDown ||
      this.buttonDown
    ) {
      this._activeController = 'keyboard';
    }
    this.updateDirection();
  }

  keyUpHandler(keyboardEvent: KeyboardEvent) {
    if (keyboardEvent.key === 'Escape') {
      this._pauzeHandler();
    }
    if (keyboardEvent.key === 'ArrowUp') {
      this._upKeyDown = false;
    }
    if (keyboardEvent.key === 'ArrowLeft') {
      this._leftKeyDown = false;
    }
    if (keyboardEvent.key === 'ArrowDown') {
      this._downKeyDown = false;
    }
    if (keyboardEvent.key === 'ArrowRight') {
      this._rightKeyDown = false;
    }
    if (keyboardEvent.key === 'Control') {
      this._buttonDown = false;
    }
    if (keyboardEvent.key.length == 1 && /^[a-z0-9]+$/i.test(keyboardEvent.key)) {
      this._keyboardBuffer += keyboardEvent.key;
    }
    this.updateDirection();
  }

  updateDirection(): void {
    this.direction[0] = 0;
    this.direction[1] = 0;
    if (this._leftKeyDown) this.direction[0] = -1;
    if (this._rightKeyDown) this.direction[0] = 1;
    if (this._upKeyDown) this.direction[1] = -1;
    if (this._downKeyDown) this.direction[1] = 1;
  }
}

export class GamepadConfiguration {
  steering: 'buttons' | 'axes' = 'buttons';
  horizontalAxis: number = 0;
  verticalAxis: number = 0;
  leftButton: number = 0;
  rightButton: number = 0;
  upButton: number = 0;
  downButton: number = 0;
  fireButton: number = 0;
}
