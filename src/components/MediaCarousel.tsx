'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MediaItem } from '@/types/review';

interface MediaCarouselProps {
  media: MediaItem[];
}

export default function MediaCarousel({ media }: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (media.length === 0) return null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const currentMedia = media[currentIndex];

  return (
    <div className="space-y-3">
      <Card className="relative aspect-video overflow-hidden bg-gray-100">
        {currentMedia.type === 'image' ? (
          <img 
            src={currentMedia.variants?.medium || currentMedia.originalUrl} 
            alt={currentMedia.fileName}
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            className="w-full h-full object-cover"
            controls
            poster={currentMedia.thumbnailUrl}
          >
            <source src={currentMedia.streamUrl} type="application/x-mpegURL" />
          </video>
        )}
        
        {media.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
              onClick={prevSlide}
            >
              ←
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
              onClick={nextSlide}
            >
              →
            </Button>
          </>
        )}
      </Card>

      {media.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {media.map((item, index) => (
            <div
              key={index}
              className={`flex-shrink-0 w-16 h-16 rounded cursor-pointer border-2 transition-colors ${
                index === currentIndex ? 'border-primary' : 'border-gray-200'
              }`}
              onClick={() => setCurrentIndex(index)}
            >
              {item.type === 'image' ? (
                <img 
                  src={item.thumbnailUrl} 
                  alt={item.fileName}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="w-full h-full bg-gray-900 rounded flex items-center justify-center">
                  <img 
                    src={item.animatedThumbnailUrl || item.thumbnailUrl} 
                    alt={item.fileName}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}