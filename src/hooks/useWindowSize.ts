import { useEffect, useLayoutEffect, useRef, useState } from "react";
import debounce from "lodash.debounce";

export interface WindowSize {
  width: number;
  height: number;
}

export default function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
  });

  const debouncedSizeHandlerRef = useRef(
    debounce(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 300)
  );

  useEffect(() => {
    const handler = debouncedSizeHandlerRef.current;
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useLayoutEffect(() => {
    debouncedSizeHandlerRef.current();
  }, []);

  return windowSize;
}
