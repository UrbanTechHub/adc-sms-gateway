import { useState } from "react";
import { Activity, Zap, Send, CheckCircle, XCircle, LogOut, Users, Mail } from "lucide-react";
import SMSComposer from "./SMSComposer";
import MessageHistory from "./MessageHistory";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  recipients: string[];
  smtpFrom: string;
  message: string;
  messageType: "text" | "html";
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
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 slide-up">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-foreground/5 border border-border flex items-center justify-center">
              <Mail className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                SMTP → SMS
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                Gateway v2.0 • Bulk Enabled
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Exit
          </Button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4 slide-up" style={{ animationDelay: "0.05s" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
                <Send className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.batches}</p>
                <p className="text-xs text-muted-foreground">Batches</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
                <Users className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalRecipients}</p>
                <p className="text-xs text-muted-foreground">Recipients</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 slide-up" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-foreground/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.delivered}</p>
                <p className="text-xs text-muted-foreground">Delivered</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.failed}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          <SMSComposer onMessageSent={handleMessageSent} />
          <MessageHistory messages={messages} />
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center slide-up" style={{ animationDelay: "0.25s" }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30 border border-border/50">
            <Activity className="w-4 h-4 text-foreground animate-pulse" />
            <span className="text-xs text-muted-foreground font-mono">
              Gateway Status: Operational
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
