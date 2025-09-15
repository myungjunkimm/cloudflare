import { Review } from '@/types/review';

const STORAGE_KEY = 'reviews';

export const getReviews = (): Review[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading reviews:', error);
    return [];
  }
};

export const saveReview = (review: Review): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const reviews = getReviews();
    reviews.push(review);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch (error) {
    console.error('Error saving review:', error);
  }
};

export const deleteReview = (id: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const reviews = getReviews().filter(review => review.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch (error) {
    console.error('Error deleting review:', error);
  }
};