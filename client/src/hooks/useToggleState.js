import { useEffect, useRef, useState } from "react";

const useToggleState = (initialState = true) => {
  const [state, setState] = useState(initialState);
  const ref = useRef(null);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setState(initialState);
      }
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [initialState]);

  const toggleState = () => {
    setState((prevState) => !prevState);
  };

  return { state, toggleState, ref };
};

export default useToggleState;