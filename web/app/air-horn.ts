const BASE_FREQ = 233;
const BLAST_DURATION = 0.75;
const PARTIALS = [
  { ratio: 1, gain: 0.5, detune: 0 },
  { ratio: 1.005, gain: 0.35, detune: 6 },
  { ratio: 1.5, gain: 0.28, detune: -4 },
  { ratio: 2.01, gain: 0.14, detune: 3 }
];

let context: AudioContext | null = null;
let shaperCurve: Float32Array<ArrayBuffer> | null = null;

/**
 * Lazily creates (and resumes) the shared AudioContext. Construction is deferred
 * to the first blast because browsers only allow audio to start from a user
 * gesture.
 *
 * @returns The shared AudioContext, or null when Web Audio is unavailable.
 */
function getContext(): AudioContext | null {
  const Ctor = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  context ??= new Ctor();
  if (context.state === "suspended") void context.resume();
  return context;
}

/**
 * Builds the soft-clipping transfer curve that gives the horn its brassy rasp.
 *
 * @returns A curve suitable for a WaveShaperNode.
 */
function getShaperCurve(): Float32Array<ArrayBuffer> {
  if (shaperCurve) return shaperCurve;
  const samples = 1024;
  const curve = new Float32Array(samples);
  for (let i = 0; i < samples; i += 1) {
    const x = (i / (samples - 1)) * 2 - 1;
    curve[i] = Math.tanh(x * 3);
  }
  shaperCurve = curve;
  return shaperCurve;
}

/**
 * Sounds one air-horn blast, synthesised from detuned sawtooth partials pushed
 * through a soft clipper and a lowpass filter.
 *
 * @param pitch Multiplier applied to the horn's base frequency; above 1 raises
 *              the pitch, below 1 lowers it.
 */
export function playAirHorn(pitch: number): void {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const end = now + BLAST_DURATION;
  const fundamental = BASE_FREQ * pitch;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.linearRampToValueAtTime(0.8, now + 0.02);
  master.gain.setValueAtTime(0.8, end - 0.12);
  master.gain.exponentialRampToValueAtTime(0.001, end);

  const clipper = ctx.createWaveShaper();
  clipper.curve = getShaperCurve();
  clipper.oversample = "2x";

  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = Math.min(fundamental * 14, 12000);
  tone.Q.value = 0.7;

  master.connect(clipper);
  clipper.connect(tone);
  tone.connect(ctx.destination);

  const oscillators = PARTIALS.map((partial) => {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.detune.value = partial.detune;
    // Slide up into the note so the blast gets the characteristic horn "bark".
    osc.frequency.setValueAtTime(fundamental * partial.ratio * 0.86, now);
    osc.frequency.exponentialRampToValueAtTime(fundamental * partial.ratio, now + 0.06);

    const gain = ctx.createGain();
    gain.gain.value = partial.gain;

    osc.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(end + 0.05);
    return osc;
  });

  oscillators[oscillators.length - 1].onended = () => {
    master.disconnect();
    clipper.disconnect();
    tone.disconnect();
  };
}
