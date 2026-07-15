package com.glumbi.grpc;

import com.glumbi.service.ChildActivityEventService.EventDto;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Minimal hand-written protobuf decoder for BatchEventsRequest.
 *
 * Wire types:
 *   0 = VARINT  (int32, int64, bool)
 *   2 = LEN     (string, embedded message)
 *
 * Mirrors the encoder in activity_events_pb.js on the frontend.
 */
public class ProtoDecoder {

    // ── gRPC-Web frame parsing ────────────────────────────────────────────────

    /**
     * Extracts the protobuf bytes from a gRPC-Web data frame.
     * Frame format: [0x00 flag][4-byte big-endian length][protobuf bytes]
     */
    public static byte[] extractGrpcWebDataFrame(byte[] body) {
        if (body.length < 5) throw new IllegalArgumentException("gRPC-Web frame too short");
        byte flag = body[0];
        if (flag != 0x00) throw new IllegalArgumentException("Expected data frame (0x00), got: " + flag);
        int length = ByteBuffer.wrap(body, 1, 4).getInt();
        if (body.length < 5 + length) throw new IllegalArgumentException("gRPC-Web frame truncated");
        byte[] proto = new byte[length];
        System.arraycopy(body, 5, proto, 0, length);
        return proto;
    }

    /**
     * Encodes a BatchEventsResponse into a gRPC-Web data frame.
     * Response proto: field 1 (saved, int32)
     */
    public static byte[] encodeGrpcWebResponse(int saved) {
        byte[] proto = encodeVarintField(1, saved);
        byte[] frame = new byte[5 + proto.length];
        frame[0] = 0x00; // data frame
        ByteBuffer.wrap(frame, 1, 4).putInt(proto.length);
        System.arraycopy(proto, 0, frame, 5, proto.length);
        return frame;
    }

    // ── BatchEventsRequest decoder ────────────────────────────────────────────

    public static List<EventDto> decodeBatchEventsRequest(byte[] bytes) {
        List<EventDto> events = new ArrayList<>();
        int[] pos = {0};
        while (pos[0] < bytes.length) {
            int tag       = (int) readVarint(bytes, pos);
            int fieldNum  = tag >>> 3;
            int wireType  = tag & 0x07;
            if (fieldNum == 1 && wireType == 2) {
                // repeated ActivityEvent
                int len = (int) readVarint(bytes, pos);
                byte[] eventBytes = new byte[len];
                System.arraycopy(bytes, pos[0], eventBytes, 0, len);
                pos[0] += len;
                events.add(decodeActivityEvent(eventBytes));
            } else {
                skip(bytes, pos, wireType);
            }
        }
        return events;
    }

    private static EventDto decodeActivityEvent(byte[] bytes) {
        int[] pos = {0};
        long   childId         = 0;
        String childName       = "";
        String feature         = "";
        String eventType       = "";
        boolean online         = true;
        int    durationSeconds = 0;
        String metadata        = null;
        String occurredAt      = null;
        String clientKey       = null;

        while (pos[0] < bytes.length) {
            int tag      = (int) readVarint(bytes, pos);
            int fieldNum = tag >>> 3;
            int wireType = tag & 0x07;
            switch (fieldNum) {
                case 1 -> childId         = readVarint(bytes, pos);
                case 2 -> childName       = readString(bytes, pos);
                case 3 -> feature         = readString(bytes, pos);
                case 4 -> eventType       = readString(bytes, pos);
                case 5 -> online          = readVarint(bytes, pos) != 0;
                case 6 -> durationSeconds = (int) readVarint(bytes, pos);
                case 7 -> metadata        = readString(bytes, pos);
                case 8 -> occurredAt      = readString(bytes, pos);
                case 9 -> clientKey       = readString(bytes, pos);
                default -> skip(bytes, pos, wireType);
            }
        }
        return new EventDto(
            childId == 0 ? null : childId, childName, feature, eventType, online,
            durationSeconds > 0 ? durationSeconds : null,
            metadata != null && !metadata.isEmpty() ? metadata : null,
            occurredAt != null && !occurredAt.isEmpty() ? occurredAt : null,
            clientKey  != null && !clientKey.isEmpty()  ? clientKey  : null
        );
    }

    // ── Primitive readers ─────────────────────────────────────────────────────

    private static long readVarint(byte[] bytes, int[] pos) {
        long value = 0;
        int shift  = 0;
        while (pos[0] < bytes.length) {
            byte b = bytes[pos[0]++];
            value |= (long)(b & 0x7F) << shift;
            shift += 7;
            if ((b & 0x80) == 0) break;
        }
        return value;
    }

    private static String readString(byte[] bytes, int[] pos) {
        int len = (int) readVarint(bytes, pos);
        String s = new String(bytes, pos[0], len, StandardCharsets.UTF_8);
        pos[0] += len;
        return s;
    }

    private static void skip(byte[] bytes, int[] pos, int wireType) {
        switch (wireType) {
            case 0 -> readVarint(bytes, pos);
            case 2 -> { int len = (int) readVarint(bytes, pos); pos[0] += len; }
            default -> throw new IllegalArgumentException("Unsupported wire type: " + wireType);
        }
    }

    // ── Varint encoder (for response) ─────────────────────────────────────────

    private static byte[] encodeVarint(long value) {
        byte[] buf = new byte[10];
        int i = 0;
        while (true) {
            if ((value & ~0x7FL) == 0) { buf[i++] = (byte) value; break; }
            buf[i++] = (byte)((value & 0x7F) | 0x80);
            value >>>= 7;
        }
        byte[] out = new byte[i];
        System.arraycopy(buf, 0, out, 0, i);
        return out;
    }

    private static byte[] encodeVarintField(int fieldNumber, long value) {
        if (value == 0) return new byte[0];
        byte[] tag   = encodeVarint((long)(fieldNumber << 3)); // wire type 0
        byte[] val   = encodeVarint(value);
        byte[] out   = new byte[tag.length + val.length];
        System.arraycopy(tag, 0, out, 0, tag.length);
        System.arraycopy(val, 0, out, tag.length, val.length);
        return out;
    }
}
