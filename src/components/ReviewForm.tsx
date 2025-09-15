'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Review } from '@/types/review';
import { saveReview } from '@/lib/storage';

interface ReviewFormProps {
  onSubmit?: (review: Review) => void;
}

export default function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!author.trim()) {
      alert('작성자를 입력해주세요.');
      return;
    }
    
    if (!content.trim()) {
      alert('후기 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const review: Review = {
        id: `review_${Date.now()}`,
        author: author.trim(),
        content: content.trim(),
        media: [],
        createdAt: new Date().toISOString()
      };

      saveReview(review);
      
      if (onSubmit) {
        onSubmit(review);
      }

      // Reset form
      setAuthor('');
      setContent('');
      
      // Trigger custom event for same-tab updates
      window.dispatchEvent(new Event('reviewsUpdated'));
      
      alert('후기가 성공적으로 등록되었습니다!');
      
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('후기 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">후기 작성</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="author" className="text-sm font-medium">
                작성자 *
              </label>
              <Input
                id="author"
                type="text"
                placeholder="작성자명을 입력하세요"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                후기 내용 *
              </label>
              <Textarea
                id="content"
                placeholder="후기 내용을 입력하세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                disabled={isSubmitting}
                rows={6}
              />
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting || !author.trim() || !content.trim()}
                className="px-8"
              >
                {isSubmitting ? '등록 중...' : '후기 등록'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}