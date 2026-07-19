export const SHAPES = [
  { key: 'line',          label: 'Line'          },
  { key: 'rect',          label: 'Rect'          },
  { key: 'circle',        label: 'Circle'        },
  { key: 'triangle',      label: 'Triangle'      },
  { key: 'diamond',       label: 'Diamond'       },
  { key: 'star',          label: 'Star'          },
  { key: 'heart',         label: 'Heart'         },
  { key: 'pentagon',      label: 'Pentagon'      },
  { key: 'hexagon',       label: 'Hexagon'       },
  { key: 'octagon',       label: 'Octagon'       },
  { key: 'arrow',         label: 'Arrow'         },
  { key: 'cross',         label: 'Cross'         },
  { key: 'parallelogram', label: 'Parallelgram'  },
]

export function ShapeIcon({ shape, size = 28, color = 'currentColor', strokeWidth = 2 }) {
  const p = Math.round(size * 0.15)
  const cx = size / 2, cy = size / 2
  const x0 = p, y0 = p, x1 = size - p, y1 = size - p
  const w = x1 - x0, h = y1 - y0
  const a = { stroke: color, strokeWidth, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }

  let el = null
  switch (shape) {
    case 'line':
      el = <line x1={x0} y1={y1} x2={x1} y2={y0} {...a} />
      break
    case 'rect':
      el = <rect x={x0} y={y0} width={w} height={h} {...a} />
      break
    case 'circle':
      el = <ellipse cx={cx} cy={cy} rx={w / 2} ry={h / 2} {...a} />
      break
    case 'triangle':
      el = <polygon points={`${cx},${y0} ${x1},${y1} ${x0},${y1}`} {...a} />
      break
    case 'diamond':
      el = <polygon points={`${cx},${y0} ${x1},${cy} ${cx},${y1} ${x0},${cy}`} {...a} />
      break
    case 'star': {
      const R = Math.min(w, h) / 2, r = R * 0.38
      const pts = Array.from({ length: 10 }, (_, i) => {
        const rad = i % 2 === 0 ? R : r
        const ang = (i * Math.PI / 5) - Math.PI / 2
        return `${+(cx + rad * Math.cos(ang)).toFixed(2)},${+(cy + rad * Math.sin(ang)).toFixed(2)}`
      }).join(' ')
      el = <polygon points={pts} {...a} />
      break
    }
    case 'heart': {
      const d = `M ${cx},${y0 + h * 0.3} C ${cx},${y0 + h * 0.05} ${x0},${y0 + h * 0.05} ${x0},${y0 + h * 0.35} C ${x0},${y0 + h * 0.68} ${cx},${y0 + h * 0.82} ${cx},${y1} C ${cx},${y0 + h * 0.82} ${x1},${y0 + h * 0.68} ${x1},${y0 + h * 0.35} C ${x1},${y0 + h * 0.05} ${cx},${y0 + h * 0.05} ${cx},${y0 + h * 0.3} Z`
      el = <path d={d} {...a} />
      break
    }
    case 'pentagon': {
      const R = Math.min(w, h) / 2
      const pts = Array.from({ length: 5 }, (_, i) => {
        const ang = (i * 2 * Math.PI / 5) - Math.PI / 2
        return `${+(cx + R * Math.cos(ang)).toFixed(2)},${+(cy + R * Math.sin(ang)).toFixed(2)}`
      }).join(' ')
      el = <polygon points={pts} {...a} />
      break
    }
    case 'hexagon': {
      const R = Math.min(w, h) / 2
      const pts = Array.from({ length: 6 }, (_, i) => {
        const ang = (i * Math.PI / 3) - Math.PI / 6
        return `${+(cx + R * Math.cos(ang)).toFixed(2)},${+(cy + R * Math.sin(ang)).toFixed(2)}`
      }).join(' ')
      el = <polygon points={pts} {...a} />
      break
    }
    case 'octagon': {
      const R = Math.min(w, h) / 2
      const pts = Array.from({ length: 8 }, (_, i) => {
        const ang = (i * Math.PI / 4) - Math.PI / 8
        return `${+(cx + R * Math.cos(ang)).toFixed(2)},${+(cy + R * Math.sin(ang)).toFixed(2)}`
      }).join(' ')
      el = <polygon points={pts} {...a} />
      break
    }
    case 'arrow': {
      const sh = h * 0.38, hd = w * 0.32
      const pts = `${x0},${cy - sh/2} ${x1-hd},${cy - sh/2} ${x1-hd},${y0} ${x1},${cy} ${x1-hd},${y1} ${x1-hd},${cy + sh/2} ${x0},${cy + sh/2}`
      el = <polygon points={pts} {...a} />
      break
    }
    case 'cross': {
      const aw = w * 0.33, ah = h * 0.33
      const d = `M ${cx-aw/2},${y0} L ${cx+aw/2},${y0} L ${cx+aw/2},${cy-ah/2} L ${x1},${cy-ah/2} L ${x1},${cy+ah/2} L ${cx+aw/2},${cy+ah/2} L ${cx+aw/2},${y1} L ${cx-aw/2},${y1} L ${cx-aw/2},${cy+ah/2} L ${x0},${cy+ah/2} L ${x0},${cy-ah/2} L ${cx-aw/2},${cy-ah/2} Z`
      el = <path d={d} {...a} />
      break
    }
    case 'parallelogram': {
      const sk = w * 0.2
      el = <polygon points={`${x0+sk},${y0} ${x1},${y0} ${x1-sk},${y1} ${x0},${y1}`} {...a} />
      break
    }
    default: el = null
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ display: 'block', flexShrink: 0 }}>
      {el}
    </svg>
  )
}

