import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Send, User } from "lucide-react";

// Message type definition for the chat
interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export default function ChatPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "👋 Hi there! I'm your NutriTech AI assistant. I can help you with nutrition advice, recipe suggestions, meal planning, and answering your health-related questions. How can I assist you today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Chat message mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/ai/chat", { question: message });
      return await res.json();
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: data.answer,
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    // Send to API
    chatMutation.mutate(input);
    
    // Clear input
    setInput("");
  };

  return (
    <div className="container max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AI Nutrition Assistant</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Ask any questions about nutrition, diet, recipes, or get personalized advice
        </p>
      </div>

      <Card className="border-2 border-gray-100 dark:border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle>Chat with NutriTech AI</CardTitle>
          <CardDescription>
            Your personal nutrition and wellness assistant
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4 h-[500px] overflow-y-auto p-1">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  } items-start gap-2`}
                >
                  <Avatar className={`mt-1 ${message.role === "assistant" ? "bg-primary-100 text-primary-700" : "bg-secondary-100 text-secondary-700"}`}>
                    {message.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                    <AvatarFallback>
                      {message.role === "user" ? "U" : "AI"}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary-500 text-white"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div 
                      className={`text-xs mt-1 ${
                        message.role === "user" 
                          ? "text-primary-100" 
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2">
                  <Avatar className="mt-1 bg-primary-100 text-primary-700">
                    <Bot className="h-4 w-4" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-4 py-2 bg-gray-100 dark:bg-gray-800 flex items-center">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        
        <CardFooter>
          <form onSubmit={handleSendMessage} className="w-full flex gap-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={chatMutation.isPending}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={chatMutation.isPending || !input.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
      
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        <p>Suggestions: Try asking about</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {["Meal plans for weight loss", "Protein-rich breakfast ideas", "How many calories should I eat?", "Best foods for muscle recovery"].map((suggestion) => (
            <Button 
              key={suggestion}
              variant="outline" 
              size="sm"
              onClick={() => setInput(suggestion)}
              disabled={chatMutation.isPending}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}