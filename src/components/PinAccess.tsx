import { useState, useRef, useEffect } from "react";
import { Lock, AlertCircle, MessageSquare } from "lucide-react";

interface PinAccessProps {
  onSuccess: () => void;
}

const CORRECT_PIN = "LOLUPEE5890";
const PIN_LENGTH = CORRECT_PIN.length;

const PinAccess = ({ onSuccess }: PinAccessProps) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (value: string) => {
    const filtered = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, PIN_LENGTH);
    setPin(filtered);
    setError(false);

    if (filtered.length === PIN_LENGTH) {
      if (filtered === CORRECT_PIN) {
        onSuccess();
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setPin("");
          inputRef.current?.focus();
        }, 600);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3">
      <div className="glass-card p-4 sm:p-6 w-full max-w-xs slide-up">
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
          className="relative flex justify-center gap-1 mb-6 px-2 cursor-text"
          onClick={() => inputRef.current?.focus()}
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

          {/* Hidden input */}
          <input
            ref={inputRef}
            type="text"
            value={pin}
            onChange={(e) => handleChange(e.target.value)}
            maxLength={PIN_LENGTH}
            className="absolute opacity-0 w-0 h-0"
            autoComplete="off"
          />

          {/* Visual boxes */}
          {Array.from({ length: PIN_LENGTH }).map((_, index) => (
            <div
              key={index}
              className={`w-6 h-8 sm:w-7 sm:h-9 flex items-center justify-center text-sm sm:text-base font-bold rounded bg-input border-2 transition-all ${
                error
                  ? "border-destructive"
                  : pin.length === index
                  ? "border-foreground ring-2 ring-foreground/20"
                  : pin[index]
                  ? "border-foreground/50"
                  : "border-border"
              }`}
            >
              {pin[index] || ""}
            </div>
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
