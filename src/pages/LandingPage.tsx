import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Spline from '@splinetool/react-spline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Zap, 
  Search, 
  Mail, 
  Calendar, 
  Video,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show content after a brief delay for smooth animation
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    navigate('/search');
  };

  const handleSplineLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Spline 3D Scene Background */}
      <div className="absolute inset-0 z-0">
        <Spline
          scene="https://prod.spline.design/5wxq-b4n3f5kLLV0/scene.splinecode"
          onLoad={handleSplineLoad}
        />
      </div>

      {/* Dark Overlay for Better Text Readability */}
      <div className="absolute inset-0 bg-black/30 z-10" />

      {/* Content Overlay */}
      <div className="relative z-20 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">ZB</span>
              </div>
              <span className="text-white font-semibold text-xl">ZenBox AI</span>
            </div>
            
            <Badge variant="outline" className="bg-white/10 text-white border-white/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Beta
            </Badge>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {/* Hero Section */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                  Your AI-Powered
                  <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Productivity Hub
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Unify search, automation, and AI across all your favorite tools. 
                  Execute actions, manage tasks, and boost productivity with intelligent assistance.
                </p>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-4 py-8">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                  <Mail className="h-4 w-4 text-red-400" />
                  <span className="text-sm font-medium">Gmail Integration</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium">Calendar Management</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                  <Video className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium">Google Meet</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium">AI Automation</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 group"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Start Searching
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 px-8 py-4 text-lg font-semibold"
                  onClick={() => window.open('https://github.com/your-repo', '_blank')}
                >
                  View Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">50+</div>
                  <div className="text-gray-400">Integrated Tools</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">10x</div>
                  <div className="text-gray-400">Faster Workflows</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">AI</div>
                  <div className="text-gray-400">Powered Actions</div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6">
          <div className="flex flex-col items-center gap-4 max-w-7xl mx-auto">
            <div className="animate-bounce">
              <ChevronDown className="h-6 w-6 text-white/60" />
            </div>
            <p className="text-white/60 text-sm text-center">
              Scroll to explore or click "Start Searching" to begin your productivity journey
            </p>
          </div>
        </footer>
      </div>

      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 z-30 bg-slate-900 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
            <p className="text-white/80 text-lg">Loading ZenBox AI...</p>
          </div>
        </div>
      )}
    </div>
  );
};
