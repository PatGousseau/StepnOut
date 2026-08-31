import { assertEquals, assertThrows } from "jsr:@std/assert@1";
import { inspectM4a, validateVoiceJournalM4a } from "./m4a.ts";

const encoder = new TextEncoder();

function join(...parts: Uint8Array[]) {
  const result = new Uint8Array(
    parts.reduce((sum, part) => sum + part.length, 0),
  );
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

function box(type: string, data: Uint8Array) {
  const result = new Uint8Array(8 + data.length);
  const view = new DataView(result.buffer);
  view.setUint32(0, result.length);
  result.set(encoder.encode(type), 4);
  result.set(data, 8);
  return result;
}

function durationBox(type: string, milliseconds: number) {
  const data = new Uint8Array(20);
  const view = new DataView(data.buffer);
  view.setUint32(12, 1000);
  view.setUint32(16, milliseconds);
  return box(type, data);
}

function fixture({
  movieDuration = 12000,
  audioDuration = 12000,
  handler = "soun",
} = {}) {
  const ftyp = box(
    "ftyp",
    join(
      encoder.encode("M4A "),
      new Uint8Array(4),
      encoder.encode("isom"),
    ),
  );
  const hdlrData = new Uint8Array(12);
  hdlrData.set(encoder.encode(handler), 8);
  const mdia = box(
    "mdia",
    join(
      durationBox("mdhd", audioDuration),
      box("hdlr", hdlrData),
    ),
  );
  const moov = box(
    "moov",
    join(
      durationBox("mvhd", movieDuration),
      box("trak", mdia),
    ),
  );
  return join(ftyp, box("mdat", new Uint8Array([1, 2, 3, 4])), moov);
}

Deno.test("reads movie and audio-track durations from a bounded M4A", () => {
  assertEquals(inspectM4a(fixture()), {
    movieDurationMs: 12000,
    audioDurationMs: 12000,
  });
});

Deno.test("rejects arbitrary bytes containing an mvhd marker", () => {
  assertThrows(() =>
    inspectM4a(encoder.encode("not audio mvhd plus arbitrary bytes"))
  );
});

Deno.test("rejects malformed atom sizes", () => {
  const malformed = fixture();
  new DataView(malformed.buffer).setUint32(0, malformed.length + 100);
  assertThrows(() => inspectM4a(malformed));
});

Deno.test("rejects MP4 containers without an audio track", () => {
  assertThrows(() => inspectM4a(fixture({ handler: "vide" })));
});

Deno.test("rejects movie and audio-track duration mismatch", () => {
  assertThrows(() =>
    validateVoiceJournalM4a(
      fixture({ movieDuration: 12000, audioDuration: 300000 }),
      12000,
    )
  );
});
