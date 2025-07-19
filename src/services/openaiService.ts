interface OpenAIResponse {
  isValidQuery: boolean;
  summary: string;
  taskType: string;
  confidence: number;
  suggestedActions: string[];
  executionSteps: string[];
}

interface OpenAIAnalysisResult {
  isValid: boolean;
  summary: string;
  taskType: 'email' | 'calendar' | 'search' | 'meeting' | 'document' | 'general' | 'invalid';
  confidence: number;
  suggestedActions: string[];
  executionSteps: string[];
  originalQuery: string;
}

class OpenAIService {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';

  constructor() {
    // You'll need to set your OpenAI API key here
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';

    if (!this.apiKey) {
      console.warn('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your environment variables.');
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async analyzeQuery(query: string): Promise<OpenAIAnalysisResult> {
    if (!this.apiKey) {
      return this.createFallbackResponse(query, 'OpenAI API key not configured');
    }

    if (!query.trim()) {
      return this.createFallbackResponse(query, 'Empty query');
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant that analyzes user queries for a productivity app called ZenBox AI. 
              
              Your task is to:
              1. Determine if the query is a valid, meaningful request (not gibberish or random text)
              2. If valid, categorize the task type and provide a helpful summary
              3. Suggest actionable steps the user can take
              
              Respond ONLY with a valid JSON object in this exact format:
              {
                "isValidQuery": boolean,
                "summary": "Brief, helpful summary of what the user wants to do",
                "taskType": "email|calendar|search|meeting|document|general|invalid",
                "confidence": number (0-100),
                "suggestedActions": ["action1", "action2", "action3"],
                "executionSteps": ["step1", "step2", "step3"]
              }
              
              Task types:
              - email: Sending, reading, or managing emails
              - calendar: Scheduling, viewing, or managing calendar events
              - search: Finding information, documents, or data
              - meeting: Creating or managing meetings (Google Meet, Zoom, etc.)
              - document: Creating, editing, or managing documents
              - general: Other productivity tasks
              - invalid: Gibberish, random text, or unclear requests
              
              If the query seems like random text, gibberish, or completely unclear, set isValidQuery to false.`
            },
            {
              role: 'user',
              content: query
            }
          ],
          max_tokens: 500,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response content from OpenAI');
      }

      // Parse the JSON response
      const aiResponse: OpenAIResponse = JSON.parse(content);

      return {
        isValid: aiResponse.isValidQuery,
        summary: aiResponse.summary,
        taskType: aiResponse.taskType as any,
        confidence: aiResponse.confidence,
        suggestedActions: aiResponse.suggestedActions || [],
        executionSteps: aiResponse.executionSteps || [],
        originalQuery: query
      };

    } catch (error) {
      console.error('OpenAI analysis error:', error);
      
      // Fallback to basic keyword analysis
      return this.performBasicAnalysis(query);
    }
  }

  private createFallbackResponse(query: string, reason: string): OpenAIAnalysisResult {
    // For testing purposes, create a valid analysis even without API key
    const queryLower = query.toLowerCase();
    const taskType = queryLower.includes('email') ? 'email' :
                    queryLower.includes('calendar') || queryLower.includes('meeting') ? 'meeting' :
                    queryLower.includes('search') ? 'search' : 'general';

    return {
      isValid: true, // Changed to true for testing
      summary: `Local analysis: This appears to be a ${taskType} task. ${reason}`,
      taskType,
      confidence: 75,
      suggestedActions: [
        'Execute the requested task',
        'Review and modify details before execution',
        'Save for later execution'
      ],
      executionSteps: [
        'Parse the request',
        'Generate preview if applicable',
        'Execute the task',
        'Confirm completion'
      ],
      originalQuery: query
    };
  }

  private performBasicAnalysis(query: string): OpenAIAnalysisResult {
    const lowerQuery = query.toLowerCase().trim();
    
    // Check if it's likely gibberish
    const gibberishPatterns = [
      /^[a-z]{1,3}$/i, // Very short random letters
      /^[0-9]+$/, // Only numbers
      /^[^a-zA-Z0-9\s]+$/, // Only special characters
      /(.)\1{4,}/, // Repeated characters
    ];

    const isGibberish = gibberishPatterns.some(pattern => pattern.test(lowerQuery));
    
    if (isGibberish || lowerQuery.length < 3) {
      return {
        isValid: false,
        summary: 'Query appears to be invalid or too short',
        taskType: 'invalid',
        confidence: 0,
        suggestedActions: [],
        executionSteps: [],
        originalQuery: query
      };
    }

    // Basic keyword analysis
    const emailKeywords = ['email', 'send', 'mail', 'message', '@'];
    const calendarKeywords = ['schedule', 'meeting', 'calendar', 'appointment', 'event'];
    const searchKeywords = ['search', 'find', 'look', 'show', 'get'];
    const meetingKeywords = ['meet', 'zoom', 'call', 'conference'];

    let taskType: OpenAIAnalysisResult['taskType'] = 'general';
    let confidence = 60;

    if (emailKeywords.some(keyword => lowerQuery.includes(keyword))) {
      taskType = 'email';
      confidence = 70;
    } else if (calendarKeywords.some(keyword => lowerQuery.includes(keyword))) {
      taskType = 'calendar';
      confidence = 70;
    } else if (searchKeywords.some(keyword => lowerQuery.includes(keyword))) {
      taskType = 'search';
      confidence = 70;
    } else if (meetingKeywords.some(keyword => lowerQuery.includes(keyword))) {
      taskType = 'meeting';
      confidence = 70;
    }

    return {
      isValid: true,
      summary: `Basic analysis suggests this is a ${taskType} related task`,
      taskType,
      confidence,
      suggestedActions: [`Execute ${taskType} action`, 'Refine your request', 'Try voice input'],
      executionSteps: ['Review the request', 'Confirm details', 'Execute action'],
      originalQuery: query
    };
  }
}

export const openaiService = new OpenAIService();
export type { OpenAIAnalysisResult };
