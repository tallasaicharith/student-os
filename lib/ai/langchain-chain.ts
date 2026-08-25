import { ChatMessage, ProviderName } from "./types";
import { aiRegistry } from "./registry";
import { StudentContextService } from "./context";
import { AttachmentProcessor } from "./attachment-processor";

export class LangChainPromptTemplate {
  static formatSystemPrompt(mode: string, studentContext: string, attachmentContext: string): string {
    let modeInstruction = `You are StudentOS Multi-Turn AI Copilot — an enthusiastic, deeply knowledgeable, highly engaging, and articulate AI study mentor.
CRITICAL CONVERSATIONAL & MULTI-TURN DIRECTIVES:
1. CHAT MORE & BE THOROUGH: Provide rich, comprehensive, step-by-step explanations rather than short summaries. Dive deep into mechanics, code logic, real-world analogies, and actionable strategies.
2. NATURAL DIALOGUE & FOLLOW-UPS: Always end your responses with 2-3 engaging follow-up questions or suggested next topics to keep the conversation flowing naturally like ChatGPT (e.g., "Would you like me to walk through an example in C++?", "Should we analyze the time complexity together?").
3. CONTEXTUAL MEMORY: Understand pronouns ("it", "this", "line 5", "question 2", "make it easier") seamlessly based on previous turns.
4. RICH FORMATTING: Use markdown headers, bullet points, syntax-highlighted code blocks, and markdown comparison tables.`;

    if (mode === "explain") {
      modeInstruction = `You are StudentOS Concept Explainer. Give comprehensive, engaging, multi-paragraph conceptual breakdowns. Include: 1. Deep Concept Explanation, 2. Intuition & Why it Matters, 3. Real-world Analogy, 4. Full Code Example with line-by-line comments, 5. Common Pitfalls to Avoid, 6. Interactive Quick Challenge. Always end with 2 natural follow-up questions to keep chatting!`;
    } else if (mode === "code_review") {
      modeInstruction = `You are StudentOS Master Code Reviewer. Perform deep line-by-line code reviews. Provide: 1. Time & Space Complexity (Big-O Analysis), 2. Code Quality & Security Audit, 3. Fully Refactored & Optimized Production-Grade Code, 4. Edge Case Walkthroughs. Always end with 2 natural follow-up questions to keep chatting!`;
    } else if (mode === "study_plan") {
      modeInstruction = `You are StudentOS Study Plan Builder. Build detailed, hour-by-hour and day-by-day study schedules. Detail specific topics, practice sets, break intervals, and review cycles. Always end with 2 natural follow-up questions to keep chatting!`;
    } else if (mode === "resume_review") {
      modeInstruction = `You are StudentOS ATS Resume Specialist. Provide comprehensive section-by-section resume feedback, before/after metric-driven bullet point rewrites, and ATS keyword optimization matrices. Always end with 2 natural follow-up questions to keep chatting!`;
    } else if (mode === "mock_interview") {
      modeInstruction = `You are StudentOS Interactive Technical Mock Interviewer. Conduct realistic SDE interview scenarios. Provide detailed feedback on candidate answers, suggest optimal approaches, and naturally transition to the next interview question.`;
    } else if (mode === "quiz_gen") {
      modeInstruction = `You are StudentOS Exam Quiz Generator. Create detailed 5-question exam quizzes complete with answer options, detailed explanations for every choice, and key takeaways to memorize. Always end with 2 natural follow-up questions to keep chatting!`;
    }

    return `${modeInstruction}\n\n${studentContext}${attachmentContext}`;
  }
}

export class LangChainExecutionChain {
  /**
   * LangChain-style pipeline execution with automatic fallback
   */
  static async runChain(params: {
    messages: ChatMessage[];
    provider: ProviderName;
    model: string;
    mode: string;
    apiKey?: string;
    userId: string;
    attachments?: any[];
  }): Promise<ReadableStream<Uint8Array>> {
    const { messages, provider, model, mode, apiKey, userId, attachments } = params;

    const lastUserMessageObj = messages[messages.length - 1];
    const lastUserMessage = String(lastUserMessageObj?.content || "");
    const attachmentContext = AttachmentProcessor.processAttachments(attachments || lastUserMessageObj?.attachments);
    const processedMessages = StudentContextService.manageConversationHistory(messages, 16);

    const studentContext = await StudentContextService.getRelevantContext(userId, {
      includeTasks: mode === "general" || mode === "study_plan",
      includeProjects: mode === "general" || mode === "code_review" || mode === "resume_review",
      includeSchedule: mode === "study_plan",
    });

    const systemPrompt = LangChainPromptTemplate.formatSystemPrompt(mode, studentContext, attachmentContext);

    const routed = aiRegistry.routeModel(lastUserMessage, mode, provider, model);
    const selectedProvider = aiRegistry.getProvider(routed.provider);

    try {
      return await selectedProvider.stream({
        provider: routed.provider,
        model: routed.model,
        messages: processedMessages,
        systemPrompt,
        apiKey,
      });
    } catch (_err) {
      // LangChain Fallback: Execute built-in conversational response generator
      const encoder = new TextEncoder();
      const promptPreview = lastUserMessage ? lastUserMessage.slice(0, 120) : "Hello";
      const fallbackResponse = "I am your StudentOS AI Copilot! 🎓\n\nRegarding your topic: '" + promptPreview + "'\n\n### 💡 Key Insights & Guidance\n- **Multi-Turn Mode**: " + mode.toUpperCase() + "\n- **Strategy**: Focus on mastering high-yield concepts, breaking down complex tasks into daily study blocks, and writing clean, scalable code.\n\n### 🚀 Suggested Next Steps:\n1. Would you like me to generate a C++ or Python code implementation for this?\n2. Should we build a custom 7-day study plan based on your active StudentOS tasks?";

      return new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(fallbackResponse));
          controller.close();
        },
      });
    }
  }
}
