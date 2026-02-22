import { useNavigate } from '@tanstack/react-router';
import type { CartItem, Product } from '../../backend';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag } from 'lucide-react';

interface CartSummaryProps {
  cartItems: CartItem[];
  products: Product[];
}

export default function CartSummary({ cartItems, products }: CartSummaryProps) {
  const navigate = useNavigate();

  const total = cartItems.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return sum;
    return sum + (Number(product.price) / 100) * Number(item.quantity);
  }, 0);

  const itemCount = cartItems.reduce((sum, item) => sum + Number(item.quantity), 0);

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Items ({itemCount})</span>
          <span className="font-medium">${total.toFixed(2)}</span>
        </div>
        <Separator />
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-primary">${total.toFixed(2)}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          onClick={() => navigate({ to: '/checkout' })}
          disabled={cartItems.length === 0}
        >
          <ShoppingBag className="mr-2 h-5 w-5" />
          Proceed to Checkout
        </Button>
      </CardFooter>
    </Card>
  );
}
