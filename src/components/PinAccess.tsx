import { useState, useRef, useEffect } from "react";
import { Lock, Shield, AlertCircle, Mail } from "lucide-react";

interface PinAccessProps {
  onSuccess: () => void;
}

const CORRECT_PIN = "ADC353";

const PinAccess = ({ onSuccess }: PinAccessProps) => {
  const [pin, setPin] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^[A-Za-z0-9]?$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.toUpperCase();
    setPin(newPin);
    setError(false);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    if (index === 5 && value) {
      const enteredPin = newPin.join("");
      if (enteredPin === CORRECT_PIN) {
        onSuccess();
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setPin(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
        }, 600);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").toUpperCase().slice(0, 6);
    const newPin = [...pin];
    for (let i = 0; i < pastedData.length; i++) {
      if (/^[A-Z0-9]$/.test(pastedData[i])) {
        newPin[i] = pastedData[i];
      }
    }
    setPin(newPin);
    
    const lastFilledIndex = newPin.findIndex((p) => !p);
    const focusIndex = lastFilledIndex === -1 ? 5 : lastFilledIndex;
    inputRefs.current[focusIndex]?.focus();

    if (newPin.every((p) => p)) {
      const enteredPin = newPin.join("");
      if (enteredPin === CORRECT_PIN) {
        onSuccess();
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setPin(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
        }, 600);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 md:p-12 w-full max-w-md slide-up">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-foreground/5 border border-border mb-6">
            <Mail className="w-10 h-10 text-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 tracking-tight">
            SMTP → SMS
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter access PIN to continue
          </p>
        </div>

        {/* PIN Input */}
        <div
          className={`flex justify-center gap-2 md:gap-3 mb-8`}
          style={{
            animation: shake
              ? "shake 0.5s cubic-bezier(.36,.07,.19,.97) both"
              : undefined,
          }}
        >
          <style>{`
            @keyframes shake {
              10%, 90% { transform: translateX(-1px); }
              20%, 80% { transform: translateX(2px); }
              30%, 50%, 70% { transform: translateX(-4px); }
              40%, 60% { transform: translateX(4px); }
            }
          `}</style>
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`pin-input ${
                error
                  ? "border-destructive focus:border-destructive focus:ring-destructive/30"
                  : digit
                  ? "border-foreground/50"
                  : ""
              }`}
              autoComplete="off"
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center justify-center gap-2 text-destructive text-sm mb-6 fade-in">
            <AlertCircle className="w-4 h-4" />
            <span>Invalid access PIN</span>
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
            <Lock className="w-3 h-3" />
            <span>Secure access required</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinAccess;
