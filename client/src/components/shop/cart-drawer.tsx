import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Product } from "@shared/schema";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Check,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: { product: Product; quantity: number }[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
}

export function CartDrawer({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem }: CartDrawerProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const { toast } = useToast();
  
  // Format price from cents to dollars
  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(priceInCents / 100);
  };
  
  // Calculate subtotal
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product.price * item.quantity), 
    0
  );
  
  // Calculate tax (e.g., 8%)
  const tax = Math.round(subtotal * 0.08);
  
  // Calculate total
  const total = subtotal + tax;
  
  // Simulate checkout process
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      // This would normally hit a payment API endpoint
      // Simulating API call delay
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 2000);
      });
    },
    onSuccess: () => {
      setIsPaymentComplete(true);
      toast({
        title: "Payment successful!",
        description: "Thank you for your purchase.",
      });
      
      // Reset cart and drawer after successful checkout
      setTimeout(() => {
        cartItems.forEach(item => onRemoveItem(item.product.id));
        setIsPaymentComplete(false);
        setIsCheckingOut(false);
        onClose();
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Payment failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
      setIsCheckingOut(false);
    },
  });
  
  const handleCheckout = () => {
    setIsCheckingOut(true);
    checkoutMutation.mutate();
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart
          </SheetTitle>
          <SheetDescription>
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </SheetDescription>
        </SheetHeader>
        
        {isPaymentComplete ? (
          <div className="flex flex-col items-center justify-center h-[70vh]">
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-4">
              <Check className="h-16 w-16 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              Your order has been processed and will be shipped soon.
            </p>
            <p className="text-sm text-primary font-medium">
              Order #NTA-{Math.floor(Math.random() * 100000)}
            </p>
          </div>
        ) : isCheckingOut ? (
          <div className="space-y-5">
            <div className="space-y-4">
              <h3 className="font-medium">Shipping Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm mb-1 block text-gray-600 dark:text-gray-400">First Name</label>
                  <Input placeholder="John" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm mb-1 block text-gray-600 dark:text-gray-400">Last Name</label>
                  <Input placeholder="Doe" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm mb-1 block text-gray-600 dark:text-gray-400">Address</label>
                  <Input placeholder="1234 Main St" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm mb-1 block text-gray-600 dark:text-gray-400">City</label>
                  <Input placeholder="New York" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm mb-1 block text-gray-600 dark:text-gray-400">Zip Code</label>
                  <Input placeholder="10001" />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="font-medium">Payment Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm mb-1 block text-gray-600 dark:text-gray-400">Card Number</label>
                  <Input placeholder="4242 4242 4242 4242" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-sm mb-1 block text-gray-600 dark:text-gray-400">Expiration Date</label>
                    <Input placeholder="MM/YY" />
                  </div>
                  <div>
                    <label className="text-sm mb-1 block text-gray-600 dark:text-gray-400">CVC</label>
                    <Input placeholder="123" />
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            
            <Button 
              className="w-full h-12 gap-2" 
              onClick={handleCheckout}
              disabled={checkoutMutation.isPending}
            >
              {checkoutMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pay {formatPrice(total)}
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setIsCheckingOut(false)}
              disabled={checkoutMutation.isPending}
            >
              Back to Cart
            </Button>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <ShoppingCart className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Button onClick={onClose}>Continue Shopping</Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4">
                {cartItems.map(({ product, quantity }) => (
                  <div 
                    key={product.id} 
                    className="flex gap-4 py-3 border-b border-gray-100 dark:border-gray-800"
                  >
                    <div className="w-20 h-20 rounded-md bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <h4 className="font-medium">{product.name}</h4>
                        <span className="font-medium">{formatPrice(product.price * quantity)}</span>
                      </div>
                      
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
                        {product.category}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center border rounded">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-r-none"
                            onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                            disabled={quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-l-none"
                            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove item from cart?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove {product.name} from your cart.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => onRemoveItem(product.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="space-y-5 pt-5">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              
              <Button 
                className="w-full h-12 gap-2" 
                onClick={() => setIsCheckingOut(true)}
              >
                <CreditCard className="h-4 w-4" />
                Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
