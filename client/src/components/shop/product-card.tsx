import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@shared/schema";
import { ShoppingCart, Plus, Minus } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const handleAddToCart = () => {
    setIsAddingToCart(true);
    onAddToCart(product, quantity);
    
    // Reset quantity and button state after adding
    setTimeout(() => {
      setQuantity(1);
      setIsAddingToCart(false);
    }, 1000);
  };
  
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decrementQuantity = () => {
    setQuantity(prev => prev > 1 ? prev - 1 : 1);
  };
  
  // Format price from cents to dollars
  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(priceInCents / 100);
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition duration-300 h-full flex flex-col">
      <div className="h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        <Badge className="absolute top-3 right-3 bg-primary">
          {formatPrice(product.price)}
        </Badge>
      </div>
      
      <CardContent className="flex-grow p-4">
        <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-2">
          {product.description}
        </p>
        <Badge variant="outline" className="mt-2">
          {product.category}
        </Badge>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 border-t border-gray-100 dark:border-gray-800">
        {isAddingToCart ? (
          <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
            Added to Cart!
          </Button>
        ) : (
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border rounded-md">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-r-none"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-l-none"
                  onClick={incrementQuantity}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <Button 
              onClick={handleAddToCart} 
              className="w-full gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
