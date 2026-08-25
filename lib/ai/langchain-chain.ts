import { ChatMessage, ProviderName } from "./types";
import { aiRegistry } from "./registry";
import { StudentContextService } from "./context";
import { AttachmentProcessor } from "./attachment-processor";

export class LangChainPromptTemplate {
  static formatSystemPrompt(mode: string, studentContext: string, attachmentContext: string): string {
    let modeInstruction = `You are Google Gemini 2.5 Flash — a helpful, intelligent, highly engaging AI assistant developed by Google.
CRITICAL DIRECTIVES:
1. Identify yourself as Google Gemini 2.5 Flash when asked.
2. Provide rich, detailed, step-by-step responses with clear formatting, code snippets, and Markdown tables where helpful.
3. Keep the conversation interactive and answer all user questions accurately.`;

    if (mode === "explain") {
      modeInstruction = `You are Google Gemini 2.5 Flash Concept Explainer. Give comprehensive, engaging conceptual breakdowns with examples, analogies, and code.`;
    } else if (mode === "code_review") {
      modeInstruction = `You are Google Gemini 2.5 Flash Master Code Reviewer. Perform deep line-by-line code reviews with Big-O complexity analysis and refactored code.`;
    } else if (mode === "study_plan") {
      modeInstruction = `You are Google Gemini 2.5 Flash Study Plan Builder. Build detailed study schedules with timetables.`;
    } else if (mode === "resume_review") {
      modeInstruction = `You are Google Gemini 2.5 Flash ATS Resume Specialist. Provide metric-driven bullet point rewrites and ATS optimization tips.`;
    }

    return `${modeInstruction}\n\n${studentContext}${attachmentContext}`;
  }
}

export class LangChainExecutionChain {
  /**
   * Direct 100% Stream Execution via Google AI Studio Gemini API
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
    const { messages, mode, apiKey, userId, attachments } = params;

    const lastUserMessageObj = messages[messages.length - 1];
    const lastUserMessage: string = String(lastUserMessageObj?.content || "");
    const attachmentContext = AttachmentProcessor.processAttachments(attachments || lastUserMessageObj?.attachments);
    const processedMessages = StudentContextService.manageConversationHistory(messages, 16);

    const studentContext = await StudentContextService.getRelevantContext(userId, {
      includeTasks: mode === "general" || mode === "study_plan",
      includeProjects: mode === "general" || mode === "code_review" || mode === "resume_review",
      includeSchedule: mode === "study_plan",
    });

    const systemPrompt = LangChainPromptTemplate.formatSystemPrompt(mode, studentContext, attachmentContext);
    const selectedProvider = aiRegistry.getProvider("gemini");

    // Direct streaming call to Google AI Studio API - 100% Live Gemini Responses!
    return await selectedProvider.stream({
      provider: "gemini",
      model: "gemini-2.5-flash",
      messages: processedMessages,
      systemPrompt,
      apiKey,
    });
  }
}
