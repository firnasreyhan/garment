import { Lock, Unlock } from "lucide-react";
import { useEffect, useState } from "react";

// Now supports controlled and uncontrolled usage
export const LockableInput = ({
  type = "text",
  placeholder = "",
  disabledByDefault = false,
  wrapperClassName = "",
  left = false,
  locked: lockedProp,
  onLockedChange,
  toggleDisabled = false, // new prop
  ...props
}) => {
  const isControlled = lockedProp !== undefined;
  const [lockedState, setLockedState] = useState(disabledByDefault);

  const locked = isControlled ? lockedProp : lockedState;

  useEffect(() => {
    if (isControlled) {
      setLockedState(lockedProp);
    }
  }, [lockedProp, isControlled]);

  const handleToggle = () => {
    if (toggleDisabled) return; // prevent toggle if disabled
    if (isControlled) {
      onLockedChange && onLockedChange(!lockedProp);
    } else {
      setLockedState((prev) => !prev);
    }
  };

  return (
    <div className={`relative flex items-center ${wrapperClassName}`}>
      <input
        type={type}
        placeholder={placeholder}
        disabled={locked}
        {...props}
      />
      <button
        type="button"
        onClick={handleToggle}
        disabled={toggleDisabled}
        className={`absolute ${left ? "left-2" : "right-2"} text-gray-500 hover:text-gray-700 ${toggleDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {locked ? <Lock size={18} /> : <Unlock size={18} />}
      </button>
    </div>
  );
};
