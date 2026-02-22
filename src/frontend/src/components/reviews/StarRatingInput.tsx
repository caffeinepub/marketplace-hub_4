import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRatingInput({ value, onChange, maxRating = 5, size = 'md' }: StarRatingInputProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const displayRating = hoverRating !== null ? hoverRating : value;

  const handleClick = (rating: number) => {
    onChange(rating);
  };

  const handleKeyDown = (e: React.KeyboardEvent, rating: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(rating);
    }
  };

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((rating) => {
        const isFilled = rating <= displayRating;
        const isHovered = hoverRating !== null && rating <= hoverRating;

        return (
          <button
            key={rating}
            type="button"
            onClick={() => handleClick(rating)}
            onMouseEnter={() => setHoverRating(rating)}
            onMouseLeave={() => setHoverRating(null)}
            onKeyDown={(e) => handleKeyDown(e, rating)}
            className="cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
            role="radio"
            aria-checked={rating === value}
            aria-label={`${rating} star${rating !== 1 ? 's' : ''}`}
          >
            <Star
              className={`${sizeClasses[size]} transition-colors ${
                isFilled
                  ? isHovered
                    ? 'text-secondary fill-secondary stroke-secondary'
                    : 'text-primary fill-primary stroke-primary'
                  : 'text-muted stroke-muted hover:text-secondary hover:stroke-secondary'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
