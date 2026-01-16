import { useState } from "react";
import { Send, Phone, MessageSquare, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  recipient: string;
  smtpFrom: string;
  message: string;
  status: "sent" | "pending" | "failed";
  timestamp: Date;
}

interface SMSComposerProps {
  onMessageSent: (message: Message) => void;
}

const SMSComposer = ({ onMessageSent }: SMSComposerProps) => {
  const [recipient, setRecipient] = useState("");
  const [smtpFrom, setSmtpFrom] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!recipient || !message) {
      toast({
        title: "Missing fields",
        description: "Please fill in recipient and message",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newMessage: Message = {
      id: Date.now().toString(),
      recipient,
      smtpFrom: smtpFrom || "system@gateway.local",
      message,
      status: Math.random() > 0.1 ? "sent" : "failed",
      timestamp: new Date(),
    };

    onMessageSent(newMessage);

    if (newMessage.status === "sent") {
      toast({
        title: "Message sent",
        description: `SMS delivered to ${recipient}`,
      });
      setRecipient("");
      setMessage("");
    } else {
      toast({
        title: "Delivery failed",
        description: "Message could not be delivered",
        variant: "destructive",
      });
    }

    setIsSending(false);
  };

  return (
    <div className="glass-card p-6 slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Send className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Compose SMS</h2>
          <p className="text-xs text-muted-foreground">
            Send SMS via SMTP gateway
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* SMTP From */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Mail className="w-4 h-4" />
            SMTP From (optional)
          </label>
          <Input
            type="email"
            placeholder="sender@domain.com"
            value={smtpFrom}
            onChange={(e) => setSmtpFrom(e.target.value)}
            className="glass-input bg-input border-border focus:border-primary focus:ring-primary/20"
          />
        </div>

        {/* Recipient */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Recipient Phone Number
          </label>
          <Input
            type="tel"
            placeholder="+1 234 567 8900"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="glass-input bg-input border-border focus:border-primary focus:ring-primary/20 font-mono"
          />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Message Content
          </label>
          <Textarea
            placeholder="Enter your SMS message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="glass-input bg-input border-border focus:border-primary focus:ring-primary/20 min-h-[120px] resize-none"
            maxLength={160}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Standard SMS limit</span>
            <span className={message.length > 140 ? "text-warning" : ""}>
              {message.length}/160
            </span>
          </div>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={isSending || !recipient || !message}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
        >
          {isSending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Send SMS
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SMSComposer;
