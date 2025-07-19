
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Settings, Search, Command } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationCenter } from '@/components/NotificationCenter';

export const Header = () => {
  const navigate = useNavigate();

  const handleGlobalSearch = () => {
    navigate('/');
  };

  return (
    <header className="h-16 border-b bg-background/80 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">ZB</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">ZenBox <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">AI</span></h1>
        </div>
      </div>

      {/* Global Search Button */}
      <div className="flex-1 max-w-md mx-8">
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleGlobalSearch}
        >
          <Search className="h-4 w-4 mr-2" />
          Search or ask anything...
          <div className="ml-auto flex items-center gap-1">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <NotificationCenter />
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm">
            U
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};
