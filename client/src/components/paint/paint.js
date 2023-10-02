import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useSubscription } from '@apollo/client';
import { CTX_REF_UPDATED } from '../../subscription/ref';
import Menu from "./Menu";
import { AuthContext } from '../../context/authContext';
import { CREATE_REF } from '../../mutation/ref';
import { post, get, startDrawing, endDrawing, draw } from './canvasUtils';
import Chat from '../UI/chat/Chat';

function Paint() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState(5);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMenuFixed, setIsMenuFixed] = useState(false);
  const [errors, setError] = React.useState("");

  const [createRef] = useMutation(CREATE_REF);

  const navigate = useNavigate();

  const { user } = React.useContext(AuthContext);

  useSubscription(CTX_REF_UPDATED, {
    onData: () => {
      get(canvasRef);
    },
  });

  useEffect(() => {
    if (!user) {
      return navigate('/');
    }
    get(canvasRef);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = user.color;
    ctx.lineWidth = lineWidth;
    ctxRef.current = ctx;

    window.document.body.style.overflowY = isScrolling ? "scroll" : "hidden";

    const scrollMenu = () => {
      const drawArea = document.querySelector('.draw-area');
      const drawAreaRect = drawArea.getBoundingClientRect();

      if (drawAreaRect.top <= 0) {
        setIsMenuFixed(true);
      } else {
        setIsMenuFixed(false);
      }
    };

    window.addEventListener('scroll', scrollMenu);

    return () => {
      window.removeEventListener('scroll', scrollMenu);
    };

  }, [lineWidth, isScrolling, user, navigate]);

  return (
    <div className="App">
      <h1>Lebed</h1>
      <div className="Errors">{errors.toString()}</div>
      <div className="draw-area" style={{ overflowX: isScrolling ? "scroll" : "hidden" }}>
        <div className={`${isMenuFixed ? 'menu-fixed' : ''}`}>
          <Menu
            setLineWidth={setLineWidth}
            isScrolling={isScrolling}
            handleScroll={() => setIsScrolling(!isScrolling)}
          />
        </div>
        <canvas
          onMouseDown={(e) => startDrawing(e, isScrolling, ctxRef, setIsDrawing)}
          onMouseUp={() => endDrawing(ctxRef, setIsDrawing)}
          onMouseMove={(e) => draw(e, isDrawing, isScrolling, ctxRef, () => post(canvasRef, createRef, setError))}
          onTouchStart={(e) => startDrawing(e, isScrolling, ctxRef, setIsDrawing)}
          onTouchEnd={() => endDrawing(ctxRef, setIsDrawing)}
          onTouchMove={(e) => draw(e, isDrawing, isScrolling, ctxRef, () => post(canvasRef, createRef, setError))}
          ref={canvasRef}
          width={`1280px`}
          height={"1000px"}
        />
      </div>
      <Chat />
    </div>
  );
}

export default Paint;