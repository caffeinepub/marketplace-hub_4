import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetBuyerOrders, useGetAllProducts } from '../hooks/useQueries';
import { useEffect } from 'react';
import OrderCard from '../components/orders/OrderCard';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Package } from 'lucide-react';

export default function BuyerOrders() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: orders, isLoading: ordersLoading } = useGetBuyerOrders();
  const { data: products } = useGetAllProducts();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const isBuyer = userProfile?.role === 'buyer';

  useEffect(() => {
    if (!profileLoading && (!isAuthenticated || !isBuyer)) {
      navigate({ to: '/products' });
    }
  }, [isAuthenticated, isBuyer, profileLoading, navigate]);

  if (profileLoading || ordersLoading) {
    return (
      <div className="container-custom py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isBuyer) {
    return null;
  }

  return (
    <div className="container-custom py-8">
      <div className="flex items-center gap-3 mb-8">
        <Package className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-display font-bold">My Orders</h1>
          <p className="text-muted-foreground">View your purchase history</p>
        </div>
      </div>

      {!orders || orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground">
              Start shopping to see your orders here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} products={products || []} isSeller={false} />
          ))}
        </div>
      )}
    </div>
  );
}
