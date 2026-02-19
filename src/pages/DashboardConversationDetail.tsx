import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MessageSquare, Mic, Globe, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
  suggested_url: string | null;
}

interface ConversationInfo {
  id: string;
  visitor_id: string;
  channel: string;
  started_at: string;
  ended_at: string | null;
  status: string;
  page_url: string | null;
}

const DashboardConversationDetail = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<ConversationInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!conversationId) return;

      try {
        const [convRes, msgRes] = await Promise.all([
          supabase
            .from("conversations")
            .select("id, visitor_id, channel, started_at, ended_at, status, page_url")
            .eq("id", conversationId)
            .single(),
          supabase
            .from("chat_messages")
            .select("id, role, content, created_at, suggested_url")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true }),
        ]);

        if (convRes.data) setConversation(convRes.data);
        if (msgRes.data) setMessages(msgRes.data);
      } catch (error) {
        console.error("Error fetching conversation:", error);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [conversationId]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Conversation not found</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/dashboard/conversations")}>
          Back to Conversations
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/conversations")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">Visitor {conversation.visitor_id.slice(0, 8)}</h1>
            <Badge variant="secondary" className={cn(
              conversation.status === "active" ? "bg-success/10 text-success" : ""
            )}>
              {conversation.status === "active" ? "Active" : "Ended"}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            {conversation.channel === "voice" ? (
              <span className="flex items-center gap-1"><Mic className="w-3 h-3" /> Voice</span>
            ) : (
              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Text</span>
            )}
            <span>•</span>
            <span>{format(parseISO(conversation.started_at), "PPp")}</span>
            {conversation.page_url && (
              <>
                <span>•</span>
                <a href={conversation.page_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline">
                  <Globe className="w-3 h-3" />
                  {new URL(conversation.page_url).hostname}
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Transcript */}
      <div className="rounded-2xl bg-card border border-border p-6 shadow-card space-y-4">
        <h2 className="text-lg font-semibold mb-4">Transcript</h2>
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">No messages in this conversation</p>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}>
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-foreground"
                )}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  {msg.suggested_url && (
                    <a
                      href={msg.suggested_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "flex items-center gap-1 text-xs mt-2 underline",
                        msg.role === "user" ? "text-primary-foreground/80" : "text-primary"
                      )}
                    >
                      <ExternalLink className="w-3 h-3" />
                      {msg.suggested_url}
                    </a>
                  )}
                  <span className={cn(
                    "text-[10px] mt-1 block",
                    msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"
                  )}>
                    {format(parseISO(msg.created_at), "HH:mm")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardConversationDetail;
