let firstInput: boolean = false;

export function afterInput() {
  // On iOS audio only becomes available after first user input
  // This method is called from canvas and webgl renders as UI events
  // originate there
  if (!firstInput) {
    firstInput = true;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      try {
        appearAudio.play();
        explosionAudio.play();
        laserAudio.play();
        blipLow.play();
        blipLow.play();
      } catch (e) {}
    }
  }
}
const startAudio: ISound = initSound('resources/audio/effects/start.mp3');
const explosionAudio: ISound = initSound('resources/audio/effects/explosion.mp3');
const appearAudio: ISound = initSound('resources/audio/effects/appear.mp3');
const laserAudio: ISound = initSound('resources/audio/effects/laser.mp3');
const laserUfoAudio: ISound = initSound('resources/audio/effects/laser-ufo.mp3');
const blipHi: ISound = initSound('resources/audio/effects/blip-hi.mp3');
const blipLow: ISound = initSound('resources/audio/effects/blip-low.mp3');
const collisionAudio: ISound = initSound('resources/audio/effects/collision.mp3');

function loadSound(
  url: string,
  ctx: AudioContext,
  onSuccess: (b: AudioBuffer) => void,
  onError: () => void
) {
  const request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer'; // Important trick
  request.onload = () => {
    ctx.decodeAudioData(
      request.response,
      (buffer: AudioBuffer) => {
        onSuccess(buffer);
      },
      () => {
        onError();
      }
    );
  };
  request.send();
}

function playSound(ctx: AudioContext, buffer: AudioBuffer, gain: number = 1.0, rate: number = 1.0) {
  const gainNode = ctx.createGain();
  gainNode.gain.value = gain;
  gainNode.connect(ctx.destination);
  const source = ctx.createBufferSource();
  source.playbackRate.value = rate;
  source.buffer = buffer;
  source.connect(gainNode);
  source.start(0);
}

interface ISound {
  url: string;
  play: (gain?: number, rate?: number) => void;
  init: () => any;
}

function initSound(url: string): ISound {
  const result = {
    init: () => {
      const audioContext = new ((<any>window).AudioContext || (<any>window).webkitAudioContext)();
      loadSound(
        result.url,
        audioContext,
        (buffer: AudioBuffer) => {
          result.play = (gain: number = 1.0, rate: number = 1.0) => {
            playSound(audioContext, buffer, gain, rate);
          };
        },
        () => {}
      );
    },
    play: () => {},
    url,
  };
  result.init();
  return result;
}

export function startSound() {
  startAudio.play();
}

export function explosionSound() {
  explosionAudio.play();
}

export function collisionSound() {
  collisionAudio.play(0.6);
}

export function laserSound() {
  laserUfoAudio.play();
}

export function laserUfoSound() {
  laserAudio.play();
}

let alternateMoveSound: boolean = false;

export function moveSound() {
  if (alternateMoveSound) {
    blipHi.play(0.3);
  } else {
    blipLow.play(0.3);
  }
  alternateMoveSound = !alternateMoveSound;
}

let alternateEndSound: boolean = false;

export function endSound() {
  if (alternateEndSound) {
    blipLow.play(1, 0.2);
  } else {
    blipLow.play(1, 0.3);
  }
  alternateEndSound = !alternateEndSound;
}

let alternateUfoSound: boolean = false;

export function ufoSound() {
  if (alternateUfoSound) {
    blipHi.play(0.2, 0.3);
  } else {
    blipHi.play(0.1, 0.6);
  }
  alternateUfoSound = !alternateUfoSound;
}
