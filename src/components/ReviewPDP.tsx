'use client';

import React, { useState, useEffect } from 'react';
import VideoCard from './VideoCard';
import ReviewList from './ReviewList';
import { Review, MediaItem } from '@/types/review';
import { getReviews } from '@/lib/storage';

export default function ReviewPDP() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [featuredVideos, setFeaturedVideos] = useState<{author: string, video: MediaItem}[]>([]);

  useEffect(() => {
    const loadReviews = () => {
      const storedReviews = getReviews();
      setReviews(storedReviews);

      // Extract first video from each author
      const authorVideos = new Map<string, MediaItem>();
      
      storedReviews.forEach(review => {
        if (!authorVideos.has(review.author)) {
          const firstVideo = review.media.find(media => media.type === 'video');
          if (firstVideo) {
            authorVideos.set(review.author, firstVideo);
          }
        }
      });

      const videos = Array.from(authorVideos.entries()).map(([author, video]) => ({
        author,
        video
      }));

      setFeaturedVideos(videos);
    };

    loadReviews();
    
    // Listen for storage changes to update in real time
    const handleStorageChange = () => {
      loadReviews();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab updates
    window.addEventListener('reviewsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('reviewsUpdated', handleStorageChange);
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Video Cards Section */}
      {featuredVideos.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">동영상 후기</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {featuredVideos.map(({ author, video }, index) => (
              <VideoCard
                key={`${author}-${index}`}
                author={author}
                video={video}
                onClick={() => {
                  // Scroll to the author's review
                  const reviewElement = document.getElementById(`review-${author}`);
                  if (reviewElement) {
                    reviewElement.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start' 
                    });
                  }
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">모든 후기</h2>
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} id={`review-${review.author}`}>
              <ReviewList reviews={[review]} />
            </div>
          ))}
        </div>
        
        {reviews.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">아직 등록된 후기가 없습니다.</div>
            <div className="text-gray-400">첫 번째 후기를 작성해보세요!</div>
          </div>
        )}
      </section>
    </div>
  );
}