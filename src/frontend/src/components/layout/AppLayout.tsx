import { Outlet, Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetCart } from '../../hooks/useQueries';
import LoginButton from '../auth/LoginButton';
import { ShoppingCart, Store, Package, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AppLayout() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: cart } = useGetCart();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const isSeller = userProfile?.role === 'seller';
  const isBuyer = userProfile?.role === 'buyer';
  const cartItemCount = cart?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-custom flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center space-x-2">
              <Store className="h-6 w-6 text-primary" />
              <span className="font-display font-bold text-xl">Marketplace Hub</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/products"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Products
              </Link>
              {isAuthenticated && isSeller && (
                <Link
                  to="/seller/dashboard"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Dashboard
                </Link>
              )}
              {isAuthenticated && isBuyer && (
                <Link
                  to="/orders/buyer"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  My Orders
                </Link>
              )}
              {isAuthenticated && isSeller && (
                <Link
                  to="/orders/seller"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Sales
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && isBuyer && (
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate({ to: '/cart' })}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            )}
            <LoginButton />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t bg-muted/30 mt-auto">
        <div className="container-custom py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} Marketplace Hub</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Built with</span>
              <Heart className="h-4 w-4 text-primary fill-primary" />
              <span>using</span>
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-primary transition-colors"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
