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
  const totalRecipients = messages.reduce((acc, m) => acc + m.recipients.length, 0);

  return (
    <div className="glass-card p-6 slide-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center">
            <Clock className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Message History
            </h2>
            <p className="text-xs text-muted-foreground">
              {totalRecipients} total recipients
            </p>
          </div>
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
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  {msg.recipients.length > 1 ? (
                    <Users className="w-4 h-4 text-foreground" />
                  ) : (
                    <Phone className="w-4 h-4 text-foreground" />
                  )}
                  <span className="text-sm font-medium text-foreground font-mono">
                    {msg.recipients.length > 1 
                      ? `${msg.recipients.length} recipients` 
                      : msg.recipients[0]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                    msg.messageType === "html" 
                      ? "bg-secondary text-secondary-foreground" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {msg.messageType === "html" ? <Code className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                    {msg.messageType.toUpperCase()}
                  </span>
                  <StatusBadge status={msg.status} />
                </div>
              </div>

              {msg.recipients.length > 1 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {msg.recipients.slice(0, 3).map((r, i) => (
                    <span key={i} className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                      {r}
                    </span>
                  ))}
                  {msg.recipients.length > 3 && (
                    <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                      +{msg.recipients.length - 3} more
                    </span>
                  )}
                </div>
              )}

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
    </div>
  );
};

export default MessageHistory;
