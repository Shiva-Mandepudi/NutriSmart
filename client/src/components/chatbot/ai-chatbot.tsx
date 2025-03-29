import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Loader, 
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

// Example nutrition information for the bot to use
const NUTRITION_FACTS = {
  apple: {
    calories: 95,
    carbs: 25,
    protein: 0.5,
    fat: 0.3,
    fiber: 4.4
  },
  banana: {
    calories: 105,
    carbs: 27,
    protein: 1.3,
    fat: 0.4,
    fiber: 3.1
  },
  chicken: {
    calories: 165,
    carbs: 0,
    protein: 31,
    fat: 3.6,
    fiber: 0
  }
};

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hi there! I\'m your AI nutrition assistant. How can I help you today?',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  // Simulate AI response
  const generateResponse = useMutation({
    mutationFn: async (userMessage: string) => {
      // This would normally call an API endpoint
      // Simulating network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const normalizedMessage = userMessage.toLowerCase();
      
      // Simple pattern matching for demo purposes
      if (normalizedMessage.includes('hello') || normalizedMessage.includes('hi')) {
        return `Hello${user?.firstName ? ' ' + user.firstName : ''}! How can I assist with your nutrition questions today?`;
      }
      
      if (normalizedMessage.includes('calorie') && normalizedMessage.includes('need')) {
        return `Based on average recommendations, most adults need between 1,600-3,000 calories daily depending on their age, gender, weight, height, and activity level. For a precise calculation, try our Calorie Calculator in the Tools section!`;
      }
      
      if (normalizedMessage.includes('keto')) {
        return 'The ketogenic diet is a very low-carb, high-fat diet that shares similarities with Atkins. It involves drastically reducing carbohydrate intake and replacing it with fat, putting your body into a metabolic state called ketosis.';
      }
      
      if (normalizedMessage.includes('protein') && normalizedMessage.includes('how much')) {
        return 'The Recommended Dietary Allowance for protein is 0.8 grams per kilogram of body weight. Athletes and active individuals may need 1.2-2.0 g/kg. For muscle building, aim for 1.6-2.2 g/kg.';
      }
      
      // Check if user is asking about a specific food
      for (const [food, nutrients] of Object.entries(NUTRITION_FACTS)) {
        if (normalizedMessage.includes(food)) {
          return `A medium ${food} contains approximately ${nutrients.calories} calories, ${nutrients.carbs}g carbs, ${nutrients.protein}g protein, and ${nutrients.fat}g fat. It also provides ${nutrients.fiber}g of fiber.`;
        }
      }
      
      return `Thank you for your question! I'm continuously learning about nutrition. If you need specific information, try asking about calories, macronutrients, or specific diets like keto or Mediterranean.`;
    }
  });
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Generate AI response
    generateResponse.mutate(input, {
      onSuccess: (response) => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response,
          sender: 'assistant',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
    });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // The floating chat button when closed
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary-600 transition-all duration-300"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    );
  }
  
  return (
    <div 
      className={cn(
        "fixed z-50 bottom-6 right-6 w-80 md:w-96 rounded-xl shadow-xl bg-white dark:bg-gray-800 flex flex-col transition-all duration-300 overflow-hidden",
        isMinimized ? "h-16" : "h-[500px]"
      )}
    >
      {/* Chat Header */}
      <div 
        className="p-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white flex justify-between items-center cursor-pointer"
        onClick={() => isMinimized ? setIsMinimized(false) : null}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <h3 className="font-semibold">Nutrition AI Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          {isMinimized ? (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(false);
              }}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setIsMinimized(true)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      
      {!isMinimized && (
        <>
          {/* Chat Messages */}
          <ScrollArea className="flex-grow p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex items-start gap-2 max-w-[80%]">
                    {message.sender === 'assistant' && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary-100 text-primary-500">AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div 
                      className={`p-3 rounded-lg ${
                        message.sender === 'user' 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <span className="block text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {message.sender === 'user' && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        {user?.profilePicture ? (
                          <AvatarImage src={user.profilePicture} alt={user.username} />
                        ) : (
                          <AvatarFallback className="bg-secondary-100 text-secondary-500">
                            {user?.firstName?.charAt(0) || user?.username.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}
              {generateResponse.isPending && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary-100 text-primary-500">AI</AvatarFallback>
                    </Avatar>
                    <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                      <Loader className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* Chat Input */}
          <div className="p-3 border-t dark:border-gray-700">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about nutrition..."
                className="flex-grow"
              />
              <Button 
                onClick={handleSendMessage} 
                size="icon" 
                disabled={!input.trim() || generateResponse.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ask me about calories, macros, recipes, or diets!
            </p>
          </div>
        </>
      )}
    </div>
  );
}
