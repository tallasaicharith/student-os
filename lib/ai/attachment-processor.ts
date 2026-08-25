export interface AttachmentFile {
  name: string;
  type?: string;
  size?: string;
  content?: string; // Text / base64 content
}

export class AttachmentProcessor {
  /**
   * Processes attachments and extracts human-readable context for AI prompt injection
   */
  static processAttachments(attachments?: AttachmentFile[]): string {
    if (!attachments || attachments.length === 0) return "";

    const blocks = attachments.map((file, idx) => {
      const fileName = file.name;
      const fileContent = file.content || "";

      if (fileContent.trim()) {
        return `--- ATTACHMENT #${idx + 1}: ${fileName} ---\n${fileContent}\n--- END ATTACHMENT ---`;
      }

      return `--- ATTACHMENT #${idx + 1}: ${fileName} (Attached file) ---`;
    });

    return `\n\n## UPLOADED ATTACHMENTS CONTEXT:\n${blocks.join("\n\n")}`;
  }
}
