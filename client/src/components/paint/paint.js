import React from 'react';
import { useEffect, useRef, useState } from "react"; 
import Menu from "./Menu";
import { AuthContext } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import { CREATE_REF } from '../../mutation/ref';
import { GET_REF } from '../../query/ref';
import { useMutation, useQuery } from '@apollo/client';

function Paint() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState(5);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMenuFixed, setIsMenuFixed] = useState(false);
  const [errors, setError] = React.useState("");

  const [createRef] = useMutation(CREATE_REF);
  const { refetch } = useQuery(GET_REF);

  const navigate = useNavigate();

  const { user } = React.useContext(AuthContext);

  useEffect(() => {
    if (user == null) {
      return navigate('/');
    };
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

  const post = () => {
      const canvas = canvasRef.current;
      const dataURL = canvas.toDataURL();
      createRef({
        variables: {
          editCtxRefInput: {
            dataRef: dataURL
          }
        }
      }).then(({ data }) => {
       console.log(data);
      }).catch((err) => {
       setError(err.toString());
      });
  }

  const get = () => {
    refetch()
      .then(({ data }) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const image = new Image();
        image.src = data.ctxRefUpdate[0].dataRef;

        // When the image is loaded, draw it on the canvas
        image.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
          ctx.drawImage(image, 0, 0); // Draw the image on the canvas
        };
      })
  }

  const startDrawing = (e) => {
    if (isScrolling) {
      return;
    }
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(
      e.nativeEvent.offsetX, 
      e.nativeEvent.offsetY
    );
    setIsDrawing(true);
  };

  const endDrawing = () => {
    ctxRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = (e) => {
    if (!isDrawing || isScrolling) {
      return;
    }
  
    let clientX, clientY;

    // console.log(e.nativeEvent); 
  
    if (e.type === 'mousemove') {
      clientX = e.nativeEvent.offsetX;
      clientY = e.nativeEvent.offsetY;
    } else if (e.type === 'touchmove') {
      clientX = e.touches[0].pageX - e.touches[0].target.offsetLeft - 30;
      clientY = e.touches[0].pageY - e.touches[0].target.offsetTop - 150;
    }
  
    ctxRef.current.lineTo(clientX, clientY);
    ctxRef.current.stroke();
  };

  return (
    <div className="App">
      <h1>Lebed</h1>
      <button style={{background: "#fff"}} onClick={() => post()}>Отправить</button>
      <br />
      <button style={{background: "#fff"}} onClick={() => get()}>Получить</button>
      <div className="Errors">{errors.toString()}</div>
      <div className="draw-area" style={{overflowX: isScrolling ? "scroll" : "hidden"}}>
        <div className={`${isMenuFixed ? 'menu-fixed' : ''}`}>
          <Menu
            setLineWidth={setLineWidth}
            isScrolling={isScrolling}
            handleScroll={() => setIsScrolling(!isScrolling)}
          />
        </div>
        <canvas
          onMouseDown={startDrawing}
          onMouseUp={endDrawing}
          onMouseMove={draw}
          onTouchStart={startDrawing}
          onTouchEnd={endDrawing}
          onTouchMove={draw}
          ref={canvasRef}
          width={`1280px`}
          height={"1000px"}
        />
      </div>
    </div>
  );
}

export default Paint;