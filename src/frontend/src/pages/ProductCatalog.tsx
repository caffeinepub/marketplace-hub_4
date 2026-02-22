import { useState } from 'react';
import { useGetAllProducts, useSearchProducts, useGetProductsByCategory } from '../hooks/useQueries';
import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductCatalog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: allProducts, isLoading: allLoading } = useGetAllProducts();
  const { data: searchResults, isLoading: searchLoading } = useSearchProducts(searchTerm);
  const { data: categoryProducts, isLoading: categoryLoading } = useGetProductsByCategory(selectedCategory);

  const isLoading = allLoading || searchLoading || categoryLoading;
  
  const products = searchTerm
    ? searchResults || []
    : selectedCategory
    ? categoryProducts || []
    : allProducts || [];

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-[300px] md:h-[400px] overflow-hidden">
        <img
          src="/assets/generated/hero-banner.dim_1920x600.png"
          alt="Marketplace Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/40 flex items-center">
          <div className="container-custom">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4">
              Discover Amazing Products
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Shop from trusted sellers and find exactly what you need
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Products */}
      <div className="container-custom py-8">
        <ProductFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No products found</p>
            {(searchTerm || selectedCategory) && (
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your filters
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
