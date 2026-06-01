"use client"

import { useRef } from "react"
import { cn } from "@/app/_lib/utils"

interface DragScrollContainerProps {
  className?: string
  children: React.ReactNode
}

const DragScrollContainer = ({ className, children }: DragScrollContainerProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const state = useRef({ isDown: false, startX: 0, scrollLeft: 0, didDrag: false })

  return (
    <div
      ref={ref}
      className={cn(
        "flex overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none",
        className,
      )}
      onMouseDown={(e) => {
        const s = state.current
        s.isDown = true
        s.didDrag = false
        s.startX = e.pageX - (ref.current?.offsetLeft ?? 0)
        s.scrollLeft = ref.current?.scrollLeft ?? 0
      }}
      onMouseLeave={() => { state.current.isDown = false }}
      onMouseUp={() => { state.current.isDown = false }}
      onMouseMove={(e) => {
        if (!state.current.isDown || !ref.current) return
        e.preventDefault()
        const x = e.pageX - ref.current.offsetLeft
        const walk = x - state.current.startX
        if (Math.abs(walk) > 4) state.current.didDrag = true
        ref.current.scrollLeft = state.current.scrollLeft - walk
      }}
      onClickCapture={(e) => {
        if (state.current.didDrag) e.stopPropagation()
      }}
    >
      {children}
    </div>
  )
}

export default DragScrollContainer
