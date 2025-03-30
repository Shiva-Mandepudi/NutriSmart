import { useState } from "react";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Tag, 
  Calendar, 
  User, 
  ArrowRight,
  Clock,
  MessageSquare,
  Heart,
  Share2
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { BlogPost } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  
  // Fetch blog posts
  const { data: blogPosts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
  });
  
  // Filter posts based on search query
  const filteredPosts = blogPosts
    ? blogPosts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
   
      
      <main className="flex-grow">
        <section className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Nutrition Blog</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Learn about nutrition, health, and wellness
            </p>
          </div>
          
          {/* Featured Article */}
          {!isLoading && blogPosts && blogPosts.length > 0 && (
            <div className="mb-10 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="h-64 md:h-auto bg-gray-300 dark:bg-gray-700 relative overflow-hidden">
                  <img 
                    src={blogPosts[0].imageUrl} 
                    alt={blogPosts[0].title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 md:p-8 flex flex-col">
                  <Badge className="self-start mb-3">{blogPosts[0].category}</Badge>
                  <h3 className="text-xl md:text-2xl font-bold mb-3">{blogPosts[0].title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {blogPosts[0].content.substring(0, 200)}...
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>NT</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">NutriTech Team</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(blogPosts[0].publishDate), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <Button 
                    className="mt-4 self-start"
                    onClick={() => setSelectedPost(blogPosts[0])}
                  >
                    Read Article
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {isLoading && (
            <div className="mb-10 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <Skeleton className="h-64 md:h-auto" />
                <div className="p-6 md:p-8 flex flex-col">
                  <Skeleton className="h-6 w-24 rounded-full mb-3" />
                  <Skeleton className="h-8 w-full mb-3" />
                  <Skeleton className="h-24 w-full mb-4" />
                  <div className="flex items-center gap-3 mt-auto">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-32 mt-4" />
                </div>
              </div>
            </div>
          )}
          
          {/* Search and Filter */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                className="pl-10" 
                placeholder="Search articles..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              // Skeletons for loading state
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-6 w-full" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                  <CardFooter>
                    <div className="flex items-center gap-3 w-full">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-20 ml-auto" />
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                      <img 
                        src={post.imageUrl} 
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                      <Badge className="absolute top-3 right-3">
                        {post.category}
                      </Badge>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                        {post.content.substring(0, 150)}...
                      </p>
                    </CardContent>
                    <CardFooter>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar size={14} />
                          <span>{format(new Date(post.publishDate), "MMM d, yyyy")}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          className="gap-1 p-0 h-auto"
                          onClick={() => setSelectedPost(post)}
                        >
                          Read more
                          <ArrowRight size={14} />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-12 text-center">
                  <p className="text-xl font-semibold text-gray-500 dark:text-gray-400">
                    No articles found
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Try adjusting your search terms
                  </p>
                </div>
              )
            )}
          </div>
        </section>
      </main>
      
      {/* Blog Article Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <Badge className="self-start mb-2 w-fit">{selectedPost.category}</Badge>
                <DialogTitle className="text-2xl">{selectedPost.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    <span>NutriTech Team</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{format(new Date(selectedPost.publishDate), "MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>5 min read</span>
                  </div>
                </DialogDescription>
              </DialogHeader>
              
              <div className="my-4 rounded-lg overflow-hidden">
                <img 
                  src={selectedPost.imageUrl} 
                  alt={selectedPost.title}
                  className="w-full h-auto max-h-80 object-cover"
                />
              </div>
              
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-line">{selectedPost.content}</p>
                
                {/* Since the actual content is short, we'll add some dummy paragraphs for the demo */}
                <p>
                  Nutrition plays a vital role in maintaining overall health and well-being. A balanced diet provides the necessary nutrients, vitamins, and minerals that our body needs to function properly. Understanding the fundamentals of nutrition can help make informed food choices.
                </p>
                
                <h3>The Importance of Macronutrients</h3>
                <p>
                  Macronutrients are nutrients that the body requires in large amounts: carbohydrates, proteins, and fats. Each macronutrient serves specific functions in the body:
                </p>
                <ul>
                  <li><strong>Carbohydrates</strong>: Provide energy and fuel for the brain and muscles</li>
                  <li><strong>Proteins</strong>: Essential for muscle growth, repair, and various metabolic processes</li>
                  <li><strong>Fats</strong>: Support hormone production, provide energy, and aid in nutrient absorption</li>
                </ul>
                
                <h3>Micronutrients: The Unsung Heroes</h3>
                <p>
                  Vitamins and minerals, though needed in smaller quantities, are crucial for various bodily functions. From immune support to bone health, these micronutrients work behind the scenes to maintain optimal health.
                </p>
                
                <h3>Hydration: The Foundation of Good Health</h3>
                <p>
                  Water is often overlooked but is perhaps the most essential nutrient. It regulates body temperature, transports nutrients, removes waste, and supports countless biochemical reactions. Staying properly hydrated is fundamental to good health.
                </p>
                
                <h3>Conclusion</h3>
                <p>
                  A holistic approach to nutrition involves understanding your body's needs, making informed food choices, and maintaining consistency. Remember that nutrition is highly individualized, and what works for one person may not work for another.
                </p>
              </div>
              
              <div className="flex items-center justify-between border-t pt-4 mt-4">
                <div className="flex gap-4">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Heart size={16} className="text-red-500" />
                    <span>125</span>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <MessageSquare size={16} />
                    <span>24 Comments</span>
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 size={16} />
                  <span>Share</span>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <MobileNav />
    </div>
  );
}
