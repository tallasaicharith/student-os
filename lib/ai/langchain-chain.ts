import { ChatMessage, ProviderName } from "./types";
import { aiRegistry } from "./registry";
import { StudentContextService } from "./context";
import { AttachmentProcessor } from "./attachment-processor";

export class LangChainPromptTemplate {
  static formatSystemPrompt(mode: string, studentContext: string, attachmentContext: string): string {
    let modeInstruction = `You are StudentOS Multi-Turn AI Copilot.
CRITICAL MULTI-TURN INSTRUCTION:
- You are in a continuous, natural multi-turn conversation with the student.
- Understand pronouns ("it", "this", "that"), code references ("line 5", "the previous code"), and follow-up requests ("make it simpler", "give an example", "convert to Python", "question 2") seamlessly based on prior history.
- Answer directly, accurately, and thoroughly with clear markdown tables and syntax-highlighted code blocks.`;

    if (mode === "explain") {
      modeInstruction = `You are StudentOS Concept Explainer. Structure concept explanations with: 1. Simple Explanation, 2. Intuition, 3. Real-world Analogy, 4. Code Example, 5. Common Mistakes, 6. Quick Test, 7. Summary. Maintain multi-turn memory.`;
    } else if (mode === "code_review") {
      modeInstruction = `You are StudentOS Code Reviewer. Analyze code for bugs, edge cases, O(N) time/space complexity, and provide corrected clean code. Maintain multi-turn memory.`;
    } else if (mode === "study_plan") {
      modeInstruction = `You are StudentOS Study Plan Builder. Generate structured daily & weekly timetables based on active tasks. Maintain multi-turn memory.`;
    } else if (mode === "resume_review") {
      modeInstruction = `You are StudentOS ATS Resume Reviewer. Provide quantifiable bullet point rewrites and ATS formatting advice. Maintain multi-turn memory.`;
    } else if (mode === "mock_interview") {
      modeInstruction = `You are StudentOS Interactive Mock Interviewer. Ask one question at a time. Evaluate the student's previous answer briefly, provide constructive feedback, and ask the next question.`;
    } else if (mode === "quiz_gen") {
      modeInstruction = `You are StudentOS Exam Quiz Generator. Generate multiple-choice questions with 4 options (A, B, C, D) and explain correct answers at the end. Maintain multi-turn memory.`;
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
    const processedMessages = StudentContextService.manageConversationHistory(messages, 14);

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
      // LangChain Fallback: Execute built-in fallback response generator
      const encoder = new TextEncoder();
      const promptPreview = lastUserMessage ? lastUserMessage.slice(0, 100) : "Hello";
      const fallbackResponse = "I am your StudentOS AI Assistant.\n\nI received your prompt: '" + promptPreview + "'\n\n- Multi-turn dialogue mode: " + mode.toUpperCase() + "\n- Strategy: Stay focused on your active study targets and task goals.\n\nTo connect to Google Gemini 2.0 or OpenAI, set your API key in Settings or click Set API Key in the top header!";

      return new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(fallbackResponse));
          controller.close();
        },
      });
    }
  }
}
