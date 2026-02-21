import Vapi from "@vapi-ai/web";

let vapiInstance: Vapi | null = null;

/**
 * Create a completely fresh Vapi client, destroying any previous one.
 * Use this at the start of every new call session.
 */
export function createFreshVapiClient(publicKey: string): Vapi {
  // Tear down any existing instance first
  if (vapiInstance) {
    try {
      vapiInstance.stop();
    } catch {
      // ignore – may not be in a call
    }
    try {
      vapiInstance.removeAllListeners();
    } catch {
      // ignore – older SDK versions may not support this
    }
    vapiInstance = null;
  }

  // Use our edge function as a proxy to avoid Lovable preview fetch interception
  // and to keep the VAPI_API_KEY server-side
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const apiBaseUrl = supabaseUrl ? `${supabaseUrl}/functions/v1/vapi-proxy` : undefined;
  console.log("[vapi-client] Creating fresh Vapi instance, apiBaseUrl:", apiBaseUrl);
  vapiInstance = new Vapi(publicKey, apiBaseUrl);
  return vapiInstance;
}

/**
 * Get the current singleton (only useful for stopping an active call).
 */
export function getVapiClient(): Vapi | null {
  return vapiInstance;
}

/**
 * Fully tear down the current Vapi instance.
 */
export function resetVapiClient(): void {
  if (vapiInstance) {
    console.log("[vapi-client] Resetting Vapi instance");
    try {
      vapiInstance.stop();
    } catch {
      // ignore
    }
    try {
      vapiInstance.removeAllListeners();
    } catch {
      // ignore
    }
    vapiInstance = null;
  }
}

export function stopVapiCall(): void {
  if (vapiInstance) {
    console.log("[vapi-client] Stopping active call");
    vapiInstance.stop();
  }
}
