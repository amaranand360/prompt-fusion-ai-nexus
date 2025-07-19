import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Command } from 'lucide-react';
import { ToolConnectionManager } from '@/components/ToolConnectionManager';
import { ThemeToggle } from '@/contexts/ThemeContext';

export const ToolsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">ZB</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">ZenBox AI - Tool Connections</h1>
                  <p className="text-sm text-muted-foreground">Manage your AI productivity integrations</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Connected Tools & Services
            </h2>
            <p className="text-muted-foreground">
              Connect and manage your favorite tools to enable powerful search and automation across your entire workspace.
            </p>
          </div>
          
          <ToolConnectionManager />
        </div>
      </main>
    </div>
  );
};
