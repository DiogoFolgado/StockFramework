import Anthropic from "@anthropic-ai/sdk";

export async function generateEpisodeSummary(
  episodeName: string,
  description: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return ""; // key not configured — caller will leave aiSummary null

  // Create the client inside the function so the key is always read at call-time,
  // not at module-load time (avoids stale capture during hot-reloads).
  const client = new Anthropic({ apiKey });

  const trimmed = description.replace(/<[^>]*>/g, "").slice(0, 2000);
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: `Summarise this podcast episode in 2–3 sentences. Be factual and concise. No filler phrases like "In this episode" or "The hosts discuss".

Episode: ${episodeName}
Description: ${trimmed}`,
      },
    ],
  });
  const block = response.content[0];
  return block?.type === "text" ? block.text.trim() : "";
}
