import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetSellerProducts } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import AddProductForm from '../components/seller/AddProductForm';
import ProductManagementList from '../components/seller/ProductManagementList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Plus } from 'lucide-react';

export default function SellerDashboard() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: products, isLoading: productsLoading } = useGetSellerProducts(
    identity?.getPrincipal() || null
  );
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const isSeller = userProfile?.role === 'seller';

  useEffect(() => {
    if (!profileLoading && (!isAuthenticated || !isSeller)) {
      navigate({ to: '/products' });
    }
  }, [isAuthenticated, isSeller, profileLoading, navigate]);

  if (profileLoading) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isSeller) {
    return null;
  }

  return (
    <div className="container-custom py-8">
      <div className="flex items-center gap-3 mb-8">
        <img
          src="/assets/generated/seller-icon.dim_64x64.png"
          alt="Seller"
          className="h-12 w-12"
        />
        <div>
          <h1 className="text-3xl font-display font-bold">Seller Dashboard</h1>
          <p className="text-muted-foreground">Manage your products and inventory</p>
        </div>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            My Products ({products?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="add" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductManagementList products={products || []} isLoading={productsLoading} />
        </TabsContent>

        <TabsContent value="add">
          <AddProductForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
