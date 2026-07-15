/**
 * Minimal gRPC-Web client for ActivityEventService.
 *
 * gRPC-Web wire format (unary):
 *   Request body:  [0x00][uint32 big-endian message length][protobuf bytes]
 *   Response body: one or more frames, each:
 *                  [flag byte][uint32 big-endian length][bytes]
 *                  flag 0x00 = data frame (protobuf message)
 *                  flag 0x80 = trailer frame (gRPC status headers)
 */

import { encodeBatchEventsRequest, decodeBatchEventsResponse } from './activity_events_pb.js'

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/api$/, '')
const SERVICE  = 'glumbi.ActivityEventService'

function getToken() {
  return localStorage.getItem('glm_token') || ''
}

// Wrap protobuf bytes in a gRPC-Web data frame
function grpcWebFrame(protoBytes) {
  const frame = new Uint8Array(5 + protoBytes.length)
  frame[0] = 0x00                               // data frame flag
  new DataView(frame.buffer).setUint32(1, protoBytes.length, false) // big-endian length
  frame.set(protoBytes, 5)
  return frame
}

// Extract the first data frame from a gRPC-Web response body
function extractDataFrame(buffer) {
  const bytes = new Uint8Array(buffer)
  let pos = 0
  while (pos < bytes.length) {
    const flag   = bytes[pos]
    const length = new DataView(buffer, pos + 1, 4).getUint32(0, false)
    pos += 5
    if (flag === 0x00) {
      // Data frame — this is our protobuf response
      return bytes.slice(pos, pos + length)
    }
    // Skip trailer frames (0x80) and anything else
    pos += length
  }
  throw new Error('gRPC-Web: no data frame in response')
}

export async function grpcBatchEvents(events) {
  if (!events || events.length === 0) return { saved: 0 }

  const protoBytes = encodeBatchEventsRequest(events)
  const body       = grpcWebFrame(protoBytes)

  const response = await fetch(`${BASE_URL}/${SERVICE}/BatchEvents`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/grpc-web+proto',
      'X-Grpc-Web':    '1',
      'Authorization': `Bearer ${getToken()}`,
    },
    body,
  })

  if (!response.ok) {
    throw new Error(`gRPC-Web request failed: ${response.status}`)
  }

  const buffer    = await response.arrayBuffer()
  const dataFrame = extractDataFrame(buffer)
  return decodeBatchEventsResponse(dataFrame)
}
