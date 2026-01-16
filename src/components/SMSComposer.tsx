import { useState, useRef } from "react";
import { Send, Phone, MessageSquare, Mail, Loader2, Users, Code, FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [singleRecipient, setSingleRecipient] = useState("");
  const [bulkRecipients, setBulkRecipients] = useState("");
  const [uploadedNumbers, setUploadedNumbers] = useState<string[]>([]);
  const [smtpFrom, setSmtpFrom] = useState("");
  const [message, setMessage] = useState("");
  const [isHtml, setIsHtml] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inputMode, setInputMode] = useState<"single" | "bulk" | "csv">("single");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseRecipients = (input: string): string[] => {
    return input
      .split(/[,\n;]+/)
      .map((r) => r.trim())
      .filter((r) => r.length > 0);
  };

  const getAllRecipients = (): string[] => {
    switch (inputMode) {
      case "single":
        return singleRecipient.trim() ? [singleRecipient.trim()] : [];
      case "bulk":
        return parseRecipients(bulkRecipients);
      case "csv":
        return uploadedNumbers;
      default:
        return [];
    }
  };

  const recipientList = getAllRecipients();
  const recipientCount = recipientList.length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/[\r\n]+/).filter(line => line.trim());
      
      // Parse CSV - assume first column contains phone numbers
      const numbers: string[] = [];
      lines.forEach((line, index) => {
        // Skip header row if it looks like a header
        if (index === 0 && /phone|number|mobile|cell/i.test(line)) return;
        
        const columns = line.split(',');
        const number = columns[0]?.trim();
        if (number && /^[\d\s\+\-\(\)]+$/.test(number)) {
          numbers.push(number.replace(/[\s\-\(\)]/g, ''));
        }
      });

      if (numbers.length === 0) {
        toast({
          title: "No valid numbers found",
          description: "CSV should contain phone numbers in the first column",
          variant: "destructive",
        });
        return;
      }

      setUploadedNumbers(numbers);
      toast({
        title: "File uploaded",
        description: `${numbers.length} phone number${numbers.length > 1 ? 's' : ''} loaded`,
      });
    };
    reader.readAsText(file);
  };

  const clearUploadedNumbers = () => {
    setUploadedNumbers([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (recipientCount === 0 || !message) {
      toast({
        title: "Missing fields",
        description: "Please add recipient(s) and message",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    // Simulate API call with slight delay per recipient
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.min(recipientCount * 100, 2000)));

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
      setSingleRecipient("");
      setBulkRecipients("");
      setUploadedNumbers([]);
      setMessage("");
      if (fileInputRef.current) fileInputRef.current.value = '';
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
    <div className="glass-card p-4 sm:p-6 slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-foreground/5 border border-border flex items-center justify-center shrink-0">
            <Send className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Compose SMS</h2>
            <p className="text-xs text-muted-foreground">
              SMTP → SMS Gateway
            </p>
          </div>
        </div>
        
        {/* Message Type Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-secondary/50 self-start sm:self-auto">
          <FileText className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${!isHtml ? "text-foreground" : "text-muted-foreground"}`} />
          <Switch
            id="message-type"
            checked={isHtml}
            onCheckedChange={setIsHtml}
            className="scale-90 sm:scale-100"
          />
          <Code className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isHtml ? "text-foreground" : "text-muted-foreground"}`} />
        </div>
      </div>

      <div className="space-y-4">
        {/* SMTP From */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            SMTP From (optional)
          </label>
          <Input
            type="email"
            placeholder="sender@domain.com"
            value={smtpFrom}
            onChange={(e) => setSmtpFrom(e.target.value)}
            className="glass-input bg-input border-border focus:border-foreground focus:ring-foreground/20 text-sm"
          />
        </div>

        {/* Recipients - Tabbed Interface */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Recipients
          </label>
          
          <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "single" | "bulk" | "csv")}>
            <TabsList className="grid w-full grid-cols-3 h-9">
              <TabsTrigger value="single" className="text-xs sm:text-sm">Single</TabsTrigger>
              <TabsTrigger value="bulk" className="text-xs sm:text-sm">Bulk</TabsTrigger>
              <TabsTrigger value="csv" className="text-xs sm:text-sm">CSV Upload</TabsTrigger>
            </TabsList>
            
            <TabsContent value="single" className="mt-3">
              <Input
                type="tel"
                placeholder="+1 234 567 8900"
                value={singleRecipient}
                onChange={(e) => setSingleRecipient(e.target.value)}
                className="glass-input bg-input border-border focus:border-foreground focus:ring-foreground/20 font-mono text-sm"
              />
            </TabsContent>
            
            <TabsContent value="bulk" className="mt-3">
              <Textarea
                placeholder={`+1 234 567 8900\n+1 987 654 3210\n+44 20 7946 0958\n\nSeparate with new lines, commas, or semicolons`}
                value={bulkRecipients}
                onChange={(e) => setBulkRecipients(e.target.value)}
                className="glass-input bg-input border-border focus:border-foreground focus:ring-foreground/20 min-h-[100px] resize-none font-mono text-sm"
              />
            </TabsContent>
            
            <TabsContent value="csv" className="mt-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {uploadedNumbers.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-foreground/50 transition-colors"
                >
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Click to upload CSV file
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Phone numbers in first column
                  </p>
                </div>
              ) : (
                <div className="border border-border rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs sm:text-sm font-medium text-foreground">
                      {uploadedNumbers.length} numbers loaded
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearUploadedNumbers}
                      className="h-7 px-2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto">
                    {uploadedNumbers.slice(0, 10).map((num, i) => (
                      <span key={i} className="text-xs font-mono bg-muted/50 px-2 py-1 rounded">
                        {num}
                      </span>
                    ))}
                    {uploadedNumbers.length > 10 && (
                      <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                        +{uploadedNumbers.length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3 h-3" />
              {inputMode === "csv" ? "CSV upload" : inputMode === "bulk" ? "Bulk entry" : "Single number"}
            </span>
            <span className={recipientCount > 0 ? "text-foreground font-medium" : ""}>
              {recipientCount} recipient{recipientCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Message Content ({isHtml ? "HTML" : "Plain Text"})
          </label>
          <Textarea
            placeholder={isHtml 
              ? "<p>Hello <b>World</b>!</p>\n<p>Your HTML message here...</p>" 
              : "Enter your SMS message..."
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`glass-input bg-input border-border focus:border-foreground focus:ring-foreground/20 min-h-[100px] sm:min-h-[140px] resize-none text-sm ${isHtml ? "font-mono" : ""}`}
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
          disabled={isSending || recipientCount === 0 || !message}
          className="w-full h-10 sm:h-12 btn-primary text-sm sm:text-base"
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
              Sending to {recipientCount} recipient{recipientCount !== 1 ? "s" : ""}...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Send {recipientCount > 1 ? `${recipientCount} Messages` : "SMS"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SMSComposer;
