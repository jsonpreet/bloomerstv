import React, { useState, useEffect, useRef } from 'react'
import { THUMBNAIL_FALLBACK } from '../../utils/config'
import { motion, HTMLMotionProps } from 'framer-motion'
import clsx from 'clsx'

interface LoadingImageProps extends HTMLMotionProps<'img'> {
  loaderClassName?: string
  defaultImage?: string
  loadingTimeout?: number
}

const LoadingImage: React.FC<LoadingImageProps> = ({
  loaderClassName = '',
  defaultImage = THUMBNAIL_FALLBACK,
  loadingTimeout = 5000, // 5 seconds default timeout
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const image = imageRef.current

    const handleLoad = () => {
      setIsLoaded(true)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }

    const handleError = (e: Event) => {
      console.error('Image failed to load', e)
      if (image) {
        image.src = defaultImage
      }
    }

    if (image) {
      image.addEventListener('load', handleLoad)
      image.addEventListener('error', handleError)

      // Set a timeout in case the load event doesn't fire
      timeoutRef.current = setTimeout(() => {
        setIsLoaded(true)
      }, loadingTimeout)
    }

    return () => {
      if (image) {
        image.removeEventListener('load', handleLoad)
        image.removeEventListener('error', handleError)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [props.src, defaultImage, loadingTimeout])

  return (
    <div className={clsx('relative overflow-hidden', props.className)}>
      {!isLoaded && (
        <div
          className={clsx(
            'absolute inset-0 bg-p-hover animate-pulse',
            loaderClassName
          )}
        />
      )}
      <motion.img
        {...props}
        ref={imageRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className={clsx(props.className, 'relative z-10')}
      />
    </div>
  )
}

export default LoadingImage
