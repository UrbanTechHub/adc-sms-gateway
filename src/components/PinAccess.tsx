import { useState, useRef, useEffect } from "react";
import { Lock, AlertCircle, MessageSquare } from "lucide-react";

interface PinAccessProps {
  onSuccess: () => void;
}

const CORRECT_PIN = "LOLUPEE5890";

const PinAccess = ({ onSuccess }: PinAccessProps) => {
  const [pin, setPin] = useState<string[]>(["", "", "", "", "", "", "", "", "", ""]);
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

    if (value && index < 9) {
      inputRefs.current[index + 1]?.focus();
    }

    if (index === 9 && value) {
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
    const pastedData = e.clipboardData.getData("text").toUpperCase().slice(0, 10);
    const newPin = [...pin];
    for (let i = 0; i < pastedData.length; i++) {
      if (/^[A-Z0-9]$/.test(pastedData[i])) {
        newPin[i] = pastedData[i];
      }
    }
    setPin(newPin);

    const lastFilledIndex = newPin.findIndex((p) => !p);
    const focusIndex = lastFilledIndex === -1 ? 9 : lastFilledIndex;
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
      <div className="glass-card p-6 sm:p-8 w-full max-w-sm slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-foreground/5 border border-border mb-4">
            <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-foreground" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 tracking-tight">
            SMS Gateway
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Enter access PIN to continue
          </p>
        </div>

        <div
          className="flex justify-center gap-1.5 sm:gap-2 mb-6"
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
              className={`w-10 h-12 sm:w-11 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-lg bg-input border-2 border-border focus:border-foreground focus:ring-2 focus:ring-foreground/20 outline-none transition-all ${
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

        {error && (
          <div className="flex items-center justify-center gap-2 text-destructive text-sm mb-4 fade-in">
            <AlertCircle className="w-4 h-4" />
            <span>Invalid access PIN</span>
          </div>
        )}

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
