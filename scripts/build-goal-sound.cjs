/* global __dirname */
const fs = require("node:fs");
const path = require("node:path");
const { Buffer } = require("node:buffer");

// Original synthesized C–E–G chime. No samples, voices or licensed recordings.
// Mono PCM, 44.1 kHz, 1.6 seconds; gentle attacks and a quiet decaying tail.
const rate = 44100;
const duration = 1.6;
const samples = Math.round(rate * duration);
const wav = Buffer.alloc(44 + samples * 2);
wav.write("RIFF", 0);
wav.writeUInt32LE(wav.length - 8, 4);
wav.write("WAVEfmt ", 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(rate, 24);
wav.writeUInt32LE(rate * 2, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write("data", 36);
wav.writeUInt32LE(samples * 2, 40);
for (let i = 0; i < samples; i++) {
  const time = i / rate;
  let sample = 0;
  [523.251, 659.255, 783.991].forEach((frequency, note) => {
    const age = time - note * 0.2;
    if (age < 0) return;
    const envelope = Math.min(1, age / 0.025) * Math.exp(-age * 4.8);
    sample +=
      0.085 *
      envelope *
      (Math.sin(2 * Math.PI * frequency * age) +
        0.12 * Math.sin(2 * Math.PI * frequency * 2 * age));
  });
  sample *= Math.min(1, (duration - time) / 0.12);
  wav.writeInt16LE(Math.round(sample * 32767), 44 + i * 2);
}
const output = path.join(__dirname, "../public/audio/goal-complete.wav");
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, wav);
console.log(`Wrote ${duration}s original goal chime: ${output}`);
