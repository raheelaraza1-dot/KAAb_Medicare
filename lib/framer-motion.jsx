'use client'

import { createElement } from 'react'

function motionTag(tag) {
  function MotionComponent({
    children,
    initial,
    animate,
    exit,
    transition,
    whileHover,
    whileTap,
    layoutId,
    ...props
  }) {
    return createElement(tag, props, children)
  }
  MotionComponent.displayName = `motion.${String(tag)}`
  return MotionComponent
}

export const motion = new Proxy(
  {},
  {
    get(target, tag) {
      if (!target[tag]) target[tag] = motionTag(tag)
      return target[tag]
    },
  },
)

export function AnimatePresence({ children }) {
  return children
}
