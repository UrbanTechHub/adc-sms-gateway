import { useState } from "react";
import { Activity, Send, CheckCircle, XCircle, LogOut, Users, MessageSquare } from "lucide-react";
import SMSComposer from "./SMSComposer";
import MessageHistory from "./MessageHistory";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  recipients: string[];
  message: string;
  status: "sent" | "pending" | "failed";
  timestamp: Date;
}

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleMessageSent = (message: Message) => {
    setMessages((prev) => [message, ...prev]);
  };

  const stats = {
    batches: messages.length,
    delivered: messages.filter((m) => m.status === "sent").reduce((acc, m) => acc + m.recipients.length, 0),
    failed: messages.filter((m) => m.status === "failed").reduce((acc, m) => acc + m.recipients.length, 0),
    totalRecipients: messages.reduce((acc, m) => acc + m.recipients.length, 0),
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6 sm:mb-8 slide-up">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-foreground/5 border border-border flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground tracking-tight">
                SMS Gateway
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                Twilio • Bulk Enabled
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-muted-foreground hover:text-foreground hover:bg-muted text-xs sm:text-sm"
          >
            <LogOut className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Exit</span>
          </Button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="glass-card p-3 sm:p-4 slide-up" style={{ animationDelay: "0.05s" }}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-foreground/5 flex items-center justify-center shrink-0">
                <Send className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.batches}</p>
                <p className="text-xs text-muted-foreground">Batches</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-3 sm:p-4 slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-foreground/5 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.totalRecipients}</p>
                <p className="text-xs text-muted-foreground">Recipients</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-3 sm:p-4 slide-up" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-foreground/10 flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.delivered}</p>
                <p className="text-xs text-muted-foreground">Delivered</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-3 sm:p-4 slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.failed}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          <SMSComposer onMessageSent={handleMessageSent} />
          <MessageHistory messages={messages} />
        </div>

        {/* Footer */}
        <footer className="mt-8 sm:mt-12 text-center slide-up" style={{ animationDelay: "0.25s" }}>
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-muted/30 border border-border/50">
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground animate-pulse" />
            <span className="text-xs text-muted-foreground font-mono">
              Twilio Gateway: Operational
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
