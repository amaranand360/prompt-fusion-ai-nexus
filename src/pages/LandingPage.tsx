import Spline from '@splinetool/react-spline';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSearchClick = () => {
    setIsTransitioning(true);

    // Start fade out animation, then navigate
    setTimeout(() => {
      navigate('/search');
    }, 800); // 800ms for smooth transition
  };

  return (
    <main style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Main Content with Fade Out Effect */}
      <div className={`transition-opacity duration-700 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {/* Floating Navigation Bar */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 shadow-2xl">
            <div className="flex items-center gap-4">
              {/* Logo/Brand */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-white font-semibold text-lg">ZenBox AI</span>
              </div>

              {/* Search Button */}
              <Button
                onClick={handleSearchClick}
                disabled={isTransitioning}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-2 rounded-full font-medium shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center gap-2 disabled:opacity-70"
              >
                <Search className="h-4 w-4" />
                Start Searching
              </Button>
            </div>
          </div>
        </div>

        {/* Spline 3D Scene */}
        <Spline
          scene="https://prod.spline.design/5wxq-b4n3f5kLLV0/scene.splinecode"
        />
      </div>

      {/* Transition Overlay */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-black z-60 animate-in fade-in duration-700" />
      )}
    </main>
  );
}
