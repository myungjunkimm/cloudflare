'use client';

import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { Volume2, VolumeX } from 'lucide-react';

interface VideoPlayerProps {
  cloudflareId: string;
  className?: string;
  style?: React.CSSProperties;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ cloudflareId, className, style }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any>(null);
  const [isMuted, setIsMuted] = React.useState(true);

  useEffect(() => {
    if (!videoRef.current) return;

    // video.js 플레이어 초기화
    playerRef.current = videojs(videoRef.current, {
      autoplay: true,
      controls: false, // 기본 컨트롤 숨김
      loop: true,
      muted: true,
      fluid: false,
      sources: [
        {
          src: `https://videodelivery.net/${cloudflareId}/manifest/video.m3u8`,
          type: 'application/x-mpegURL'
        }
      ]
    });

    // 플레이어가 준비되면
    playerRef.current.ready(() => {
      console.log('Video.js player is ready');
    });

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [cloudflareId]);

  const toggleMute = () => {
    if (playerRef.current) {
      const newMutedState = !playerRef.current.muted();
      playerRef.current.muted(newMutedState);
      setIsMuted(newMutedState);
    }
  };

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className={`video-js vjs-big-play-centered vjs-fluid ${className || ''}`}
        style={style}
        playsInline
      />
      
      {/* 커스텀 음소거 버튼 */}
      <button
        onClick={toggleMute}
        className="absolute bottom-4 right-4 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all"
        title={isMuted ? "소리 켜기" : "소리 끄기"}
      >
        {isMuted ? (
          <VolumeX size={16} className="text-white" />
        ) : (
          <Volume2 size={16} className="text-white" />
        )}
      </button>
    </div>
  );
};

export default VideoPlayer;