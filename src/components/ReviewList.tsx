'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import MediaCarousel from './MediaCarousel';
import { Review } from '@/types/review';

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">아직 등록된 후기가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <Card key={review.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {review.author.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-lg">{review.author}</div>
                <div className="text-sm text-gray-500">{formatDate(review.createdAt)}</div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {review.content}
            </div>
            
            {review.media.length > 0 && (
              <MediaCarousel media={review.media} />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}