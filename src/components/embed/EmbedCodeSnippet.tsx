import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmbedCodeSnippetProps {
  apiKey: string;
}

export function EmbedCodeSnippet({ apiKey }: EmbedCodeSnippetProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const scriptSnippet = `<!-- Chat Widget -->
<script>
  (function() {
    var w = document.createElement('script');
    w.src = '${supabaseUrl}/functions/v1/widget-loader';
    w.setAttribute('data-widget-key', '${apiKey}');
    w.async = true;
    document.head.appendChild(w);
  })();
</script>`;

  // Use the published app URL for iframe embeds (not the preview domain)
  const publishedOrigin = `https://a6222f723-220e-4d71-be2f-81b1e94028d1.lovable.app`;

  const iframeSnippet = `<!-- Chat Widget (iframe) -->
<!-- Replace the URL below with your custom domain if you have one -->
<iframe
  src="${publishedOrigin}/widget?key=${apiKey}"
  style="position:fixed;bottom:0;right:0;width:400px;height:600px;border:none;z-index:9999;"
  allow="microphone"
></iframe>`;

  const copy = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Script Tag (recommended)</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copy(scriptSnippet, "script")}
            className="h-7 gap-1.5 text-xs"
          >
            {copied === "script" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied === "script" ? "Copied!" : "Copy"}
          </Button>
        </div>
        <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          {scriptSnippet}
        </pre>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Iframe Embed</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copy(iframeSnippet, "iframe")}
            className="h-7 gap-1.5 text-xs"
          >
            {copied === "iframe" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied === "iframe" ? "Copied!" : "Copy"}
          </Button>
        </div>
        <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          {iframeSnippet}
        </pre>
      </div>
    </div>
  );
}