export function drawShape(ctx, shape, x1, y1, x2, y2, color, lineWidth, fill) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle   = color
  ctx.lineWidth   = lineWidth
  ctx.lineCap     = 'round'
  ctx.lineJoin    = 'round'

  const cx   = (x1 + x2) / 2, cy   = (y1 + y2) / 2
  const w    = Math.abs(x2 - x1), h  = Math.abs(y2 - y1)
  const minX = Math.min(x1, x2),  minY = Math.min(y1, y2)
  const maxX = Math.max(x1, x2),  maxY = Math.max(y1, y2)

  ctx.beginPath()

  switch (shape) {
    case 'line':
      ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
      ctx.stroke(); ctx.restore(); return

    case 'rect':
      ctx.rect(minX, minY, w, h)
      break

    case 'circle':
      ctx.ellipse(cx, cy, Math.max(w / 2, 1), Math.max(h / 2, 1), 0, 0, Math.PI * 2)
      break

    case 'triangle':
      ctx.moveTo(cx, minY)
      ctx.lineTo(maxX, maxY)
      ctx.lineTo(minX, maxY)
      ctx.closePath()
      break

    case 'diamond':
      ctx.moveTo(cx, minY)
      ctx.lineTo(maxX, cy)
      ctx.lineTo(cx, maxY)
      ctx.lineTo(minX, cy)
      ctx.closePath()
      break

    case 'star': {
      const R = Math.min(w, h) / 2
      const r = R * 0.38
      for (let i = 0; i < 10; i++) {
        const rad = i % 2 === 0 ? R : r
        const a   = (i * Math.PI / 5) - Math.PI / 2
        const px  = cx + rad * Math.cos(a)
        const py  = cy + rad * Math.sin(a)
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
      }
      ctx.closePath()
      break
    }

    case 'heart':
      ctx.moveTo(cx, minY + h * 0.3)
      ctx.bezierCurveTo(cx, minY + h * 0.05, minX, minY + h * 0.05, minX, minY + h * 0.35)
      ctx.bezierCurveTo(minX, minY + h * 0.68, cx, minY + h * 0.82, cx, maxY)
      ctx.bezierCurveTo(cx, minY + h * 0.82, maxX, minY + h * 0.68, maxX, minY + h * 0.35)
      ctx.bezierCurveTo(maxX, minY + h * 0.05, cx, minY + h * 0.05, cx, minY + h * 0.3)
      ctx.closePath()
      break

    case 'pentagon': {
      const R = Math.min(w, h) / 2
      for (let i = 0; i < 5; i++) {
        const a = (i * 2 * Math.PI / 5) - Math.PI / 2
        const px = cx + R * Math.cos(a), py = cy + R * Math.sin(a)
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
      }
      ctx.closePath()
      break
    }

    case 'hexagon': {
      const R = Math.min(w, h) / 2
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI / 3) - Math.PI / 6
        const px = cx + R * Math.cos(a), py = cy + R * Math.sin(a)
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
      }
      ctx.closePath()
      break
    }

    case 'octagon': {
      const R = Math.min(w, h) / 2
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI / 4) - Math.PI / 8
        const px = cx + R * Math.cos(a), py = cy + R * Math.sin(a)
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
      }
      ctx.closePath()
      break
    }

    case 'arrow': {
      const sh = h * 0.38, hd = w * 0.32
      ctx.moveTo(minX, cy - sh / 2)
      ctx.lineTo(maxX - hd, cy - sh / 2)
      ctx.lineTo(maxX - hd, minY)
      ctx.lineTo(maxX, cy)
      ctx.lineTo(maxX - hd, maxY)
      ctx.lineTo(maxX - hd, cy + sh / 2)
      ctx.lineTo(minX, cy + sh / 2)
      ctx.closePath()
      break
    }

    case 'cross': {
      const aw = w * 0.33, ah = h * 0.33
      ctx.moveTo(cx - aw / 2, minY)
      ctx.lineTo(cx + aw / 2, minY)
      ctx.lineTo(cx + aw / 2, cy - ah / 2)
      ctx.lineTo(maxX, cy - ah / 2)
      ctx.lineTo(maxX, cy + ah / 2)
      ctx.lineTo(cx + aw / 2, cy + ah / 2)
      ctx.lineTo(cx + aw / 2, maxY)
      ctx.lineTo(cx - aw / 2, maxY)
      ctx.lineTo(cx - aw / 2, cy + ah / 2)
      ctx.lineTo(minX, cy + ah / 2)
      ctx.lineTo(minX, cy - ah / 2)
      ctx.lineTo(cx - aw / 2, cy - ah / 2)
      ctx.closePath()
      break
    }

    case 'parallelogram': {
      const skew = w * 0.2
      ctx.moveTo(minX + skew, minY)
      ctx.lineTo(maxX, minY)
      ctx.lineTo(maxX - skew, maxY)
      ctx.lineTo(minX, maxY)
      ctx.closePath()
      break
    }

    default: break
  }

  if (fill) ctx.fill()
  ctx.stroke()
  ctx.restore()
}
