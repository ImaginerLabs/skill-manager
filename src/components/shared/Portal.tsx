import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
  container?: HTMLElement | null;
}

export function Portal({ children, container }: PortalProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  if (!ref.current) {
    ref.current = document.createElement("div");
  }

  useEffect(() => {
    const target = container ?? document.body;
    if (!ref.current || !target.contains(ref.current)) {
      target.appendChild(ref.current);
    }
    return () => {
      if (ref.current && target.contains(ref.current)) {
        target.removeChild(ref.current);
      }
    };
  }, [container]);

  return createPortal(children, ref.current);
}
