import { Clock, CheckCircle, XCircle, AlertCircle, Phone, Inbox, Users, Code, FileText } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  recipients: string[];
  smtpFrom: string;
  message: string;
  messageType: "text" | "html";
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
      className: "bg-foreground/10 text-foreground",
    },
    pending: {
      icon: AlertCircle,
      label: "Pending",
      className: "bg-muted text-muted-foreground",
    },
    failed: {
      icon: XCircle,
      label: "Failed",
      className: "bg-destructive/10 text-destructive",
    },
  };

  const { icon: Icon, label, className } = config[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      <Icon className="w-3 h-3" />
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
};

const MessageHistory = ({ messages }: MessageHistoryProps) => {
  const totalRecipients = messages.reduce((acc, m) => acc + m.recipients.length, 0);

  return (
    <div className="glass-card p-4 sm:p-6 slide-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              Message History
            </h2>
            <p className="text-xs text-muted-foreground">
              {totalRecipients} total recipients
            </p>
          </div>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">No messages yet</p>
          <p className="text-muted-foreground/60 text-xs mt-1">
            Sent messages will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="p-3 sm:p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-border transition-colors fade-in"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2 sm:mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  {msg.recipients.length > 1 ? (
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground shrink-0" />
                  ) : (
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground shrink-0" />
                  )}
                  <span className="text-xs sm:text-sm font-medium text-foreground font-mono truncate">
                    {msg.recipients.length > 1 
                      ? `${msg.recipients.length} recipients` 
                      : msg.recipients[0]}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium ${
                    msg.messageType === "html" 
                      ? "bg-secondary text-secondary-foreground" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {msg.messageType === "html" ? <Code className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                    <span className="hidden sm:inline">{msg.messageType.toUpperCase()}</span>
                  </span>
                  <StatusBadge status={msg.status} />
                </div>
              </div>

              {msg.recipients.length > 1 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {msg.recipients.slice(0, 3).map((r, i) => (
                    <span key={i} className="text-xs font-mono text-muted-foreground bg-muted/50 px-1.5 sm:px-2 py-0.5 rounded truncate max-w-[100px] sm:max-w-none">
                      {r}
                    </span>
                  ))}
                  {msg.recipients.length > 3 && (
                    <span className="text-xs text-muted-foreground bg-muted/50 px-1.5 sm:px-2 py-0.5 rounded">
                      +{msg.recipients.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2">
                {msg.message}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground/70">
                <span className="font-mono truncate max-w-[150px] sm:max-w-none">{msg.smtpFrom}</span>
                <span className="shrink-0">{format(msg.timestamp, "HH:mm:ss")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageHistory;
