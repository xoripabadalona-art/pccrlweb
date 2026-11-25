'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface LoopVideoProps {
  poster: string;
  mp4: string;
  webm?: string;
  /** What the clip shows, for people who cannot see it */
  label: string;
  playLabel: string;
  pauseLabel: string;
  className?: string;
  /** Tailwind object-position utility for how the frame is cropped */
  fit?: string;
  /** Size of the play/pause button: small clips get a smaller one */
  control?: 'md' | 'sm';
}

/**
 * Short silent clip that behaves like a moving photo.
 *
 * Designed for rock-solid playback on iOS Safari and Android Chrome:
 * - Imperatively enforces `muted`, `defaultMuted`, and `playsInline` before playback.
 * - Keeps an explicit poster layer visible until video frames are actively rendering,
 *   so cards never flash black or appear broken while buffering or in iOS Low Power Mode.
 */
export function LoopVideo({
  poster,
  mp4,
  webm,
  label,
  playLabel,
  pauseLabel,
  className = '',
  fit = 'object-center',
  control = 'md',
}: LoopVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inViewRef = useRef(false);
  const userPausedRef = useRef(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [hasFrame, setHasFrame] = useState(false);

  const attemptPlay = (video: HTMLVideoElement) => {
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setPlaying(true);
          setHasFrame(true);
        })
        .catch(() => {
          setPlaying(false);
        });
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;

    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    const calm =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      Boolean(connection?.saveData);
    if (calm) userPausedRef.current = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = Boolean(entry?.isIntersecting);
        inViewRef.current = isIntersecting;
        if (isIntersecting) {
          setShouldLoad(true);
          if (!userPausedRef.current && video.readyState >= 2) {
            attemptPlay(video);
          }
        } else {
          video.pause();
        }
      },
      { threshold: 0.15, rootMargin: '120px 0px' }
    );
    observer.observe(video);

    const onPlay = () => setPlaying(true);
    const onPlaying = () => {
      setPlaying(true);
      setHasFrame(true);
    };
    const onTimeUpdate = () => {
      if (video.currentTime > 0.02) {
        setHasFrame(true);
      }
    };
    const onPause = () => setPlaying(false);
    const onCanPlay = () => {
      if (inViewRef.current && !userPausedRef.current && video.paused) {
        attemptPlay(video);
      }
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('pause', onPause);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('loadeddata', onCanPlay);

    return () => {
      observer.disconnect();
      video.removeEventListener('play', onPlay);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('loadeddata', onCanPlay);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!shouldLoad || !video) return;
    if (video.readyState === 0) {
      video.load();
    }
    if (inViewRef.current && !userPausedRef.current) {
      attemptPlay(video);
    }
  }, [shouldLoad]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPausedRef.current = false;
      if (!shouldLoad) {
        setShouldLoad(true);
      } else {
        attemptPlay(video);
      }
    } else {
      userPausedRef.current = true;
      video.pause();
    }
  };

  return (
    <div
      onClick={toggle}
      className={`relative cursor-pointer overflow-hidden bg-[#14110F] ${className}`.trim()}
    >
      {/* Persistent poster image that stays visible until video frames actively render */}
      <img
        src={poster}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className={`pointer-events-none absolute inset-0 z-10 h-full w-full object-cover transition-opacity duration-300 ${fit} ${
          hasFrame && playing ? 'opacity-0' : 'opacity-100'
        }`}
      />

      <video
        ref={videoRef}
        muted
        loop
        playsInline
        controlsList="nodownload"
        disablePictureInPicture
        preload="metadata"
        poster={poster}
        aria-label={label}
        className={`h-full w-full object-cover ${fit}`}
      >
        {shouldLoad && (
          <>
            {/* Put MP4 first for iOS Safari hardware decoder compatibility */}
            <source src={mp4} type="video/mp4" />
            {webm && <source src={webm} type="video/webm" />}
          </>
        )}
      </video>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        aria-label={playing ? pauseLabel : playLabel}
        aria-pressed={playing}
        data-testid="loop-video-toggle"
        className={`absolute z-20 flex cursor-pointer items-center justify-center rounded-full border border-[#F9F4EC]/20 bg-[#14110F]/75 text-[#F9F4EC] backdrop-blur-sm transition-colors hover:bg-[#14110F] ${
          control === 'sm' ? 'right-2 bottom-2 h-9 w-9' : 'right-2.5 bottom-2.5 h-11 w-11'
        }`}
      >
        {playing ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="5" y="4" width="5" height="16" rx="1.2" />
            <rect x="14" y="4" width="5" height="16" rx="1.2" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" />
          </svg>
        )}
      </button>
    </div>
  );
}
