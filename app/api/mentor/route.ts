import { NextRequest } from "next/server";
import { POST as handleAIChat } from "../ai/chat/route";

// Proxy endpoint ensuring backward compatibility for existing callers
export async function POST(req: NextRequest) {
  return handleAIChat(req);
}
