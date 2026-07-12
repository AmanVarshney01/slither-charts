import { useEffect, useRef, useState } from "react"

export function useDimensions<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize((s) =>
        s.width === width && s.height === height ? s : { width, height }
      )
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return { ref, size }
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const on = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  return reduced
}

/** DPR-aware canvas with a persistent rAF loop. `draw` gets a ctx already
 * scaled to CSS pixels and the seconds since mount. When frozen, draws once
 * (and on resize) at a fixed pose instead of looping. */
export function useSnakeCanvas(
  width: number,
  height: number,
  frozen: boolean,
  draw: (ctx: CanvasRenderingContext2D, t: number) => void
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawRef = useRef(draw)
  drawRef.current = draw
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || width < 10 || height < 10) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    const frame = (now: number) => {
      if (startRef.current == null) startRef.current = now
      const t = (now - startRef.current) / 1000
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      drawRef.current(ctx, frozen ? 1e9 : t)
      if (!frozen) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [width, height, frozen])

  return canvasRef
}
