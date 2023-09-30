import React from 'react';
import { useEffect, useRef, useState } from "react"; 
import Menu from "./Menu";
import { AuthContext } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import { CREATE_REF } from '../../mutation/ref';
import { GET_REF } from '../../query/ref';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { CTX_REF_UPDATED } from '../../subscription/ref';

function Paint() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState(5);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMenuFixed, setIsMenuFixed] = useState(false);
  const [errors, setError] = React.useState("");

  const [createRef] = useMutation(CREATE_REF);
  const { refetch: refetchRef } = useQuery(GET_REF);

  const navigate = useNavigate();

  const { user } = React.useContext(AuthContext);

  useSubscription(CTX_REF_UPDATED, {
    onData: () => {
      get();
    },
  });

  useEffect(() => {
    if (!user) {
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
  
  const post = async () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL(0.1);
  
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
  
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
  
    const blob = new Blob([ab], { type: mimeString });

    const blobURL = URL.createObjectURL(blob);

    const formData = new FormData();
    formData.append('image', blob);
  
    try {
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: dataURL,
      });
    
      if (!response.ok) {
        console.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }

    createRef({
      variables: {
        editCtxRefInput: {
          dataRef: blobURL
        }
      }
    }).catch((err) => {
     setError(err.toString());
    });
  };   

  const get = async () => {
    const response = await fetch("http://localhost:3000/download");

    if (response.status === 200) {
      const data = await response.text();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const image = new Image();
      image.src = data;
      image.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);
      };
    } else {
      console.log("Файл не найден");
    }
  };

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

    post();
  };

  return (
    <div className="App">
      <h1>Lebed</h1>
      <button style={{background: "#fff"}} onClick={() => post()}>Отправить</button>
      <br />
      <button style={{background: "#fff"}} onClick={() => get()}>Получить</button>
      <br />
      <button style={{background: "#fff"}} onClick={() => test()}>Тест</button>
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