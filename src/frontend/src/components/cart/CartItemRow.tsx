import type { CartItem, Product } from '../../backend';
import { useUpdateCartItem, useRemoveFromCart } from '../../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface CartItemRowProps {
  item: CartItem;
  product: Product;
}

export default function CartItemRow({ item, product }: CartItemRowProps) {
  const [quantity, setQuantity] = useState(Number(item.quantity));
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();

  const imageUrl = product.image
    ? product.image.getDirectURL()
    : '/assets/generated/product-placeholder.dim_400x400.png';

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setQuantity(newQuantity);
    try {
      await updateCartItem.mutateAsync({
        productId: item.productId,
        quantity: BigInt(newQuantity),
      });
    } catch (error) {
      console.error('Update quantity error:', error);
      toast.error('Failed to update quantity');
      setQuantity(Number(item.quantity));
    }
  };

  const handleRemove = async () => {
    try {
      await removeFromCart.mutateAsync(item.productId);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Remove item error:', error);
      toast.error('Failed to remove item');
    }
  };

  const itemTotal = (Number(product.price) / 100) * quantity;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-24 h-24 object-cover rounded"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {product.description}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || updateCartItem.isPending}
                >
                  -
                </Button>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  className="w-16 text-center"
                  disabled={updateCartItem.isPending}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={updateCartItem.isPending}
                >
                  +
                </Button>
              </div>
              <div className="text-lg font-bold text-primary">
                ${itemTotal.toFixed(2)}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={removeFromCart.isPending}
          >
            <Trash2 className="h-5 w-5 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
