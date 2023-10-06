import { useEffect, useRef, useState } from "react";

const useToggleState = (initialState = true) => {
  const [state, setState] = useState(initialState);
  const ref = useRef(null);

  useEffect(() => {
    const refCurrent = ref.current;

    const handleRefClick = (event) => {
      if (event.target === refCurrent) {
        return;
      }

      setState(initialState);
    };

    refCurrent.addEventListener("click", handleRefClick);

    return () => {
      refCurrent.removeEventListener("click", handleRefClick);
    };
  }, [initialState]);

  const toggleState = () => {
    setState((prevState) => !prevState);
  };

  return { state, toggleState, ref };
};

export default useToggleState;