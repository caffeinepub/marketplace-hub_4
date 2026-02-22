import type { CartItem, Product } from '../../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface OrderSummaryProps {
  cartItems: CartItem[];
  products: Product[];
}

export default function OrderSummary({ cartItems, products }: OrderSummaryProps) {
  const total = cartItems.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return sum;
    return sum + (Number(product.price) / 100) * Number(item.quantity);
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cartItems.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          if (!product) return null;

          const itemTotal = (Number(product.price) / 100) * Number(item.quantity);

          return (
            <div key={item.productId} className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  Quantity: {Number(item.quantity)} × ${(Number(product.price) / 100).toFixed(2)}
                </p>
              </div>
              <p className="font-semibold">${itemTotal.toFixed(2)}</p>
            </div>
          );
        })}
        <Separator />
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-primary">${total.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
