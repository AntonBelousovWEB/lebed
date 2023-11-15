import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import Menu from "./Menu";
import { AuthContext } from '../../context/authContext';
import { CREATE_REF } from '../../server/mutation/ref';
import { post, get, startDrawing, endDrawing, draw } from './canvasUtils';
import Chat from '../UI/chat/Chat';
import Notify from './Notify';
import { UPDATE_LVL } from '../../server/mutation/user';
import { useSelector } from 'react-redux';

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
  const [updateLvl] = useMutation(UPDATE_LVL)
  const navigate = useNavigate();
  const curLvl = useSelector(state => state.curLvl);

  const { user } = React.useContext(AuthContext);

  const wsRef = useRef(null);

  useEffect(() => {
    wsRef.current = new WebSocket('ws://localhost:3001');
    console.log(wsRef)
    wsRef.current.onmessage = (event) => {
      if (event.data === 'folderChange') {
        get(canvasRef, setUsers);
      }
    };
    return () => {
      wsRef.current.close();
    };
  }, []);

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
        updateLvl,
        setError, 
        token, 
        user, 
        curLvl,
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
      {users && Object.values(users).map((userObj) => (
        userObj.position.ePost && userObj.user ? (
          <div
            className='helloworldmyelem'
            key={userObj.user.user_id}
            style={{
              position: "absolute",
              left: userObj.position.ePost.clientX,
              top: userObj.position.ePost.clientY + 100,
              backgroundColor: userObj.user.color,
              zIndex: "1"
            }}
          >
            {userObj.user.name}
          </div>
        ) : null
      ))}
      <div className="draw-area" style={{ 
          overflowX: isScrolling ? "scroll" : "hidden" 
        }}>
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