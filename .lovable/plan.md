

## Fix: PIN Input Reliability

**Problem**: When typing quickly into the 10 individual PIN inputs, characters get dropped because the focus-switching logic can't keep up, resulting in an incomplete PIN that fails validation.

**Solution**: Replace the 10 individual `<input>` elements with a single hidden text input approach:

1. **Single input field** — Use one `<input>` with `maxLength={10}` that captures all keystrokes reliably, styled to look like separate boxes by rendering the characters in a row of styled `<div>` elements.

2. **Visual grid overlay** — Display 10 styled boxes that show each character from the single input's value. A cursor indicator shows which position is active.

3. **Auto-validate** — When the input reaches 10 characters, validate against `CORRECT_PIN`. This eliminates the timing issues with focus-switching between separate inputs.

4. **Keep paste support** — The single input naturally handles paste without custom logic.

**File changed**: `src/components/PinAccess.tsx`

