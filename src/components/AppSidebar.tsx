
import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search,
  Zap,
  Settings,
  BarChart3,
  BookOpen,
  Database,
  Users,
  Sparkles,
  Link,
  Home,
  MessageSquare,
  Brain,
  Cloud,
  Bot,
  Gem,
  Calendar,
  FolderOpen,
  Github,
  Plus,
  ChevronDown,
  ChevronRight,
  User,
  Command
} from 'lucide-react';

// Main navigation items
const mainItems = [
  { title: 'Home', url: '/', icon: Home, badge: null },
  { title: 'Talk', url: '/talk', icon: MessageSquare, badge: '4x productivity' },
];

// AI Models section
const modelItems = [
  { title: 'Brain', url: '/models/brain', icon: Brain, badge: null },
  { title: 'Claude', url: '/models/claude', icon: Cloud, badge: null },
  { title: 'ChatGPT', url: '/models/chatgpt', icon: Bot, badge: null },
  { title: 'Gemini', url: '/models/gemini', icon: Gem, badge: '2.5 Pro #4' },
];

// Apps/Integrations section
const appItems = [
  { title: 'ClickUp', url: '/apps/clickup', icon: Zap, badge: null },
  { title: 'Google Calendar', url: '/apps/calendar', icon: Calendar, badge: null },
  { title: 'Google Drive', url: '/apps/drive', icon: FolderOpen, badge: null },
  { title: 'Dropbox', url: '/apps/dropbox', icon: Database, badge: null },
  { title: 'GitHub', url: '/apps/github', icon: Github, badge: null },
];

// Recent chats/activities
const recentChats = [
  'Reminder for Self Study Tomorrow...',
  'Meeting with Amar at 11 AM',
  'Next.js App Creation Command',
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const isCollapsed = state === 'collapsed';
  const [modelsExpanded, setModelsExpanded] = useState(true);
  const [appsExpanded, setAppsExpanded] = useState(true);
  const [chatsExpanded, setChatsExpanded] = useState(true);

  const isActive = (path: string) => location.pathname === path;

  const SidebarItem = ({ item, isActive }: { item: any; isActive: boolean }) => (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink
          to={item.url}
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
            ${isActive
              ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500 dark:bg-blue-950 dark:text-blue-300'
              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800'
            }
          `}
        >
          <item.icon className={`h-4 w-4 ${isActive ? 'text-blue-500' : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300'}`} />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-sm font-medium">{item.title}</span>
              {item.badge && (
                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  const SectionHeader = ({ title, expanded, onToggle, icon: Icon }: any) => (
    <div className="flex items-center justify-between px-3 py-2 mb-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
        {!isCollapsed && (
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {title}
          </span>
        )}
      </div>
      {!isCollapsed && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </Button>
      )}
    </div>
  );

  return (
    <Sidebar className={`${isCollapsed ? "w-16" : "w-72"} border-r border-gray-200 dark:border-gray-800`} collapsible="offcanvas">
      <SidebarContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">ZB</span>
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white">ZenBox <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent text-sm font-semibold">AI</span></h1>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <div className="p-3">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {mainItems.map((item) => (
                  <SidebarItem key={item.title} item={item} isActive={isActive(item.url)} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Models Section */}
        <div className="px-3">
          <SectionHeader
            title="Models"
            expanded={modelsExpanded}
            onToggle={() => setModelsExpanded(!modelsExpanded)}
          />
          {modelsExpanded && (
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {modelItems.map((item) => (
                    <SidebarItem key={item.title} item={item} isActive={isActive(item.url)} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </div>

        {/* Apps Section */}
        <div className="px-3 mt-4">
          <SectionHeader
            title="Apps"
            expanded={appsExpanded}
            onToggle={() => setAppsExpanded(!appsExpanded)}
          />
          {appsExpanded && (
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {appItems.map((item) => (
                    <SidebarItem key={item.title} item={item} isActive={isActive(item.url)} />
                  ))}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <button
                        onClick={() => navigate('/tools')}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 w-full text-left"
                      >
                        <Plus className="h-4 w-4" />
                        {!isCollapsed && <span className="text-sm">Connect app</span>}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </div>

        {/* Chats Section */}
        <div className="px-3 mt-4 flex-1">
          <SectionHeader
            title="Chats"
            expanded={chatsExpanded}
            onToggle={() => setChatsExpanded(!chatsExpanded)}
          />
          {chatsExpanded && !isCollapsed && (
            <div className="space-y-1">
              {recentChats.map((chat, index) => (
                <button
                  key={index}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition-all duration-200 truncate"
                >
                  {chat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Workspace Section */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 mt-auto">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 border border-purple-200 dark:bg-gradient-to-r dark:from-purple-900/20 dark:via-blue-900/20 dark:to-cyan-900/20 dark:border-purple-500/30">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded flex items-center justify-center">
              <User className="h-3 w-3 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <div className="text-sm font-medium bg-gradient-to-r from-purple-700 via-blue-700 to-cyan-700 bg-clip-text text-transparent dark:from-purple-300 dark:via-blue-300 dark:to-cyan-300">Amar's ZenBox AI</div>
              </div>
            )}
            {!isCollapsed && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-purple-600 hover:text-purple-800 dark:text-gray-400 dark:hover:text-white">
                <Settings className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
