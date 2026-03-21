/** Fields extracted from a PNG-embedded character card (CCv2/v3). */
export interface ParsedCharacterData {
  name: string;
  description: string;
  personality: string;
  scenario: string;
  first_mes: string;
  mes_example: string;
  creator: string;
  creator_notes: string;
  tags: string[];
  system_prompt: string;
  post_history_instructions: string;
  alternate_greetings: string[];
  character_version: string;
  _raw: Record<string, unknown>;
}

/**
 * Extracts character card data from a PNG file by reading its tEXt chunks.
 * Returns null if no embedded character data is found.
 */
export async function parseCharacterPng(file: File): Promise<ParsedCharacterData | null> {
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
    for (let i = 0; i < 8; i++) {
      if (bytes[i] !== PNG_SIGNATURE[i]) return null;
    }

    let offset = 8;
    while (offset < bytes.length) {
      const chunkLength = readUint32(bytes, offset);
      const chunkType = readString(bytes, offset + 4, 4);

      if (chunkType === 'tEXt') {
        const { keyword, text } = parseTEXtChunk(bytes, offset + 8, chunkLength);
        if (keyword === 'chara') {
          return decodeCharaPayload(text);
        }
      }

      offset += 4 + 4 + chunkLength + 4;
    }

    return null;
  } catch (err) {
    console.warn('[LumiHub] Failed to parse character PNG:', err);
    return null;
  }
}

/** Reads a 32-bit big-endian unsigned integer from a byte array. */
function readUint32(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset] << 24) |
      (bytes[offset + 1] << 16) |
      (bytes[offset + 2] << 8) |
      bytes[offset + 3]) >>>
    0
  );
}

/** Reads an ASCII string of the given length starting at offset. */
function readString(bytes: Uint8Array, offset: number, length: number): string {
  let s = '';
  for (let i = 0; i < length; i++) {
    s += String.fromCharCode(bytes[offset + i]);
  }
  return s;
}

/** Parses a PNG tEXt chunk into its keyword and text value. */
function parseTEXtChunk(
  bytes: Uint8Array,
  dataOffset: number,
  dataLength: number,
): { keyword: string; text: string } {
  let nullIndex = dataOffset;
  while (nullIndex < dataOffset + dataLength && bytes[nullIndex] !== 0) {
    nullIndex++;
  }

  const keyword = readString(bytes, dataOffset, nullIndex - dataOffset);
  const textStart = nullIndex + 1;
  const textLength = dataLength - (textStart - dataOffset);
  const text = readString(bytes, textStart, textLength);

  return { keyword, text };
}

/** Decodes a base64 "chara" payload, handling both CCv2 and CCv3 formats. */
function decodeCharaPayload(base64: string): ParsedCharacterData | null {
  try {
    const json = atob(base64);
    const parsed = JSON.parse(json);

    const data = parsed.data ?? parsed;

    return {
      name: data.name ?? data.char_name ?? '',
      description: data.description ?? data.char_persona ?? '',
      personality: data.personality ?? '',
      scenario: data.scenario ?? data.world_scenario ?? '',
      first_mes: data.first_mes ?? data.char_greeting ?? '',
      mes_example: data.mes_example ?? '',
      creator: data.creator ?? '',
      creator_notes: data.creator_notes ?? '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      system_prompt: data.system_prompt ?? '',
      post_history_instructions: data.post_history_instructions ?? '',
      alternate_greetings: Array.isArray(data.alternate_greetings)
        ? data.alternate_greetings
        : [],
      character_version: data.character_version ?? '',
      _raw: data,
    };
  } catch (err) {
    console.warn('[LumiHub] Failed to decode chara payload:', err);
    return null;
  }
}
