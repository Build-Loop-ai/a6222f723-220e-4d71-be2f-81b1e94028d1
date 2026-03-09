

# Fix: Widget Chat Returns Empty AI Response

## Problem
The AI model (`google/gemini-3-flash-preview`) occasionally returns an empty response (0 completion tokens) for simple messages like "hi". The client sees `content: ""` in the SSE delta, `fullText` stays empty, and the fallback "I'm sorry, I couldn't generate a response" appears.

## Root Cause
The network response confirms `completion_tokens: 0` with `finish_reason: "stop"`. The model returned nothing. This appears to be intermittent model behavior.

## Fix (in `supabase/functions/widget-chat/index.ts`)

**Add a non-streaming fallback retry when the streamed response is empty.** In the `flush()` callback of the TransformStream, if `fullResponse` is empty after the stream completes, make a second non-streaming call to the AI gateway and enqueue that response as a final SSE chunk.

Specifically:
1. In the `flush()` method, check if `fullResponse` is empty
2. If empty, call the AI gateway again without `stream: true`
3. Extract the response content and enqueue it as an SSE `data:` line followed by `data: [DONE]`
4. Save the fallback response to `chat_messages`

This ensures the client always receives actual content, even if the first streaming attempt returns empty.

