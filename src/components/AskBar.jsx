import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import Icon from "./Icon";
import { triggerFluidSplat } from "./FluidCursor";

const AskBar = forwardRef(function AskBar(
  { onSend, placeholder = "Talk to me, get to know me...", dock = false },
  ref
) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const buttonRef = useRef(null);
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    setValue: (val) => setValue(val),
  }));

  const submit = (e) => {
    e.preventDefault();
    const trimmed = value.trim() || (!dock ? "Talk to me, get to know me" : "");
    if (!trimmed) return;

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const normX = (rect.left + rect.width / 2) / window.innerWidth;
      const normY = 1 - (rect.top + rect.height / 2) / window.innerHeight;

      triggerFluidSplat({
        x: normX,
        y: normY,
        hexColor: "#2563eb",
        count: 3,
        radius: 0.004,
        velocity: 750,
      });
    }

    onSend(trimmed);
    setValue("");
  };

  return (
    <form
      className={`ask${dock ? " dockask" : ""}${isFocused ? " focused" : ""}`}
      onSubmit={submit}
    >
      <div className="ask-sparkle-dot" aria-hidden="true" />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        aria-label="Talk to me, get to know me"
        autoComplete="off"
      />
      <button
        ref={buttonRef}
        type="submit"
        aria-label="Send message"
        className={value.trim() || !dock ? "ready" : ""}
      >
        <Icon name={dock ? "up" : "right"} />
      </button>
    </form>
  );
});

export default AskBar;
