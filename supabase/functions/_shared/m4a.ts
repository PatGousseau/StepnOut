type IsoBox = {
  type: string;
  dataStart: number;
  end: number;
};

function readBoxes(bytes: Uint8Array, start = 0, end = bytes.length): IsoBox[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const boxes: IsoBox[] = [];
  let offset = start;
  while (offset < end) {
    if (end - offset < 8) throw new Error("invalid_m4a_box_header");
    let size = view.getUint32(offset);
    const type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
    let headerSize = 8;
    if (size === 1) {
      if (end - offset < 16) throw new Error("invalid_m4a_extended_box");
      const extendedSize = view.getBigUint64(offset + 8);
      if (extendedSize > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw new Error("m4a_box_too_large");
      }
      size = Number(extendedSize);
      headerSize = 16;
    } else if (size === 0) {
      size = end - offset;
    }
    if (size < headerSize || offset + size > end) {
      throw new Error("invalid_m4a_box_size");
    }
    boxes.push({ type, dataStart: offset + headerSize, end: offset + size });
    offset += size;
  }
  return boxes;
}

function durationMs(bytes: Uint8Array, box: IsoBox): number {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (box.end - box.dataStart < 20) throw new Error("invalid_m4a_duration_box");
  const version = bytes[box.dataStart];
  if (version !== 0 && version !== 1) {
    throw new Error("invalid_m4a_box_version");
  }
  const timescaleOffset = box.dataStart + (version === 1 ? 20 : 12);
  const durationOffset = box.dataStart + (version === 1 ? 24 : 16);
  if (durationOffset + (version === 1 ? 8 : 4) > box.end) {
    throw new Error("invalid_m4a_duration_box");
  }
  const timescale = view.getUint32(timescaleOffset);
  const duration = version === 1
    ? Number(view.getBigUint64(durationOffset))
    : view.getUint32(durationOffset);
  if (!timescale || !Number.isSafeInteger(duration)) {
    throw new Error("invalid_m4a_duration");
  }
  return duration / timescale * 1000;
}

export function inspectM4a(bytes: Uint8Array): {
  movieDurationMs: number;
  audioDurationMs: number;
} {
  const topLevel = readBoxes(bytes);
  const ftyp = topLevel.find((box) => box.type === "ftyp");
  const moov = topLevel.find((box) => box.type === "moov");
  if (!ftyp || !moov || ftyp.end - ftyp.dataStart < 8) {
    throw new Error("invalid_m4a_container");
  }
  const brands = [];
  for (let offset = ftyp.dataStart; offset + 4 <= ftyp.end; offset += 4) {
    if (offset === ftyp.dataStart + 4) continue;
    brands.push(String.fromCharCode(...bytes.subarray(offset, offset + 4)));
  }
  if (
    !brands.some((brand) => ["M4A ", "isom", "mp41", "mp42"].includes(brand))
  ) {
    throw new Error("unsupported_m4a_brand");
  }

  const moovChildren = readBoxes(bytes, moov.dataStart, moov.end);
  const mvhd = moovChildren.find((box) => box.type === "mvhd");
  if (!mvhd) throw new Error("missing_m4a_movie_header");
  const movieDurationMs = durationMs(bytes, mvhd);
  let audioDurationMs: number | null = null;
  for (const trak of moovChildren.filter((box) => box.type === "trak")) {
    const trakChildren = readBoxes(bytes, trak.dataStart, trak.end);
    const mdia = trakChildren.find((box) => box.type === "mdia");
    if (!mdia) continue;
    const mdiaChildren = readBoxes(bytes, mdia.dataStart, mdia.end);
    const hdlr = mdiaChildren.find((box) => box.type === "hdlr");
    const mdhd = mdiaChildren.find((box) => box.type === "mdhd");
    if (!hdlr || !mdhd || hdlr.end - hdlr.dataStart < 12) continue;
    const handler = String.fromCharCode(
      ...bytes.subarray(hdlr.dataStart + 8, hdlr.dataStart + 12),
    );
    if (handler === "soun") {
      audioDurationMs = durationMs(bytes, mdhd);
      break;
    }
  }
  if (audioDurationMs === null) throw new Error("missing_m4a_audio_track");
  return { movieDurationMs, audioDurationMs };
}

export function validateVoiceJournalM4a(
  bytes: Uint8Array,
  claimedDurationMs: number,
  maxDurationMs = 181000,
) {
  const { movieDurationMs, audioDurationMs } = inspectM4a(bytes);
  if (
    audioDurationMs < 400 || audioDurationMs > maxDurationMs ||
    movieDurationMs < 400 || movieDurationMs > maxDurationMs ||
    Math.abs(movieDurationMs - audioDurationMs) > 2000 ||
    Math.abs(audioDurationMs - claimedDurationMs) > 2000
  ) {
    throw new Error("audio_duration_invalid");
  }
  return audioDurationMs;
}
