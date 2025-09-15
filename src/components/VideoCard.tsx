'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MediaItem } from '@/types/review';

interface VideoCardProps {
  author: string;
  video: MediaItem;
  onClick?: () => void;
}

export default function VideoCard({ author, video, onClick }: VideoCardProps) {
  if (video.type !== 'video') return null;

  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-transform hover:scale-105" 
      onClick={onClick}
    >
      <div className="relative aspect-[9/16] bg-black">
        <video
          className="w-full h-full object-cover"
          poster={video.thumbnailUrl}
          preload="metadata"
          muted
          onMouseEnter={(e) => {
            const videoElement = e.target as HTMLVideoElement;
            videoElement.play().catch(console.error);
          }}
          onMouseLeave={(e) => {
            const videoElement = e.target as HTMLVideoElement;
            videoElement.pause();
            videoElement.currentTime = 0;
          }}
        >
          <source src={video.streamUrl} type="application/x-mpegURL" />
        </video>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-white bg-gray-600">
                {author.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-white text-sm font-medium">{author}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}