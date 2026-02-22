import { Link } from '@tanstack/react-router';
import { useGetUserProfile, useProductAverageRating } from '../../hooks/useQueries';
import type { Product } from '../../backend';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import StarRating from '../reviews/StarRating';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { data: sellerProfile } = useGetUserProfile(product.seller);
  const { data: averageRating = 0 } = useProductAverageRating(product.id);

  const imageUrl = product.image
    ? product.image.getDirectURL()
    : '/assets/generated/product-placeholder.dim_400x400.png';

  return (
    <Link to="/products/$productId" params={{ productId: product.id }}>
      <Card className="overflow-hidden hover:shadow-warm transition-all duration-300 h-full cursor-pointer group">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
          </div>
          {averageRating > 0 && (
            <div className="mt-3">
              <StarRating rating={averageRating} size="sm" showValue />
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">
            ${(Number(product.price) / 100).toFixed(2)}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{sellerProfile?.name || 'Seller'}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
