import { useState } from "react";
import { Send, Phone, MessageSquare, Mail, Loader2, Users, Code, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Message {
  id: string;
  recipients: string[];
  smtpFrom: string;
  message: string;
  messageType: "text" | "html";
  status: "sent" | "pending" | "failed";
  timestamp: Date;
}

interface SMSComposerProps {
  onMessageSent: (message: Message) => void;
}

const SMSComposer = ({ onMessageSent }: SMSComposerProps) => {
  const [recipients, setRecipients] = useState("");
  const [smtpFrom, setSmtpFrom] = useState("");
  const [message, setMessage] = useState("");
  const [isHtml, setIsHtml] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const parseRecipients = (input: string): string[] => {
    return input
      .split(/[,\n;]+/)
      .map((r) => r.trim())
      .filter((r) => r.length > 0);
  };

  const recipientList = parseRecipients(recipients);
  const recipientCount = recipientList.length;

  const handleSend = async () => {
    if (!recipients || !message) {
      toast({
        title: "Missing fields",
        description: "Please fill in recipient(s) and message",
        variant: "destructive",
      });
      return;
    }

    if (recipientCount === 0) {
      toast({
        title: "Invalid recipients",
        description: "Please enter valid phone number(s)",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    // Simulate API call with slight delay per recipient
    await new Promise((resolve) => setTimeout(resolve, 800 + recipientCount * 200));

    const newMessage: Message = {
      id: Date.now().toString(),
      recipients: recipientList,
      smtpFrom: smtpFrom || "system@gateway.local",
      message,
      messageType: isHtml ? "html" : "text",
      status: Math.random() > 0.1 ? "sent" : "failed",
      timestamp: new Date(),
    };

    onMessageSent(newMessage);

    if (newMessage.status === "sent") {
      toast({
        title: "Messages sent",
        description: `${recipientCount} SMS${recipientCount > 1 ? "s" : ""} delivered successfully`,
      });
      setRecipients("");
      setMessage("");
    } else {
      toast({
        title: "Delivery failed",
        description: "Some messages could not be delivered",
        variant: "destructive",
      });
    }

    setIsSending(false);
  };

  return (
    <div className="glass-card p-6 slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-foreground/5 border border-border flex items-center justify-center">
            <Send className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Compose SMS</h2>
            <p className="text-xs text-muted-foreground">
              SMTP → SMS Gateway
            </p>
          </div>
        </div>
        
        {/* Message Type Toggle */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/50">
          <FileText className={`w-4 h-4 ${!isHtml ? "text-foreground" : "text-muted-foreground"}`} />
          <Switch
            id="message-type"
            checked={isHtml}
            onCheckedChange={setIsHtml}
          />
          <Code className={`w-4 h-4 ${isHtml ? "text-foreground" : "text-muted-foreground"}`} />
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
            className="glass-input bg-input border-border focus:border-foreground focus:ring-foreground/20"
          />
        </div>

        {/* Recipients - Bulk Support */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Users className="w-4 h-4" />
            Recipients (Bulk Supported)
          </label>
          <Textarea
            placeholder={`+1 234 567 8900\n+1 987 654 3210\n+44 20 7946 0958\n\nSeparate numbers with new lines, commas, or semicolons`}
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            className="glass-input bg-input border-border focus:border-foreground focus:ring-foreground/20 min-h-[100px] resize-none font-mono text-sm"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3 h-3" />
              Bulk SMS supported
            </span>
            <span className={recipientCount > 0 ? "text-foreground" : ""}>
              {recipientCount} recipient{recipientCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Message Content ({isHtml ? "HTML" : "Plain Text"})
          </label>
          <Textarea
            placeholder={isHtml 
              ? "<p>Hello <b>World</b>!</p>\n<p>Your HTML message here...</p>" 
              : "Enter your SMS message..."
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`glass-input bg-input border-border focus:border-foreground focus:ring-foreground/20 min-h-[140px] resize-none ${isHtml ? "font-mono text-sm" : ""}`}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              {isHtml ? <Code className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
              {isHtml ? "HTML mode" : "Standard SMS (160 char limit)"}
            </span>
            {!isHtml && (
              <span className={message.length > 140 ? "text-destructive" : ""}>
                {message.length}/160
              </span>
            )}
          </div>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={isSending || !recipients || !message}
          className="w-full h-12 btn-primary"
        >
          {isSending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Sending to {recipientCount} recipient{recipientCount !== 1 ? "s" : ""}...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Send {recipientCount > 1 ? `${recipientCount} Messages` : "SMS"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SMSComposer;
