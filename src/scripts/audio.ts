import { Synth, Frequency, Time, Reverb } from 'tone';

let audioInitialized = false;
let synth: Synth;
let explosionSynth: Synth;
let collisionSynth: Synth;

document.addEventListener('keydown', function(keyboardEvent: KeyboardEvent) {
  if (!audioInitialized) {
    audioInitialized = true;
    // synth = createSynth();
    // synth.toDestination();
    // var reverb = new Reverb(2).toDestination();
    // explosionSynth = createSynth();
    // explosionSynth.connect(reverb);
    // var collisionReverb = new Reverb(1.2).toDestination();
    // collisionSynth = createSynth();
    // collisionSynth.connect(collisionReverb);
  }
});

function createSynth(): Synth {
  return new Synth({
    oscillator: {
      //type: "amtriangle",
      //harmonicity: 0.5,
      modulationType: 'square', // "sine"
    },
    envelope: {
      attackCurve: 'linear',
      attack: 0.01,
      decay: 0.01,
      decayCurve: 'linear',
      sustain: 0.0,
      release: 0.01,
      releaseCurve: 'linear',
    },
    portamento: 0.0,
  });
}

export function explosionSound() {
  // try {
  //   if (explosionSynth) {
  //     explosionSynth.volume.value = 40;
  //     explosionSynth.triggerAttackRelease('C1', '4n');
  //   }
  // }
  // catch{}
}

export function collisionSound() {
  // try{
  //   if (collisionSynth) {
  //       collisionSynth.volume.value = 10;
  //       collisionSynth.triggerAttackRelease('C2', '4n');
  //   }
  // }
  // catch{}
}

export function laserSound() {
  // try{
  //   if (synth) {
  //     synth.triggerAttackRelease('C5', '8n');
  //   }
  // }
  // catch{}
}

let alternateMoveSound: boolean = false;

export function moveSound() {
  // try{
  //   if (synth) {
  //     if (alternateMoveSound) {
  //       synth.triggerAttackRelease('B5', '8n');
  //     } else {
  //       synth.triggerAttackRelease('C5', '8n');
  //     }
  //     alternateMoveSound = !alternateMoveSound;
  //   }
  // }
  // catch{}
}
