import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export default function StarRating({ rating, maxRating = 5, size = 'md', showValue = false }: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const stars = Array.from({ length: maxRating }, (_, i) => {
    const starIndex = i + 1;
    const fillPercentage = Math.min(Math.max(rating - i, 0), 1);
    
    return (
      <div key={starIndex} className="relative inline-block">
        <Star className={`${sizeClasses[size]} text-muted stroke-muted`} />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${fillPercentage * 100}%` }}
        >
          <Star className={`${sizeClasses[size]} text-primary fill-primary stroke-primary`} />
        </div>
      </div>
    );
  });

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center" role="img" aria-label={`Rating: ${rating} out of ${maxRating} stars`}>
        {stars}
      </div>
      {showValue && (
        <span className={`${textSizeClasses[size]} font-medium text-foreground ml-1`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
