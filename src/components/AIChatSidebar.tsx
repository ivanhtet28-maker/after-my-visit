import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDemoMode } from "@/hooks/useDemoMode";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_CHAT_MESSAGES } from "@/data/demoData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, X, Sparkles, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const contextualText: Record<string, string> = {
  "/dashboard": "Ask me anything about your health visits",
  "/visits": "Ask about your past visits",
  "/actions": "Ask about your action items and follow-ups",
  "/medications": "Ask about your medications",
  "/settings": "Ask me anything about AfterVisit",
};

const suggestedQuestions = [
  "What should I ask my doctor next time?",
  "Explain my medications in simple terms",
  "What are my upcoming action items?",
];

const AIChatSidebar = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { isDemoMode } = useDemoMode();

  const isVisitDetail = location.pathname.startsWith("/visit/") && location.pathname !== "/visit/new";
  const visitId = isVisitDetail ? location.pathname.split("/visit/")[1] : undefined;

  const contextText = isVisitDetail
    ? "Ask about this visit"
    : contextualText[location.pathname] || "Ask me anything about your health";

  const contextType = isVisitDetail ? "visit_summary" : (
    location.pathname === "/dashboard" || location.pathname === "/visits" || location.pathname === "/actions" || location.pathname === "/medications"
      ? "patient_record"
      : "general"
  );

  // Pre-populate demo chat messages
  useEffect(() => {
    if (isDemoMode && visitId === "demo-visit-1" && !demoLoaded) {
      const demoMsgs = DEMO_CHAT_MESSAGES.filter((m) => m.visit_id === "demo-visit-1").map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      setMessages(demoMsgs);
      setDemoLoaded(true);
    }
  }, [isDemoMode, visitId, demoLoaded]);

  // Reset when navigating away
  useEffect(() => {
    setDemoLoaded(false);
    setMessages([]);
  }, [location.pathname]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    if (isDemoMode) {
      await new Promise((r) => setTimeout(r, 1500));
      const reply: Message = {
        role: "assistant",
        content: "This is a demo. In the full version, AfterVisit AI will answer based on your actual visit transcript and medical context.",
      };
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
      return;
    }

    if (!user) { setIsTyping(false); return; }

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { visit_id: visitId, user_id: user.id, message: text, context_type: contextType },
      });
      if (error) throw error;
      const reply: Message = {
        role: "assistant",
        content: data?.response || "I'm sorry, I couldn't generate a response. Please try again.",
      };
      setMessages((prev) => [...prev, reply]);
    } catch {
      const reply: Message = {
        role: "assistant",
        content: "That's a great question! Based on your visit history, I'd recommend discussing this with your doctor at your next appointment.",
      };
      setMessages((prev) => [...prev, reply]);
    }
    setIsTyping(false);
  };

  if (isMobile) {
    return (
      <>
        {!open && (
          <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg transition-transform hover:scale-105" aria-label="Open AI Chat">
            <MessageSquare className="h-6 w-6 text-primary-foreground" />
          </button>
        )}
        {open && (
          <div className="fixed inset-0 z-50 flex flex-col bg-card">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-semibold text-card-foreground">AfterVisit AI</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}><X className="h-5 w-5" /></Button>
            </div>
            <p className="border-b px-4 py-2 text-sm text-muted-foreground">{contextText}</p>
            <ChatBody messages={messages} isTyping={isTyping} scrollRef={scrollRef} suggestedQuestions={suggestedQuestions} onSuggest={sendMessage} />
            <ChatInput input={input} setInput={setInput} onSend={() => sendMessage(input)} />
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} className="fixed right-0 top-1/2 z-40 -translate-y-1/2 rounded-l-lg border border-r-0 bg-card px-1.5 py-4 shadow-card transition-colors hover:bg-muted" aria-label="Open AI Chat">
          <ChevronRight className="h-4 w-4 rotate-180 text-muted-foreground" />
          <MessageSquare className="mt-2 h-4 w-4 text-primary" />
        </button>
      )}
      <div className={`fixed right-0 top-0 z-40 flex h-full w-80 flex-col border-l bg-card shadow-lg transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold text-card-foreground">AfterVisit AI</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}><X className="h-4 w-4" /></Button>
        </div>
        <p className="border-b px-4 py-2 text-sm text-muted-foreground">{contextText}</p>
        <ChatBody messages={messages} isTyping={isTyping} scrollRef={scrollRef} suggestedQuestions={suggestedQuestions} onSuggest={sendMessage} />
        <ChatInput input={input} setInput={setInput} onSend={() => sendMessage(input)} />
      </div>
    </>
  );
};

function ChatBody({ messages, isTyping, scrollRef, suggestedQuestions, onSuggest }: {
  messages: Message[]; isTyping: boolean; scrollRef: React.RefObject<HTMLDivElement>; suggestedQuestions: string[]; onSuggest: (q: string) => void;
}) {
  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef as any}>
      {messages.length === 0 && (
        <div className="space-y-2">
          <p className="mb-3 text-xs font-medium text-muted-foreground">Suggested questions</p>
          {suggestedQuestions.map((q) => (
            <button key={q} onClick={() => onSuggest(q)} className="block w-full rounded-lg border bg-background p-3 text-left text-sm text-card-foreground transition-colors hover:bg-muted">{q}</button>
          ))}
        </div>
      )}
      <div className="space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`rounded-lg p-3 text-sm ${m.role === "user" ? "ml-4 bg-primary/10 text-card-foreground" : "mr-4 bg-muted text-muted-foreground"}`}>{m.content}</div>
        ))}
        {isTyping && (
          <div className="mr-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            <span className="inline-flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
            </span>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

function ChatInput({ input, setInput, onSend }: { input: string; setInput: (v: string) => void; onSend: () => void }) {
  return (
    <div className="border-t p-3">
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything..." onKeyDown={(e) => e.key === "Enter" && onSend()} />
        <Button size="icon" onClick={onSend}><Send className="h-4 w-4" /></Button>
      </div>
      <p className="mt-2 text-center text-[10px] text-muted-foreground">AfterVisit does not provide medical advice.</p>
    </div>
  );
}

export default AIChatSidebar;
