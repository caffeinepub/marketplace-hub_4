import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetCart, useGetAllProducts } from '../hooks/useQueries';
import { useEffect } from 'react';
import CartItemRow from '../components/cart/CartItemRow';
import CartSummary from '../components/cart/CartSummary';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Cart() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: cart, isLoading: cartLoading } = useGetCart();
  const { data: products } = useGetAllProducts();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (!profileLoading && !isAuthenticated) {
      navigate({ to: '/products' });
    }
  }, [isAuthenticated, profileLoading, navigate]);

  if (profileLoading || cartLoading) {
    return (
      <div className="container-custom py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const cartItems = cart || [];
  const isEmpty = cartItems.length === 0;

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-display font-bold mb-8">Shopping Cart</h1>

      {isEmpty ? (
        <Card>
          <CardContent className="p-12 text-center">
            <img
              src="/assets/generated/empty-cart.dim_300x300.png"
              alt="Empty cart"
              className="mx-auto mb-6 w-48 h-48"
            />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to add items to your cart
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const product = products?.find((p) => p.id === item.productId);
              if (!product) return null;
              return <CartItemRow key={item.productId} item={item} product={product} />;
            })}
          </div>
          <div className="lg:col-span-1">
            <CartSummary cartItems={cartItems} products={products || []} />
          </div>
        </div>
      )}
    </div>
  );
}
