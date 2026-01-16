import { Clock, CheckCircle, XCircle, AlertCircle, Phone, Inbox } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  recipient: string;
  smtpFrom: string;
  message: string;
  status: "sent" | "pending" | "failed";
  timestamp: Date;
}

interface MessageHistoryProps {
  messages: Message[];
}

const StatusBadge = ({ status }: { status: Message["status"] }) => {
  const config = {
    sent: {
      icon: CheckCircle,
      label: "Delivered",
      className: "status-sent",
    },
    pending: {
      icon: AlertCircle,
      label: "Pending",
      className: "status-pending",
    },
    failed: {
      icon: XCircle,
      label: "Failed",
      className: "status-failed",
    },
  };

  const { icon: Icon, label, className } = config[status];

  return (
    <span className={`status-badge ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

const MessageHistory = ({ messages }: MessageHistoryProps) => {
  return (
    <div className="glass-card p-6 slide-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center">
          <Clock className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Message History
          </h2>
          <p className="text-xs text-muted-foreground">
            Recent SMS transmissions
          </p>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">No messages yet</p>
          <p className="text-muted-foreground/60 text-xs mt-1">
            Sent messages will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-border transition-colors fade-in"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="font-mono">{msg.recipient}</span>
                </div>
                <StatusBadge status={msg.status} />
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {msg.message}
              </p>

              <div className="flex items-center justify-between text-xs text-muted-foreground/70">
                <span className="font-mono">{msg.smtpFrom}</span>
                <span>{format(msg.timestamp, "HH:mm:ss")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: hsl(var(--muted));
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
    </div>
  );
};

export default MessageHistory;
