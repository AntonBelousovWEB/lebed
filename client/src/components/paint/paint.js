import { useEffect, useRef, useState } from "react"; 
import Menu from "./Menu";

function Paint() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState(5);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMenuFixed, setIsMenuFixed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "black";
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

  }, [lineWidth, isScrolling]);

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

    console.log(e.nativeEvent);
  
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
  
  const handleScroll = () => {
    setIsScrolling(!isScrolling);
  };

  return (
    <div className="App">
      <h1>Lebed</h1>
      <div className="users__profiles">
        <div>Hello</div>
      </div>
      <div className="draw-area" style={{overflowX: isScrolling ? "scroll" : "hidden"}}>
        <div className={`${isMenuFixed ? 'menu-fixed' : ''}`}>
          <Menu
            setLineWidth={setLineWidth}
            isScrolling={isScrolling}
            handleScroll={() => handleScroll()}
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