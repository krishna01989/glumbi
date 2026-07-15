/**
 * Minimal hand-written protobuf binary encoder for ActivityEvent messages.
 *
 * Wire types:
 *   0 = VARINT  (int32, int64, bool)
 *   2 = LEN     (string, bytes, embedded message)
 *
 * Tag = (field_number << 3) | wire_type
 */

// ── Primitive encoders ────────────────────────────────────────────────────────

function encodeVarint(value) {
  const bytes = []
  // Handle BigInt (int64) and Number (int32/bool)
  let n = typeof value === 'bigint' ? value : BigInt(Math.trunc(value))
  if (n < 0n) n += (1n << 64n) // two's complement for negative values
  do {
    let byte = Number(n & 0x7fn)
    n >>= 7n
    if (n > 0n) byte |= 0x80
    bytes.push(byte)
  } while (n > 0n)
  return new Uint8Array(bytes)
}

function encodeString(str) {
  return new TextEncoder().encode(str)
}

function writeTag(fieldNumber, wireType) {
  return encodeVarint((fieldNumber << 3) | wireType)
}

function writeVarintField(fieldNumber, value) {
  if (!value && value !== 0 && value !== false) return new Uint8Array(0)
  const v = typeof value === 'boolean' ? (value ? 1n : 0n) : value
  if (v === 0n || v === 0) return new Uint8Array(0) // default value, omit
  return concat(writeTag(fieldNumber, 0), encodeVarint(v))
}

function writeBoolField(fieldNumber, value) {
  // Always write bool fields (false is meaningful)
  return concat(writeTag(fieldNumber, 0), encodeVarint(value ? 1n : 0n))
}

function writeLenField(fieldNumber, bytes) {
  if (!bytes || bytes.length === 0) return new Uint8Array(0)
  return concat(writeTag(fieldNumber, 2), encodeVarint(bytes.length), bytes)
}

function writeStringField(fieldNumber, str) {
  if (!str) return new Uint8Array(0)
  return writeLenField(fieldNumber, encodeString(str))
}

function concat(...arrays) {
  const total = arrays.reduce((n, a) => n + a.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const a of arrays) { out.set(a, offset); offset += a.length }
  return out
}

// ── Message encoders ──────────────────────────────────────────────────────────

/**
 * Encodes a single ActivityEvent message.
 * Proto field mapping:
 *   1: child_id (int64), 2: child_name (string), 3: feature (string),
 *   4: event_type (string), 5: online (bool), 6: duration_seconds (int32),
 *   7: metadata (string), 8: occurred_at (string), 9: client_key (string)
 */
export function encodeActivityEvent(e) {
  return concat(
    writeVarintField(1, BigInt(e.childId || 0)),
    writeStringField(2, e.childName),
    writeStringField(3, e.feature),
    writeStringField(4, e.eventType),
    writeBoolField(5,   e.online ?? true),
    writeVarintField(6, e.durationSeconds || 0),
    writeStringField(7, e.metadata),
    writeStringField(8, e.occurredAt),
    writeStringField(9, e.clientKey),
  )
}

/**
 * Encodes a BatchEventsRequest message.
 * Proto field mapping:
 *   1: events (repeated ActivityEvent)
 */
export function encodeBatchEventsRequest(events) {
  const parts = events.map(e => {
    const encoded = encodeActivityEvent(e)
    return writeLenField(1, encoded)  // field 1, wire type 2 (embedded message)
  })
  return concat(...parts)
}

// ── Response decoder ──────────────────────────────────────────────────────────

/**
 * Decodes a BatchEventsResponse message.
 * Proto field mapping:
 *   1: saved (int32)
 */
export function decodeBatchEventsResponse(bytes) {
  let pos = 0
  let saved = 0
  while (pos < bytes.length) {
    // Read tag varint
    let tag = 0, shift = 0
    while (pos < bytes.length) {
      const b = bytes[pos++]
      tag |= (b & 0x7f) << shift
      shift += 7
      if ((b & 0x80) === 0) break
    }
    const fieldNumber = tag >> 3
    const wireType    = tag & 0x07
    if (wireType === 0) {
      // VARINT
      let val = 0, s = 0
      while (pos < bytes.length) {
        const b = bytes[pos++]
        val |= (b & 0x7f) << s
        s += 7
        if ((b & 0x80) === 0) break
      }
      if (fieldNumber === 1) saved = val
    } else if (wireType === 2) {
      // LEN — skip
      let len = 0, s = 0
      while (pos < bytes.length) {
        const b = bytes[pos++]
        len |= (b & 0x7f) << s
        s += 7
        if ((b & 0x80) === 0) break
      }
      pos += len
    }
  }
  return { saved }
}
