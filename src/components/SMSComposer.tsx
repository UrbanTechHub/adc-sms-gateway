import { useState, useRef } from "react";
import { Send, Phone, MessageSquare, Loader2, Users, Upload, X, Image, Paperclip } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  id: string;
  recipients: string[];
  message: string;
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
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [inputMode, setInputMode] = useState<"single" | "bulk" | "csv">("single");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

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

      const numbers: string[] = [];
      lines.forEach((line, index) => {
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

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, GIF, or WebP image",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be under 5MB",
        variant: "destructive",
      });
      return;
    }

    setMediaFile(file);
    const url = URL.createObjectURL(file);
    setMediaPreview(url);
  };

  const clearMedia = () => {
    setMediaFile(null);
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaPreview(null);
    if (mediaInputRef.current) mediaInputRef.current.value = '';
  };

  const uploadMedia = async (): Promise<string | null> => {
    if (!mediaFile) return null;
    setIsUploadingMedia(true);
    try {
      const ext = mediaFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const { error } = await supabase.storage
        .from('mms-media')
        .upload(fileName, mediaFile, { contentType: mediaFile.type });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('mms-media')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (err: any) {
      toast({
        title: "Image upload failed",
        description: err.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploadingMedia(false);
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

    try {
      // Upload media if attached
      let mediaUrl: string | null = null;
      if (mediaFile) {
        mediaUrl = await uploadMedia();
        if (!mediaUrl) {
          setIsSending(false);
          return;
        }
      }

      const { data, error } = await supabase.functions.invoke("send-sms", {
        body: { recipients: recipientList, message, ...(mediaUrl && { mediaUrl }) },
      });

      if (error) throw new Error(error.message);

      const status = data.failed === 0 ? "sent" : data.sent === 0 ? "failed" : "sent";

      const newMessage: Message = {
        id: Date.now().toString(),
        recipients: recipientList,
        message,
        status,
        timestamp: new Date(),
      };

      onMessageSent(newMessage);

      if (data.sent > 0) {
        toast({
          title: "Messages sent",
          description: `${data.sent} of ${data.total} ${mediaUrl ? 'MMS' : 'SMS'} delivered via Twilio`,
        });
        setSingleRecipient("");
        setBulkRecipients("");
        setUploadedNumbers([]);
        setMessage("");
        clearMedia();
        if (fileInputRef.current) fileInputRef.current.value = '';
      }

      if (data.failed > 0) {
        const failedNumbers = data.results
          ?.filter((r: any) => r.status === "failed")
          .map((r: any) => `${r.to}: ${r.error}`)
          .join(", ");
        toast({
          title: `${data.failed} message${data.failed > 1 ? "s" : ""} failed`,
          description: failedNumbers || "Some messages could not be delivered",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Send failed",
        description: err.message || "Could not reach the SMS gateway",
        variant: "destructive",
      });

      const newMessage: Message = {
        id: Date.now().toString(),
        recipients: recipientList,
        message,
        status: "failed",
        timestamp: new Date(),
      };
      onMessageSent(newMessage);
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
              Send via Twilio
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Recipients */}
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
            Message
          </label>
          <Textarea
            placeholder={mediaFile ? "Enter your MMS message..." : "Enter your SMS message..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="glass-input bg-input border-border focus:border-foreground focus:ring-foreground/20 min-h-[100px] sm:min-h-[140px] resize-none text-sm"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{mediaFile ? "MMS (no char limit)" : "Standard SMS (160 char limit)"}</span>
            <span className={!mediaFile && message.length > 140 ? "text-destructive" : ""}>
              {message.length}{!mediaFile && "/160"}
            </span>
          </div>
        </div>

        {/* Media Attachment */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Image className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Image Attachment
            <span className="text-xs text-muted-foreground/60">(optional – sends as MMS)</span>
          </label>

          <input
            ref={mediaInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleMediaSelect}
            className="hidden"
          />

          {!mediaFile ? (
            <div
              onClick={() => mediaInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-foreground/50 transition-colors"
            >
              <Paperclip className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                Click to attach an image
              </p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                JPG, PNG, GIF, WebP · Max 5MB
              </p>
            </div>
          ) : (
            <div className="border border-border rounded-lg p-3 flex items-center gap-3">
              {mediaPreview && (
                <img
                  src={mediaPreview}
                  alt="Attachment preview"
                  className="w-16 h-16 object-cover rounded-md border border-border"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{mediaFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(mediaFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearMedia}
                className="h-7 px-2 text-muted-foreground hover:text-foreground shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={isSending || isUploadingMedia || recipientCount === 0 || !message}
          className="w-full h-10 sm:h-12 btn-primary text-sm sm:text-base"
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
              {isUploadingMedia ? "Uploading image..." : `Sending to ${recipientCount} recipient${recipientCount !== 1 ? "s" : ""}...`}
            </>
          ) : (
            <>
              <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Send {recipientCount > 1 ? `${recipientCount} ` : ""}{mediaFile ? "MMS" : "SMS"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SMSComposer;
