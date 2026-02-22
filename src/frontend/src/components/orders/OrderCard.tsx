import type { Order, Product } from '../../backend';
import { useGetUserProfile } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  products: Product[];
  isSeller: boolean;
}

export default function OrderCard({ order, products, isSeller }: OrderCardProps) {
  const { data: buyerProfile } = useGetUserProfile(isSeller ? order.buyer : null);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
            {isSeller && buyerProfile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <User className="h-4 w-4" />
                <span>Buyer: {buyerProfile.name}</span>
              </div>
            )}
          </div>
          <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
            {order.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {order.items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product) return null;

            const itemTotal = (Number(product.price) / 100) * Number(item.quantity);

            return (
              <div key={item.productId} className="flex justify-between items-start text-sm">
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-muted-foreground">
                    Quantity: {Number(item.quantity)} × ${(Number(product.price) / 100).toFixed(2)}
                  </p>
                </div>
                <p className="font-semibold">${itemTotal.toFixed(2)}</p>
              </div>
            );
          })}
        </div>
        <Separator />
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-primary">${(Number(order.total) / 100).toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
