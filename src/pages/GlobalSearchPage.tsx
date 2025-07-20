import React, { useState, useEffect } from 'react';
import { GlobalSearchInterface } from '@/components/GlobalSearchInterface';
import { SearchResults } from '@/components/SearchResults';
import { ActionExecutionFlow } from '@/components/ActionExecutionFlow';
import { ActionPreviewData } from '@/components/ActionPreview';
import { AIAssistantSummary } from '@/components/AIAssistantSummary';
import { testAgentsService, AgentExecuteRequest } from '@/services/testAgentsService';
import { openaiService, OpenAIAnalysisResult } from '@/services/openaiService';

type SearchView = 'home' | 'results' | 'action' | 'ai-analysis';

interface ActionResult {
  id: string;
  action: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  description: string;
  result?: string;
  timestamp: string;
}

export const GlobalSearchPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<SearchView>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentAction, setCurrentAction] = useState('');
  const [actionResults, setActionResults] = useState<ActionResult[]>([]);
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);
  const [backendStatus, setBackendStatus] = useState<any>(null);
  const [previewData, setPreviewData] = useState<ActionPreviewData | null>(null);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [currentExecutionResult, setCurrentExecutionResult] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<OpenAIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Check backend availability on component mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const available = await testAgentsService.isAvailable();
        setIsBackendAvailable(available);

        if (available) {
          const status = await testAgentsService.getStatus();
          setBackendStatus(status);
          console.log('Test-Agents backend is available:', status);
        } else {
          console.log('Test-Agents backend is not available, using demo mode');
        }
      } catch (error) {
        console.warn('Failed to check backend availability:', error);
        setIsBackendAvailable(false);
      }
    };

    checkBackend();
  }, []);

  // Helper function to execute demo actions (when backend is not available)
  const executeDemoAction = async (action: string, actionId: string, actionData: ActionPreviewData) => {
    try {
      console.log('🎭 Executing demo action:', action);
      setIsExecutingAction(true);
      updateActionResult(actionId, 'executing');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

      // Generate demo success response based on action type
      let demoResult = '';
      if (actionData.type === 'email') {
        demoResult = `✅ Email sent successfully to ${actionData.data.recipients?.join(', ')}!\n\n📧 Subject: ${actionData.data.subject}\n📝 Message delivered to ${actionData.data.recipients?.length || 0} recipient(s)`;
      } else if (actionData.type === 'calendar' || actionData.type === 'meeting') {
        const meetLink = actionData.data.includeMeet ? '\n🔗 Google Meet: https://meet.google.com/demo-link-123' : '';
        demoResult = `✅ ${actionData.data.includeMeet ? 'Meeting' : 'Calendar event'} created successfully!\n\n📅 ${actionData.data.title}\n🕐 ${actionData.data.date} at ${actionData.data.time}\n⏱️ Duration: ${actionData.data.duration} minutes\n👥 Attendees: ${actionData.data.attendees?.join(', ')}${meetLink}`;
      } else {
        demoResult = `✅ Action "${action}" completed successfully!\n\n🎯 Demo mode: This action was simulated for demonstration purposes.`;
      }

      setCurrentExecutionResult(demoResult);
      updateActionResult(actionId, 'completed', demoResult);
      setIsExecutingAction(false);
    } catch (error) {
      console.error('Demo action error:', error);
      setCurrentExecutionResult('Demo action failed');
      updateActionResult(actionId, 'failed', 'Demo action failed');
      setIsExecutingAction(false);
    }
  };

  // Helper function to generate preview data from action with rich demo data
  const generatePreviewData = (action: string): ActionPreviewData => {
    const actionLower = action.toLowerCase();

    if (actionLower.includes('email') || actionLower.includes('send') || actionLower.includes('compose')) {
      // Generate rich demo data based on action context
      let recipients: string[] = [];
      let subject: string = '';
      let body: string = '';

      if (actionLower.includes('project update')) {
        recipients = ['team@company.com', 'manager@company.com', 'stakeholders@company.com'];
        subject = 'Weekly Project Update - ZenBox AI Development';
        body = `Hi Team,

I hope this email finds you well. I wanted to provide you with a comprehensive update on our ZenBox AI project progress.

📊 **This Week's Achievements:**
• Completed the Global Search interface with action previews
• Integrated real-time Google API connections (Gmail, Calendar, Meet)
• Implemented auto-scroll and highlight functionality
• Added comprehensive error handling and fallback mechanisms

🎯 **Key Metrics:**
• 95% of planned features completed
• Zero critical bugs in production
• User engagement increased by 40%

🚀 **Next Week's Goals:**
• Finalize landing page with Spline 3D integration
• Complete comprehensive testing suite
• Prepare for beta release

Please let me know if you have any questions or concerns.

Best regards,
ZenBox AI Team`;
      } else if (actionLower.includes('follow-up')) {
        recipients = ['client@example.com'];
        subject = 'Follow-up: ZenBox AI Demo Session';
        body = `Hi [Client Name],

Thank you for taking the time to review our ZenBox AI demo yesterday. I wanted to follow up on our discussion and address any questions you might have.

🔍 **Key Points Discussed:**
• AI-powered productivity automation
• Google Workspace integration capabilities
• Custom workflow creation
• Enterprise security features

📋 **Next Steps:**
• Schedule a technical deep-dive session
• Provide custom demo with your use cases
• Discuss implementation timeline

I'm available for a call this week to discuss how ZenBox AI can specifically benefit your organization.

Looking forward to hearing from you!

Best regards,
[Your Name]`;
      } else if (actionLower.includes('thank')) {
        recipients = ['team@company.com'];
        subject = 'Thank You - Outstanding Work on ZenBox AI!';
        body = `Dear Team,

I wanted to take a moment to express my sincere gratitude for your exceptional work on the ZenBox AI project.

🌟 **Your Amazing Contributions:**
• Innovative problem-solving and creative solutions
• Dedication to quality and attention to detail
• Collaborative spirit and team support
• Going above and beyond project expectations

The success of our AI-powered productivity platform is a direct result of your hard work, expertise, and commitment to excellence.

🎉 **Celebrating Our Success:**
• Successfully launched all core features
• Exceeded performance benchmarks
• Received outstanding user feedback
• Built a truly revolutionary product

Thank you for making ZenBox AI a reality. I'm proud to work with such a talented and dedicated team!

With appreciation,
[Your Name]`;
      } else {
        recipients = ['recipient@example.com'];
        subject = 'Important Update from ZenBox AI';
        body = `Hi there,

I hope this email finds you well. I wanted to reach out regarding our ZenBox AI platform.

Our AI-powered productivity companion is designed to streamline your workflow and boost efficiency across all your favorite tools.

Key features include:
• Unified search across 50+ tools
• Intelligent action automation
• Real-time Google Workspace integration
• Smart task management

Would you be interested in learning more about how ZenBox AI can transform your productivity?

Best regards,
ZenBox AI Team`;
      }

      return {
        type: 'email',
        action,
        data: { recipients, subject, body }
      };
    }

    if (actionLower.includes('meeting') || actionLower.includes('schedule') || actionLower.includes('calendar')) {
      const isMeetAction = actionLower.includes('meet') || actionLower.includes('video');
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      // Generate rich demo data based on meeting type
      let title: string = '';
      let attendees: string[] = [];
      let location: string = '';
      let description: string = '';
      let duration: number = 60;
      let time: string = '14:00';
      let date: string = tomorrow.toISOString().split('T')[0];

      if (actionLower.includes('standup')) {
        title = 'Daily Team Standup - ZenBox AI';
        attendees = ['dev-team@company.com', 'product@company.com', 'design@company.com'];
        location = isMeetAction ? 'Google Meet (Auto-generated)' : 'Conference Room A';
        time = '09:00';
        duration = 30;
        description = `Daily standup meeting for ZenBox AI development team.

📋 **Agenda:**
• What did you accomplish yesterday?
• What will you work on today?
• Are there any blockers or impediments?

🎯 **Current Sprint Goals:**
• Complete action preview functionality
• Integrate Google API connections
• Finalize landing page design
• Prepare for beta testing

⏰ **Meeting Guidelines:**
• Keep updates brief and focused
• Raise blockers for team discussion
• Follow up on action items from previous standup

Join us to sync up on progress and plan the day ahead!`;
      } else if (actionLower.includes('client')) {
        title = 'ZenBox AI - Client Presentation & Demo';
        attendees = ['client@example.com', 'sales@company.com', 'product@company.com'];
        location = isMeetAction ? 'Google Meet (Auto-generated)' : 'Executive Conference Room';
        time = '15:00';
        duration = 90;
        date = nextWeek.toISOString().split('T')[0];
        description = `Comprehensive presentation and live demonstration of ZenBox AI platform for prospective client.

🎯 **Presentation Outline:**
• Company introduction and vision
• ZenBox AI platform overview
• Live demo of key features
• Integration capabilities showcase
• Pricing and implementation timeline

💡 **Demo Highlights:**
• Global search across 50+ tools
• AI-powered action automation
• Real-time Google Workspace integration
• Custom workflow creation
• Enterprise security features

📊 **Expected Outcomes:**
• Client understanding of platform value
• Technical requirements discussion
• Next steps and timeline planning
• Potential partnership opportunities

Please come prepared with questions and use cases specific to the client's needs.`;
      } else if (actionLower.includes('team')) {
        title = 'Weekly Team Meeting - ZenBox AI Project';
        attendees = ['engineering@company.com', 'product@company.com', 'design@company.com', 'qa@company.com'];
        location = isMeetAction ? 'Google Meet (Auto-generated)' : 'Main Conference Room';
        time = '14:00';
        duration = 60;
        description = `Weekly team meeting to review progress, discuss challenges, and plan upcoming work.

📈 **This Week's Review:**
• Sprint progress and completed features
• Performance metrics and user feedback
• Technical challenges and solutions
• Quality assurance updates

🎯 **Planning & Discussion:**
• Next sprint planning and priorities
• Resource allocation and timeline
• Cross-team collaboration opportunities
• Risk assessment and mitigation

🚀 **Upcoming Milestones:**
• Beta release preparation
• User testing coordination
• Documentation updates
• Marketing material preparation

Come prepared to share updates from your area and discuss any blockers or support needed.`;
      } else {
        title = 'ZenBox AI Strategy Meeting';
        attendees = ['leadership@company.com', 'product@company.com'];
        location = isMeetAction ? 'Google Meet (Auto-generated)' : 'Executive Boardroom';
        time = '16:00';
        duration = 90;
        description = `Strategic planning meeting to discuss ZenBox AI roadmap and business objectives.

🎯 **Key Discussion Points:**
• Product roadmap and feature prioritization
• Market positioning and competitive analysis
• User acquisition and retention strategies
• Technical architecture and scalability

📊 **Business Metrics Review:**
• User engagement and adoption rates
• Performance benchmarks and KPIs
• Revenue projections and growth targets
• Customer feedback and satisfaction scores

🚀 **Strategic Initiatives:**
• Partnership opportunities
• Integration ecosystem expansion
• AI capabilities enhancement
• Enterprise market penetration

This meeting will help align our strategic direction and ensure we're building the right product for our target market.`;
      }

      return {
        type: isMeetAction ? 'meeting' : 'calendar',
        action,
        data: {
          title,
          date,
          time,
          duration,
          attendees,
          location,
          description,
          includeMeet: isMeetAction
        }
      };
    }

    if (actionLower.includes('jira') || actionLower.includes('task') || actionLower.includes('issue') || actionLower.includes('bug')) {
      // Generate rich demo data for Jira operations
      let projectKey: string = 'ZEN';
      let issueType: string = 'Task';
      let summary: string = '';
      let priority: string = 'Medium';
      let assignee: string = 'current-user@company.com';
      let labels: string[] = [];
      let description: string = '';

      if (actionLower.includes('task') || actionLower.includes('feature')) {
        issueType = 'Task';
        if (actionLower.includes('api') || actionLower.includes('integration')) {
          summary = 'Implement API Integration for ZenBox AI';
          priority = 'High';
          labels = ['api', 'integration', 'backend'];
          description = `**User Story:**
As a developer, I want to implement a robust API integration system so that ZenBox AI can seamlessly connect with external services.

**Acceptance Criteria:**
• Design and implement RESTful API endpoints
• Add proper authentication and authorization
• Implement rate limiting and error handling
• Create comprehensive API documentation
• Add unit and integration tests

**Technical Requirements:**
• Use FastAPI framework for backend
• Implement OAuth 2.0 for authentication
• Add request/response validation
• Include proper logging and monitoring

**Definition of Done:**
• All API endpoints are functional and tested
• Documentation is complete and up-to-date
• Code review is completed
• Integration tests pass
• Performance benchmarks are met`;
        } else if (actionLower.includes('ui') || actionLower.includes('interface')) {
          summary = 'Enhance User Interface for Global Search';
          priority = 'Medium';
          labels = ['ui', 'frontend', 'react'];
          description = `**User Story:**
As a user, I want an improved global search interface so that I can find and execute actions more efficiently.

**Acceptance Criteria:**
• Redesign search interface with modern UI components
• Add real-time search suggestions
• Implement action previews
• Add keyboard shortcuts for power users
• Ensure responsive design for all devices

**Design Requirements:**
• Follow existing design system
• Maintain accessibility standards
• Optimize for performance
• Include loading states and animations

**Definition of Done:**
• UI components are implemented and tested
• Design review is approved
• Accessibility audit passes
• Performance metrics are within targets
• User testing feedback is incorporated`;
        } else {
          summary = 'Create New Feature for ZenBox AI Platform';
          priority = 'Medium';
          labels = ['feature', 'enhancement'];
          description = `**User Story:**
As a product manager, I want to implement a new feature that enhances user productivity and engagement.

**Acceptance Criteria:**
• Research and define feature requirements
• Create technical specification
• Implement feature with proper testing
• Update documentation and user guides
• Monitor feature adoption and performance

**Technical Considerations:**
• Ensure scalability and performance
• Maintain code quality standards
• Follow security best practices
• Include proper error handling

**Definition of Done:**
• Feature is fully implemented and tested
• Documentation is updated
• Code review is completed
• Feature flags are configured
• Monitoring and analytics are in place`;
        }
      } else if (actionLower.includes('bug') || actionLower.includes('issue') || actionLower.includes('fix')) {
        issueType = 'Bug';
        priority = 'High';
        if (actionLower.includes('login') || actionLower.includes('auth')) {
          summary = 'Fix Authentication Login Issue';
          labels = ['bug', 'authentication', 'critical'];
          description = `**Bug Description:**
Users are experiencing login failures when attempting to authenticate with Google OAuth.

**Steps to Reproduce:**
1. Navigate to login page
2. Click "Sign in with Google"
3. Complete Google OAuth flow
4. Observe error message on redirect

**Expected Behavior:**
User should be successfully authenticated and redirected to dashboard.

**Actual Behavior:**
Error message appears: "Authentication failed. Please try again."

**Environment:**
• Browser: Chrome 120.0.6099.109
• OS: macOS 14.2.1
• Application Version: 1.2.3

**Additional Information:**
• Issue affects approximately 15% of users
• Started occurring after recent OAuth library update
• Workaround: Clear browser cache and cookies

**Priority Justification:**
This is blocking user access to the platform and affecting user experience.`;
        } else if (actionLower.includes('search') || actionLower.includes('query')) {
          summary = 'Fix Search Results Not Loading';
          labels = ['bug', 'search', 'frontend'];
          description = `**Bug Description:**
Search results are not loading properly when users perform global searches.

**Steps to Reproduce:**
1. Enter search query in global search bar
2. Press Enter or click search button
3. Observe loading spinner continues indefinitely
4. No results are displayed

**Expected Behavior:**
Search results should load within 2-3 seconds and display relevant items.

**Actual Behavior:**
Loading spinner continues indefinitely with no results shown.

**Environment:**
• Browser: Multiple browsers affected
• Network: Both fast and slow connections
• Application Version: 1.2.3

**Technical Details:**
• API endpoint returns 200 status
• Frontend state management issue suspected
• Console shows no JavaScript errors

**Impact:**
Core functionality is broken, affecting all users' ability to search.`;
        } else {
          summary = 'Fix Critical Application Bug';
          labels = ['bug', 'critical'];
          description = `**Bug Description:**
A critical bug has been identified that affects core application functionality.

**Steps to Reproduce:**
1. Perform specific user action
2. Observe unexpected behavior
3. Check application logs for errors

**Expected Behavior:**
Application should function as designed without errors.

**Actual Behavior:**
Unexpected behavior occurs, potentially affecting user experience.

**Environment:**
• Multiple environments affected
• Various user configurations
• Application Version: Latest

**Priority Justification:**
This bug affects core functionality and needs immediate attention.

**Next Steps:**
• Investigate root cause
• Implement fix with proper testing
• Deploy to production with monitoring`;
        }
      }

      return {
        type: 'jira',
        action,
        data: {
          projectKey,
          issueType,
          summary,
          priority,
          assignee,
          labels,
          description
        }
      };
    }

    if (actionLower.includes('slack') || actionLower.includes('channel') || actionLower.includes('message')) {
      // Generate rich demo data for Slack operations
      let channel: string = '';
      let message: string = '';
      let channelType: 'public' | 'private' = 'public';
      let members: string[] = [];

      if (actionLower.includes('channel') || actionLower.includes('create')) {
        if (actionLower.includes('project')) {
          channel = 'zenbox-ai-project';
          channelType = 'public';
          members = ['dev-team@company.com', 'product@company.com', 'design@company.com'];
          message = `🚀 **Welcome to the ZenBox AI Project Channel!**

This channel is dedicated to all discussions, updates, and collaboration related to the ZenBox AI project.

📋 **Channel Purpose:**
• Project updates and announcements
• Technical discussions and problem-solving
• Sprint planning and retrospectives
• Resource sharing and documentation

👥 **Team Members:**
• Development Team
• Product Management
• Design Team
• QA Engineers

🎯 **Guidelines:**
• Keep discussions project-related
• Use threads for detailed technical discussions
• Share relevant links and resources
• Tag @here for urgent announcements only

Let's build something amazing together! 💪`;
        } else if (actionLower.includes('team')) {
          channel = 'team-general';
          channelType = 'public';
          members = ['all-team@company.com'];
          message = `👋 **Welcome to the Team General Channel!**

This is our main communication hub for team-wide announcements and general discussions.

🎯 **What to expect here:**
• Company announcements
• Team celebrations and achievements
• General discussions and water cooler chat
• Resource sharing and tips

📢 **Communication Guidelines:**
• Be respectful and inclusive
• Keep it professional but friendly
• Use appropriate channels for specific topics
• Have fun and get to know your teammates!

Looking forward to great conversations! 🌟`;
        } else {
          channel = 'new-project-channel';
          channelType = 'public';
          members = ['team@company.com'];
          message = `🎉 **New Project Channel Created!**

Welcome to our new project collaboration space.

This channel will be used for:
• Project coordination and updates
• Team discussions and brainstorming
• Resource sharing and documentation
• Progress tracking and milestones

Let's make this project a success! 🚀`;
        }
      } else if (actionLower.includes('message') || actionLower.includes('send') || actionLower.includes('update')) {
        if (actionLower.includes('development') || actionLower.includes('dev')) {
          channel = 'development';
          message = `🔧 **Development Update - ZenBox AI**

Hey team! Here's the latest update on our development progress:

✅ **Completed This Sprint:**
• Global search interface with action previews
• Jira and Slack integration APIs
• Enhanced error handling and fallback mechanisms
• Comprehensive testing suite updates

🚧 **Currently Working On:**
• Performance optimization for large datasets
• Mobile responsive design improvements
• Advanced search filters and sorting
• Real-time collaboration features

🎯 **Next Sprint Goals:**
• Complete beta testing phase
• Implement user feedback
• Prepare for production deployment
• Documentation updates

💡 **Technical Highlights:**
• Reduced search response time by 40%
• Improved API reliability to 99.9%
• Added comprehensive logging and monitoring

Questions or concerns? Drop them in the thread! 👇`;
        } else if (actionLower.includes('standup') || actionLower.includes('daily')) {
          channel = 'daily-standup';
          message = `📅 **Daily Standup Reminder**

Good morning team! 🌅

Our daily standup is starting in 15 minutes. Please be ready to share:

🎯 **What you accomplished yesterday**
🚀 **What you're working on today**
🚧 **Any blockers or challenges**

📍 **Meeting Details:**
• Time: 9:00 AM
• Location: Conference Room A / Google Meet
• Duration: 15 minutes max

💡 **Quick Updates:**
• Sprint progress: 75% complete
• No critical blockers reported
• Demo prep scheduled for Friday

See you all there! Let's make today productive! 💪`;
        } else {
          channel = 'general';
          message = `📢 **Team Update**

Hi everyone! 👋

Just wanted to share a quick update with the team:

🎉 **Great News:**
• Project milestones are on track
• Team collaboration has been excellent
• Client feedback has been very positive

🎯 **Focus Areas:**
• Continue maintaining high quality standards
• Keep communication open and transparent
• Support each other when challenges arise

💪 **Team Appreciation:**
Thank you all for your hard work and dedication. Your efforts are making a real difference!

Have a great day! ☀️`;
        }
      }

      return {
        type: 'slack',
        action,
        data: {
          channel,
          message,
          channelType,
          members
        }
      };
    }

    return {
      type: 'other',
      action,
      data: {}
    };
  };

  // Helper function to update action result
  const updateActionResult = (actionId: string, status: ActionResult['status'], result?: string) => {
    setActionResults(prev =>
      prev.map(action =>
        action.id === actionId
          ? {
              ...action,
              status,
              result,
              timestamp: new Date().toLocaleTimeString()
            }
          : action
      )
    );
  };

  // Helper function to execute real actions through Test-Agents backend
  const executeRealAction = async (action: string, actionId: string, previewData?: ActionPreviewData) => {
    try {
      let agentRequest: AgentExecuteRequest;
      let parameters: any = {};

      // Extract parameters from preview data
      if (previewData?.data) {
        if (previewData.type === 'email') {
          parameters = {
            recipients: previewData.data.recipients,
            subject: previewData.data.subject,
            body: previewData.data.body,
          };
        } else if (previewData.type === 'calendar' || previewData.type === 'meeting') {
          parameters = {
            title: previewData.data.title,
            date: previewData.data.date,
            time: previewData.data.time,
            duration: previewData.data.duration,
            attendees: previewData.data.attendees,
            location: previewData.data.location,
            description: previewData.data.description,
            includeMeet: previewData.data.includeMeet,
          };
        }
      }

      // Determine which agent to use based on action
      if (action.toLowerCase().includes('email') || action.toLowerCase().includes('send') || action.toLowerCase().includes('compose')) {
        agentRequest = {
          query: action,
          agent: 'gmail',
          parameters,
        };
      } else if (action.toLowerCase().includes('calendar') || action.toLowerCase().includes('meeting') || action.toLowerCase().includes('schedule')) {
        agentRequest = {
          query: action,
          agent: 'calendar',
          parameters,
        };
      } else if (action.toLowerCase().includes('meet') || action.toLowerCase().includes('video')) {
        agentRequest = {
          query: action,
          agent: 'calendar', // Meet integration is handled through calendar
          parameters: { ...parameters, includeMeet: true },
        };
      } else if (action.toLowerCase().includes('briefing') || action.toLowerCase().includes('daily')) {
        agentRequest = {
          query: action,
          agent: 'orchestrator',
          parameters,
        };
      } else {
        // Use orchestrator for complex actions
        agentRequest = {
          query: action,
          agent: 'orchestrator',
          parameters,
        };
      }

      console.log('🚀 Executing API call with parameters:', agentRequest);
      setIsExecutingAction(true);
      updateActionResult(actionId, 'executing');

      const response = await testAgentsService.executeAction(agentRequest);

      if (response.success) {
        console.log('✅ API call successful:', response);
        const result = response.result?.response || response.result?.finalResponse || 'Action completed successfully';
        setCurrentExecutionResult(result);
        updateActionResult(actionId, 'completed', result);
      } else {
        console.log('❌ API call failed:', response);
        const error = response.error || 'Action failed';
        setCurrentExecutionResult(error);
        updateActionResult(actionId, 'failed', error);
      }

      setIsExecutingAction(false);
    } catch (error) {
      console.error('Error executing real action:', error);
      updateActionResult(actionId, 'failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsAnalyzing(true);
    setAiAnalysis(null);

    try {
      // Analyze query with OpenAI
      const analysis = await openaiService.analyzeQuery(query);
      setAiAnalysis(analysis);

      if (analysis.isValid) {
        // Show AI analysis view for valid queries
        setCurrentView('ai-analysis');
      } else {
        // For invalid queries, show regular search results
        setCurrentView('results');
      }
    } catch (error) {
      console.error('Error analyzing query:', error);

      // Create a fallback analysis for testing
      const fallbackAnalysis: OpenAIAnalysisResult = {
        isValid: true,
        taskType: query.toLowerCase().includes('email') ? 'email' :
                 query.toLowerCase().includes('calendar') || query.toLowerCase().includes('meeting') ? 'meeting' : 'general',
        summary: `Fallback analysis for: ${query}`,
        confidence: 85,
        originalQuery: query,
        suggestedActions: [
          'Execute the requested task',
          'Review and modify details',
          'Save for later execution'
        ],
        executionSteps: [
          'Analyze the request',
          'Generate preview if needed',
          'Execute the task',
          'Confirm completion'
        ]
      };

      setAiAnalysis(fallbackAnalysis);
      setCurrentView('ai-analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAction = async (action: string) => {
    console.log('🎯 Action clicked:', action);
    setCurrentAction(action);

    // Start the preview generation animation
    setIsGeneratingPreview(true);
    setShowPreview(false);
    setPreviewData(null);

    // Simulate AI thinking/generation delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generate preview data for the action
    const preview = generatePreviewData(action);

    // Set preview data and start fade-in animation
    setPreviewData(preview);
    setIsGeneratingPreview(false);

    // Small delay then show preview with fade-in
    setTimeout(() => {
      setShowPreview(true);
    }, 100);
  };

  const handlePreviewProceed = async (updatedPreviewData: ActionPreviewData) => {
    console.log('✅ Proceeding with action (with editing):', updatedPreviewData);
    executeActionWithData(updatedPreviewData);
  };

  const handlePreviewProceedDirect = async (previewData: ActionPreviewData) => {
    console.log('⚡ Proceeding directly with action:', previewData);
    executeActionWithData(previewData);
  };

  const executeActionWithData = async (actionData: ActionPreviewData) => {
    setPreviewData(null); // Clear preview
    setCurrentView('action');

    // Add action to results
    const newAction: ActionResult = {
      id: Date.now().toString(),
      action: actionData.action,
      status: 'pending',
      description: `Executing: ${actionData.action}`,
      timestamp: new Date().toLocaleTimeString()
    };

    setActionResults(prev => [newAction, ...prev]);

    // If backend is available, execute real action
    if (isBackendAvailable) {
      try {
        await executeRealAction(actionData.action, newAction.id, actionData);
      } catch (error) {
        console.error('Failed to execute real action:', error);
        // Fall back to demo mode for this action
        updateActionResult(newAction.id, 'failed', `Failed to execute: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      // Demo mode - simulate API call
      await executeDemoAction(actionData.action, newAction.id, actionData);
    }
  };

  const handlePreviewCancel = () => {
    console.log('❌ Action preview cancelled');
    setPreviewData(null);
    setShowPreview(false);
    setIsGeneratingPreview(false);
    // Stay on current view, just hide preview
  };

  const handleActionComplete = () => {
    console.log('🏠 Action completed, returning to home');

    // Update the action status to completed
    setActionResults(prev =>
      prev.map(action =>
        action.action === currentAction
          ? {
              ...action,
              status: 'completed' as const,
              result: currentExecutionResult || getActionResult(currentAction),
              timestamp: new Date().toLocaleTimeString()
            }
          : action
      )
    );

    // Clean up state and return to home
    setCurrentView('home');
    setPreviewData(null);
    setCurrentAction('');
    setCurrentExecutionResult(null);
    setIsExecutingAction(false);
  };

  const handleActionRetry = () => {
    console.log('🔄 Retrying action, returning to home for new attempt');

    // Clean up state and return to home for retry
    setCurrentView('home');
    setPreviewData(null);
    setCurrentAction('');
    setCurrentExecutionResult(null);
    setIsExecutingAction(false);

    // Optionally, you could regenerate the preview for the same action
    // const preview = generatePreviewData(currentAction);
    // setPreviewData(preview);
  };

  // AI Assistant handlers
  const handleAIExecute = (action: string) => {
    // Use the original query for execution, not the suggested action
    const queryToExecute = aiAnalysis?.originalQuery || action;

    // Use the existing handleAction function which handles preview generation
    // and the complete execution flow
    handleAction(queryToExecute);
  };

  const handleAIRefine = () => {
    setCurrentView('home');
    setAiAnalysis(null);
  };

  const getActionResult = (action: string): string => {
    if (action.toLowerCase().includes('create task')) {
      return 'Task "Intro Me! to new team members" created successfully in Project Board. Assigned to: You. Due date: Next Friday.';
    }
    if (action.toLowerCase().includes('send email') || action.toLowerCase().includes('email summary')) {
      return 'Email sent successfully to 5 recipients. Subject: "Project Update Summary". Delivery confirmed.';
    }
    if (action.toLowerCase().includes('schedule') || action.toLowerCase().includes('meeting')) {
      return 'Meeting "Team Standup" scheduled for tomorrow at 9:00 AM. Google Meet link created. 8 attendees invited.';
    }
    return 'Action completed successfully!';
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return (
          <GlobalSearchInterface
            onSearch={handleSearch}
            onAction={handleAction}
            previewData={previewData}
            onPreviewProceed={handlePreviewProceed}
            onPreviewProceedDirect={handlePreviewProceedDirect}
            onPreviewCancel={handlePreviewCancel}
            isGeneratingPreview={isGeneratingPreview}
            showPreview={showPreview}
          />
        );
      case 'results':
        return (
          <SearchResults
            query={searchQuery}
            actions={actionResults}
            onActionExecute={handleAction}
          />
        );
      case 'ai-analysis':
        return (
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
              <button
                onClick={() => setCurrentView('home')}
                className="text-muted-foreground hover:text-foreground flex items-center gap-2 mb-4"
              >
                ← Back to Search
              </button>
              <h1 className="text-2xl font-bold mb-2">AI Analysis Results</h1>
              <p className="text-muted-foreground">
                Query: "{searchQuery}"
              </p>
            </div>

            {aiAnalysis && (
              <AIAssistantSummary
                analysis={aiAnalysis}
                onExecute={handleAIExecute}
                onRefine={handleAIRefine}
                isLoading={isExecutingAction || isGeneratingPreview}
                previewData={previewData}
                showPreview={showPreview}
                onPreviewProceed={handlePreviewProceed}
                onPreviewProceedDirect={handlePreviewProceedDirect}
                onPreviewCancel={handlePreviewCancel}
                isGeneratingPreview={isGeneratingPreview}
              />
            )}
          </div>
        );
      case 'action':
        return (
          <ActionExecutionFlow
            action={currentAction}
            onComplete={handleActionComplete}
            onRetry={handleActionRetry}
            useBackend={isBackendAvailable}
            backendAvailable={isBackendAvailable}
          />
        );
      default:
        return (
          <GlobalSearchInterface
            onSearch={handleSearch}
            onAction={handleAction}
            previewData={previewData}
            onPreviewProceed={handlePreviewProceed}
            onPreviewProceedDirect={handlePreviewProceedDirect}
            onPreviewCancel={handlePreviewCancel}
            isGeneratingPreview={isGeneratingPreview}
            showPreview={showPreview}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Glowing Border */}
      <div className="fixed inset-0 pointer-events-none z-[9999]">
        {/* Top Border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-purple-500/20">
          <div className="relative w-32 h-3 animate-[slide-right_3s_linear_infinite]">
            {/* Thin edges, thick center gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-40"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-1 bg-gradient-to-r from-purple-400 via-purple-300 to-blue-400 shadow-lg shadow-purple-500/60"
                 style={{ filter: 'blur(0.5px)' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-0.5 bg-white/80 shadow-sm shadow-white/50"></div>
          </div>
        </div>

        {/* Right Border */}
        <div className="absolute top-0 right-0 w-1 h-full bg-blue-500/20">
          <div className="relative w-3 h-32 animate-[slide-down_3s_linear_infinite_0.75s]">
            {/* Thin edges, thick center gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-40"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-16 bg-gradient-to-b from-blue-400 via-blue-300 to-purple-400 shadow-lg shadow-blue-500/60"
                 style={{ filter: 'blur(0.5px)' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 bg-white/80 shadow-sm shadow-white/50"></div>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-500/20">
          <div className="relative w-32 h-3 ml-auto animate-[slide-left_3s_linear_infinite_1.5s]">
            {/* Thin edges, thick center gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-40"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-1 bg-gradient-to-r from-blue-400 via-purple-300 to-purple-400 shadow-lg shadow-purple-500/60"
                 style={{ filter: 'blur(0.5px)' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-0.5 bg-white/80 shadow-sm shadow-white/50"></div>
          </div>
        </div>

        {/* Left Border */}
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20">
          <div className="relative w-3 h-32 mt-auto animate-[slide-up_3s_linear_infinite_2.25s]">
            {/* Thin edges, thick center gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-40"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-16 bg-gradient-to-b from-purple-400 via-blue-300 to-blue-400 shadow-lg shadow-blue-500/60"
                 style={{ filter: 'blur(0.5px)' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 bg-white/80 shadow-sm shadow-white/50"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {renderCurrentView()}
      </div>
    </div>
  );
};
