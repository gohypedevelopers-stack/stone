'use client';;
import { cn } from '../../lib/utils';
import { useMotionValue, animate, motion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import useMeasure from 'react-use-measure';

export function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  durationOnHover,
  direction = 'horizontal',
  reverse = false,
  className
}) {
  const [currentDuration, setCurrentDuration] = useState(duration);
  const [ref, { width, height }] = useMeasure();
  const translation = useMotionValue(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [key, setKey] = useState(0);

  // Drag state
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartTranslation = useRef(0);
  const controlsRef = useRef(null);
  const containerRef = useRef(null);
  const dragDistance = useRef(0);

  const size = direction === 'horizontal' ? width : height;
  const contentSize = size + gap;

  // Wrap position to stay within the infinite loop range
  const wrapPosition = useCallback((pos) => {
    if (contentSize <= 0) return pos;
    const half = contentSize / 2;
    // Normalize to range [-contentSize/2, 0]
    let wrapped = pos % half;
    if (wrapped > 0) wrapped -= half;
    return wrapped;
  }, [contentSize]);

  useEffect(() => {
    // Don't start animation while dragging
    if (isDragging.current) return;

    let controls;
    const from = reverse ? -contentSize / 2 : 0;
    const to = reverse ? 0 : -contentSize / 2;

    if (isTransitioning) {
      controls = animate(translation, [translation.get(), to], {
        ease: 'linear',
        duration:
          currentDuration * Math.abs((translation.get() - to) / contentSize),
        onComplete: () => {
          setIsTransitioning(false);
          setKey((prevKey) => prevKey + 1);
        },
      });
    } else {
      controls = animate(translation, [from, to], {
        ease: 'linear',
        duration: currentDuration,
        repeat: Infinity,
        repeatType: 'loop',
        repeatDelay: 0,
        onRepeat: () => {
          translation.set(from);
        },
      });
    }

    controlsRef.current = controls;
    return controls?.stop;
  }, [
    key,
    translation,
    currentDuration,
    width,
    height,
    gap,
    isTransitioning,
    direction,
    reverse,
  ]);

  // --- Drag Handlers ---
  const handlePointerDown = (e) => {
    if (contentSize <= 0) return;
    isDragging.current = true;
    dragDistance.current = 0;
    dragStartX.current = direction === 'horizontal' ? e.clientX : e.clientY;
    dragStartTranslation.current = translation.get();

    // Stop the auto-animation
    if (controlsRef.current) {
      controlsRef.current.stop();
    }

    // Capture pointer for smooth tracking even outside the element
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const current = direction === 'horizontal' ? e.clientX : e.clientY;
    const delta = current - dragStartX.current;
    dragDistance.current = Math.abs(delta);
    let newPos = dragStartTranslation.current + delta;
    // Wrap for seamless infinite feel
    newPos = wrapPosition(newPos);
    translation.set(newPos);
  };

  const handlePointerUp = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (containerRef.current) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }

    // Resume auto-animation from current position
    setIsTransitioning(true);
    setKey((prev) => prev + 1);
  };

  // Block clicks on children if user was dragging
  const handleClickCapture = (e) => {
    if (dragDistance.current > 8) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const hoverProps = durationOnHover
    ? {
      onHoverStart: () => {
        if (!isDragging.current) {
          setIsTransitioning(true);
          setCurrentDuration(durationOnHover);
        }
      },
      onHoverEnd: () => {
        if (!isDragging.current) {
          setIsTransitioning(true);
          setCurrentDuration(duration);
        }
      },
    }
    : {};

  return (
    <div
      ref={containerRef}
      className={cn('overflow-hidden touch-pan-y', className)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClickCapture={handleClickCapture}
      style={{ cursor: isDragging.current ? 'grabbing' : 'grab', userSelect: 'none' }}
    >
      <motion.div
        className='flex w-max will-change-transform optimize-gpu'
        style={{
          ...(direction === 'horizontal'
            ? { x: translation }
            : { y: translation }),
          gap: `${gap}px`,
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
          pointerEvents: 'none',
        }}
        ref={ref}
        {...hoverProps}>
        {children}
        {children}
      </motion.div>
    </div>
  );
}
