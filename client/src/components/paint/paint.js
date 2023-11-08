import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useSubscription } from '@apollo/client';
import { CTX_REF_UPDATED } from '../../subscription/ref';
import Menu from "./Menu";
import { AuthContext } from '../../context/authContext';
import { CREATE_REF } from '../../mutation/ref';
import { post, get, startDrawing, endDrawing, draw } from './canvasUtils';
import Chat from '../UI/chat/Chat';
import Notify from './Notify';

function Paint() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState(5);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMenuFixed, setIsMenuFixed] = useState(false);
  // const [canvasHeight, setCanvasHeight] = useState(1000);
  const [errors, setError] = React.useState("");
  const [token, setToken] = React.useState("");
  const [users, setUsers] = React.useState(null);
  const [ePost, setEPost] = React.useState(null)
  const [createRef] = useMutation(CREATE_REF);
  const navigate = useNavigate();

  const { user } = React.useContext(AuthContext);

  useSubscription(CTX_REF_UPDATED, {
    onData: () => {
      get(canvasRef, setUsers);
    },
  });
  useEffect(() => {
    if (!user) {
      return navigate('/');
    }
    setToken(localStorage.getItem('token'))
    get(canvasRef, setUsers);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = user.color;
    ctx.imageSmoothingEnabled = true; 
    ctx.lineWidth = lineWidth;
    ctxRef.current = ctx;

    window.document.body.style.overflowY = isScrolling ? "scroll" : "hidden";

    const scrollMenu = () => {
      const drawArea = document.querySelector('.draw-area');
      const drawAreaRect = drawArea.getBoundingClientRect();

      if (drawAreaRect.top <= 0) {
        setIsMenuFixed(true);
        // setCanvasHeight((prevHeight) => prevHeight + 10);
      } else {
        setIsMenuFixed(false);
      }
    };

    window.addEventListener('scroll', scrollMenu);

    return () => {
      window.removeEventListener('scroll', scrollMenu);
    };

  }, [lineWidth, isScrolling, user, navigate]);

  const handleMouseMove = (e) => {
    draw(
      e, 
      isDrawing, 
      isScrolling, 
      ctxRef, 
      setEPost, 
      () => post(
        canvasRef, 
        createRef, 
        setError, 
        token, 
        user, 
        ePost
      )
    );
  };

  const handleStart = (e) => {
    startDrawing(
      e, 
      isScrolling, 
      ctxRef, 
      setIsDrawing
    )
  }

  const handleStop = () => {
    endDrawing(
      ctxRef, 
      setIsDrawing
    )
  }

  return (
    <div className="App">
      <Notify />
      <h1>Lebed</h1>
      <div className="Errors">{errors.toString()}</div>
      {users && users ? (
        <div className='helloworldmyelem' key={user.id} style={{ 
           position: "absolute", 
           left: users.position.ePost.clientX, 
           top: users.position.ePost.clientY,
           backgroundColor: users.user.color,
           zIndex: "1" }}>
           {users.user.name}
        </div>
      ) : (
        null
      )}
      <div className="draw-area" style={{ overflowX: isScrolling ? "scroll" : "hidden" }}>
        <div className={`${isMenuFixed ? 'menu-fixed' : ''}`}>
          <Menu
            setLineWidth={setLineWidth}
            isScrolling={isScrolling}
            handleScroll={() => setIsScrolling(!isScrolling)}
          />
        </div>
        <canvas
          onMouseDown={handleStart}
          onMouseUp={handleStop}
          onMouseMove={handleMouseMove}
          onTouchStart={handleStart}
          onTouchEnd={handleStop}
          onTouchMove={handleMouseMove}
          ref={canvasRef}
          width={`1280px`}
          height={`1000px`}
        />
      </div>
      <Chat sidebar="pc_sidebar" />
    </div>
  );
}

export default Paint; 