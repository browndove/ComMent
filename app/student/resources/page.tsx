"use client";
import React, { useState, useMemo } from 'react';
import { Search, Filter, BookOpen, ExternalLink, ChevronLeft, ChevronRight, PlayCircle, Sparkles, Info, FileText, Youtube, Headphones, ShieldCheck, Phone, MessageCircle, Heart, Brain, Users, Clock, Globe, Star, ArrowRight, Zap, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

interface Resource {
  id: string;
  title: string;
  type: 'Article' | 'Video' | 'Audio' | 'Tool' | 'Guided Session' | 'Hotline' | 'App' | 'Course' | 'Workshop';
  Icon: React.ElementType;
  description: string;
  link: string;
  image: string;
  aiHint: string;
  category: string;
  tags: string[];
  buttonStyle?: 'primary' | 'teal' | 'green' | 'purple' | 'orange';
  duration?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  featured?: boolean;
  urgent?: boolean;
}

const resourcesData: Resource[] = [
  {
    id: "crisis1",
    title: "National Suicide Prevention Lifeline",
    type: "Hotline",
    Icon: Phone,
    description: "24/7 crisis support for anyone in suicidal crisis or emotional distress. Free, confidential support available to everyone.",
    link: "tel:988",
    image: "https://placehold.co/400x300.png",
    aiHint: "supportive phone call crisis help",
    category: "Crisis Support",
    tags: ["emergency", "suicide prevention", "crisis", "hotline", "immediate help"],
    buttonStyle: 'primary',
    urgent: true,
    featured: true
  },
  {
    id: "crisis2",
    title: "Crisis Text Line",
    type: "Hotline",
    Icon: MessageCircle,
    description: "Text HOME to 741741 for 24/7 crisis support via text message. Perfect for students who prefer texting over calling.",
    link: "sms:741741",
    image: "https://placehold.co/400x300.png",
    aiHint: "text message support crisis help",
    category: "Crisis Support",
    tags: ["emergency", "text support", "crisis", "messaging", "immediate help"],
    buttonStyle: 'primary',
    urgent: true
  },
  {
    id: "app1",
    title: "Headspace - Meditation & Mindfulness",
    type: "App",
    Icon: Brain,
    description: "Popular meditation app with guided sessions, sleep stories, and mindfulness exercises. Free student discount available.",
    link: "https://www.headspace.com/studentplan",
    image: "https://placehold.co/400x300.png",
    aiHint: "peaceful meditation app interface",
    category: "Mindfulness & Relaxation",
    tags: ["meditation", "mindfulness", "app", "student discount", "sleep"],
    buttonStyle: 'teal',
    duration: "5-60 min",
    difficulty: 'Beginner',
    featured: true
  },
  {
    id: "study2",
    title: "Overcoming Test Anxiety",
    type: "Video",
    Icon: Youtube,
    description: "Practical strategies from a licensed therapist on managing test anxiety and performance pressure. Evidence-based techniques.",
    link: "https://www.youtube.com/watch?v=t-9cqaRJMP4",
    image: "https://placehold.co/400x300.png",
    aiHint: "student taking test calm confident",
    category: "Academic Support",
    tags: ["test anxiety", "performance", "stress management", "video", "therapy"],
    buttonStyle: 'teal',
    duration: "12 min",
    difficulty: 'Intermediate'
  },
  {
    id: "stress2",
    title: "Breathing Techniques for Anxiety",
    type: "Video",
    Icon: Youtube,
    description: "Learn 5 powerful breathing techniques to instantly calm anxiety and panic. Perfect for use between classes or during exams.",
    link: "https://www.youtube.com/watch?v=YRPh_GaiL8s",
    image: "https://placehold.co/400x300.png",
    aiHint: "person breathing deeply calm peaceful",
    category: "Anxiety Management",
    tags: ["breathing", "anxiety", "panic", "techniques", "instant relief"],
    buttonStyle: 'green',
    duration: "8 min",
    difficulty: 'Beginner',
    featured: true
  },
  {
    id: "social1",
    title: "7 Cups - Free Online Therapy",
    type: "Tool",
    Icon: Heart,
    description: "Free online emotional support and counseling. Connect with trained listeners or professional therapists. Available 24/7.",
    link: "https://www.7cups.com/",
    image: "https://placehold.co/400x300.png",
    aiHint: "people talking supportive conversation",
    category: "Counseling & Therapy",
    tags: ["therapy", "counseling", "support", "free", "online"],
    buttonStyle: 'purple',
    featured: true
  },
  {
    id: "sleep1",
    title: "Sleep Hygiene for Students",
    type: "Article",
    Icon: FileText,
    description: "Comprehensive guide to improving sleep quality as a student. Covers sleep schedules, environment, and habits for better rest.",
    link: "https://www.sleepfoundation.org/how-sleep-works/sleep-hygiene",
    image: "https://placehold.co/400x300.png",
    aiHint: "peaceful bedroom sleep environment",
    category: "Sleep & Wellness",
    tags: ["sleep", "hygiene", "wellness", "health", "student life"],
    buttonStyle: 'green',
    duration: "10 min read",
    difficulty: 'Beginner'
  },
  {
    id: "who1",
    title: "WHO: Doing What Matters in Times of Stress",
    type: "Article",
    Icon: Globe,
    description: "Evidence-based guide from the World Health Organization with practical skills for stress management and emotional well-being.",
    link: "https://www.who.int/publications/i/item/9789240003927",
    image: "https://placehold.co/400x300.png",
    aiHint: "person reading calm professional guide",
    category: "Professional Resources",
    tags: ["WHO", "stress management", "evidence-based", "professional", "guide"],
    buttonStyle: 'primary',
    difficulty: 'Intermediate'
  },
  {
    id: "study1",
    title: "The Pomodoro Technique Guide",
    type: "Article",
    Icon: Clock,
    description: "Complete guide to the Pomodoro Technique for managing study time and reducing academic stress through focused work sessions.",
    link: "https://todoist.com/productivity-methods/pomodoro-technique",
    image: "https://placehold.co/400x300.png",
    aiHint: "student studying focused productivity",
    category: "Academic Support",
    tags: ["productivity", "study techniques", "time management", "stress reduction"],
    buttonStyle: 'orange',
    duration: "5 min read",
    difficulty: 'Beginner'
  },
];

const ITEMS_PER_PAGE = 9;

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedType, setSelectedType] = useState<string>("All Types");
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate categories and types from resourcesData
  const categories = useMemo(() => [
    'All Categories',
    ...Array.from(new Set(resourcesData.map(r => r.category))).sort()
  ], []);

  const types = useMemo(() => [
    'All Types',
    ...Array.from(new Set(resourcesData.map(r => r.type))).sort()
  ], []);

  const filteredResources = useMemo(() => {
    return resourcesData.filter(resource => {
      const matchesSearch =
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.join(" ").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All Categories' || resource.category === selectedCategory;
      const matchesType = selectedType === 'All Types' || resource.type === selectedType;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [searchTerm, selectedCategory, selectedType]);

  const totalPages = Math.ceil(filteredResources.length / ITEMS_PER_PAGE);
  const paginatedResources = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const sortedResources = [...filteredResources].sort((a, b) => {
      if (a.urgent && !b.urgent) return -1;
      if (!a.urgent && b.urgent) return 1;
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
    return sortedResources.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredResources, currentPage]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setCurrentPage(1);
  };
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const urgentResources = resourcesData.filter(r => r.urgent);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-800/10 to-blue-600/10 text-center rounded-lg p-8 border border-blue-200/30 shadow-sm relative overflow-hidden">
        {/* Subtle wave pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBkPSJNMjU2IDEyOGM3MC43IDAgMTI4IDU3LjMgMTI4IDEyOHMtNTcuMyAxMjgtMTI4IDEyOFMxMjggMzA2LjcgMTI4IDIzNiAxODUuMyAxMjggMjU2IDEyOHptMCAzMmMtNTMuMSAwLTk2IDQyLjktOTYgOTZzNDIuOSA5NiA5NiA5NiA5Ni00Mi45IDk2LTk2LTQyLjktOTYtOTYtOTZ6IiBmaWxsPSIjMDAwIi8+PC9zdmc+')]"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-3 text-blue-900 font-serif"></h1>
          <h2 className="text-3xl font-medium mb-4 text-blue-800">Resource Library</h2>
          <div className="w-16 h-1 bg-blue-600 mx-auto mb-6 rounded-full"></div>
          <p className="text-lg text-blue-700/90 mb-6 max-w-2xl mx-auto">
            Discover carefully curated tools and wisdom for your mental wellness journey.
          </p>
          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search className="h-5 w-5 text-blue-600/70" />
            </div>
            <input
              type="search"
              placeholder="Search for topics like 'anxiety', 'study tips'..."
              className="w-full px-5 py-3 pl-12 rounded-lg shadow-sm border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 text-blue-900 placeholder-blue-400/70"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
      </div>

      {/* Urgent Resources Banner */}
      {urgentResources.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm relative overflow-hidden">
          <div className="absolute right-4 top-0 text-red-200 text-6xl font-bold leading-none">!</div>
          <div className="flex items-start relative z-10">
            <AlertCircle className="h-6 w-6 text-red-600 mr-3 mt-1 shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Need Immediate Support?</h3>
              <p className="text-red-700/80 mb-3">These resources are available 24/7 for crisis support:</p>
              <div className="flex flex-wrap gap-2">
                {urgentResources.slice(0, 3).map(resource => (
                  <Button asChild key={resource.id} variant="destructive" size="sm" className="shadow-sm">
                    <a
                      href={resource.link}
                      target={resource.link.startsWith('http') ? '_blank' : '_self'}
                      rel={resource.link.startsWith('http') ? 'noopener noreferrer' : ''}
                    >
                      <resource.Icon className="h-4 w-4 mr-2" /> {resource.title}
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Results */}
      <Card className="border-blue-200/50 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="h-5 w-5 text-blue-600/70" />
              </div>
              <select 
                value={selectedCategory} 
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 rounded-lg border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 bg-white text-blue-900 appearance-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <BookOpen className="h-5 w-5 text-blue-600/70" />
              </div>
              <select 
                value={selectedType} 
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 rounded-lg border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 bg-white text-blue-900 appearance-none"
              >
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-sm text-blue-700/80 whitespace-nowrap font-medium">
            {filteredResources.length} resources found
          </p>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      {paginatedResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedResources.map(resource => (
            <Card key={resource.id} className="group overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 border-blue-100/70 bg-blue-50/20">
              <div className="relative h-48">
                <Image
                  src={resource.image}
                  alt={resource.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={resource.aiHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent"></div>
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {resource.urgent && (
                    <Badge variant="destructive" className="shadow-sm">
                      <AlertCircle className="h-3 w-3 mr-1" /> Urgent
                    </Badge>
                  )}
                  {resource.featured && (
                    <Badge className="bg-blue-600 text-white shadow-sm">
                      <Star className="h-3 w-3 mr-1" /> Featured
                    </Badge>
                  )}
                </div>
                <div className="absolute top-3 right-3 bg-blue-900/80 text-white px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm">
                  <resource.Icon className="h-3 w-3" />
                  {resource.type}
                </div>
              </div>
              <CardContent className="p-5 flex-grow flex flex-col">
                <p className="text-xs font-medium text-blue-600 mb-1 tracking-wider">{resource.category}</p>
                <CardTitle className="text-lg font-bold line-clamp-2 flex-grow group-hover:text-blue-700 transition-colors font-serif">
                  {resource.title}
                </CardTitle>
                <p className="text-blue-800/70 text-sm mt-2 line-clamp-3">{resource.description}</p>
                {resource.duration && (
                  <div className="flex items-center mt-3 text-xs text-blue-600/80">
                    <Clock className="h-3 w-3 mr-1" /> {resource.duration}
                  </div>
                )}
              </CardContent>
              <CardContent className="p-5 pt-0">
                <Button asChild className="w-full mt-2 bg-blue-700 hover:bg-blue-800 text-white shadow-sm transition-all group">
                  <a
                    href={resource.link}
                    target={resource.link.startsWith('http') ? '_blank' : '_self'}
                    rel={resource.link.startsWith('http') ? 'noopener noreferrer' : ''}
                  >
                    {resource.link.startsWith('http') ? 'View Resource' : 'Access Now'}
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Card className="max-w-md mx-auto p-8 border-blue-200 bg-blue-50/30 shadow-sm">
            <Search className="h-16 w-16 mx-auto text-blue-400 mb-4" />
            <h3 className="text-2xl font-semibold mb-2 text-blue-900">No Resources Found</h3>
            <p className="text-blue-700/80 mb-6">
              Try adjusting your search terms or filters.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All Categories");
                setSelectedType("All Types");
                setCurrentPage(1);
              }}
              className="bg-blue-700 hover:bg-blue-800 text-white shadow-sm"
            >
              Reset Filters
            </Button>
          </Card>
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button 
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="icon"
                onClick={() => handlePageChange(page)}
                className={currentPage === page ? 'bg-blue-700 text-white' : 'border-blue-200 text-blue-700 hover:bg-blue-50'}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="relative py-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-blue-200/50"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-blue-600/70 text-sm font-medium">Peace of Mind</span>
        </div>
      </div>
    </div>
  );
}