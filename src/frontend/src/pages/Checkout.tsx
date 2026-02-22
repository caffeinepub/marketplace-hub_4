import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetCart, useGetAllProducts, useCheckout } from '../hooks/useQueries';
import { useEffect } from 'react';
import OrderSummary from '../components/checkout/OrderSummary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function Checkout() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: cart, isLoading: cartLoading } = useGetCart();
  const { data: products } = useGetAllProducts();
  const checkout = useCheckout();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (!profileLoading && !isAuthenticated) {
      navigate({ to: '/products' });
    }
  }, [isAuthenticated, profileLoading, navigate]);

  const handleCheckout = async () => {
    try {
      await checkout.mutateAsync();
      toast.success('Order placed successfully!');
      navigate({ to: '/order-confirmation' });
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to complete checkout');
    }
  };

  if (profileLoading || cartLoading) {
    return (
      <div className="container-custom py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!isAuthenticated || !cart || cart.length === 0) {
    navigate({ to: '/cart' });
    return null;
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-display font-bold mb-8">Checkout</h1>

      <div className="max-w-3xl mx-auto">
        <OrderSummary cartItems={cart} products={products || []} />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Complete Your Purchase</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Review your order above and click the button below to complete your purchase.
            </p>
            <Button
              size="lg"
              className="w-full"
              onClick={handleCheckout}
              disabled={checkout.isPending}
            >
              {checkout.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Complete Purchase'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
