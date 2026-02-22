import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetAllProducts, useGetUserProfile, useAddToCart, useProductReviews, useGetBuyerOrders } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, User, ArrowLeft, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import StarRating from '../components/reviews/StarRating';
import ReviewForm from '../components/products/ReviewForm';

export default function ProductDetail() {
  const { productId } = useParams({ from: '/products/$productId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: products, isLoading } = useGetAllProducts();
  const addToCart = useAddToCart();
  const { data: reviews = [], isLoading: reviewsLoading } = useProductReviews(productId);
  const { data: buyerOrders = [] } = useGetBuyerOrders();

  const product = products?.find((p) => p.id === productId);
  const { data: sellerProfile } = useGetUserProfile(product?.seller || null);

  const isAuthenticated = !!identity;
  const isBuyer = userProfile?.role === 'buyer';

  // Check if the buyer has purchased this product
  const hasPurchased = buyerOrders.some((order) =>
    order.items.some((item) => item.productId === productId)
  );

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (!isBuyer) {
      toast.error('Only buyers can add items to cart');
      return;
    }

    if (!product) return;

    try {
      await addToCart.mutateAsync({ productId: product.id, quantity: BigInt(1) });
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add to cart');
    }
  };

  if (isLoading) {
    return (
      <div className="container-custom py-8">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Button onClick={() => navigate({ to: '/products' })}>
          Back to Products
        </Button>
      </div>
    );
  }

  const imageUrl = product.image
    ? product.image.getDirectURL()
    : '/assets/generated/product-placeholder.dim_400x400.png';

  return (
    <div className="container-custom py-8">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/products' })}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex-1">
            <Badge variant="secondary" className="mb-3">
              {product.category}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              {product.name}
            </h1>

            {reviews.length > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <StarRating rating={averageRating} size="md" showValue />
                <span className="text-sm text-muted-foreground">
                  ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}

            <div className="text-4xl font-bold text-primary mb-6">
              ${(Number(product.price) / 100).toFixed(2)}
            </div>

            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Sold by:</span>
                  <span className="font-medium">{sellerProfile?.name || 'Seller'}</span>
                </div>
              </CardContent>
            </Card>

            <div className="prose prose-sm max-w-none mb-8">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={!isAuthenticated || !isBuyer || addToCart.isPending}
            className="w-full"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
          </Button>
          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              Please login to add items to cart
            </p>
          )}
          {isAuthenticated && !isBuyer && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              Only buyers can purchase products
            </p>
          )}
        </div>
      </div>

      <Separator className="my-12" />

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-display font-bold">Customer Reviews</h2>
        </div>

        {isAuthenticated && isBuyer && hasPurchased && (
          <div className="mb-8">
            <ReviewForm productId={productId} />
          </div>
        )}

        {isAuthenticated && isBuyer && !hasPurchased && (
          <Card className="mb-8 bg-muted/50">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Purchase this product to leave a review
              </p>
            </CardContent>
          </Card>
        )}

        {reviewsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews
              .sort((a, b) => Number(b.timestamp - a.timestamp))
              .map((review) => (
                <Card key={review.reviewId}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">{review.buyerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(Number(review.timestamp) / 1000000).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <Card className="bg-muted/50">
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
              <p className="text-muted-foreground">
                Be the first to review this product!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
