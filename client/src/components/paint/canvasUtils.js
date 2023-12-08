const wsPost = new WebSocket('ws://192.168.1.248:5000/upload');

export function post(canvasRef, updateLvl, setError, user, curLvl, ePost) {
    const postLogic = async () => {
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
  
      // const blobURL = URL.createObjectURL(blob);
  
      const formData = new FormData();
      formData.append('image', blob);

      const data = { 
        user, 
        position: {
          ePost
        }, 
        dataURL 
      };
  
      try {
        wsPost.send(JSON.stringify(data));
      } catch (error) {
        console.error('Error uploading image:', error);
      }

      // updateLvl({
      //   variables: {
      //     updateLvlUserInput: {
      //       name: user.name,
      //       level: Math.floor(curLvl) / (Math.floor(curLvl * curLvl) * 1000)
      //     }
      //   }
      // }).catch((err) => {
      //   setError(err.toString());
      // });
    };
    postLogic();
}

const wsGet = new WebSocket('ws://192.168.1.248:5000/download');

export function get(canvasRef, Users) {
  try {
    const sendMessage = (message) => {
      if (wsGet.readyState === WebSocket.OPEN) {
        wsGet.send(message);
      } else {
        wsGet.addEventListener('open', () => {
          wsGet.send(message);
        });
      }
    };

    sendMessage("hello");
  
    wsGet.onmessage = (event) => {
      if (event.data) {
        const data = JSON.parse(event.data);
        const canvas = canvasRef.current;
        if (data.Canvas !== "" && data.Users !== "") {
          Users(JSON.parse(data.Users));
          const ctx = canvas.getContext('2d');
          const image = new Image();
          image.src = data.Canvas;
          image.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0);
          };
        };
      };
    };
  } catch (error) {
    console.error("Ошибка при создании WebSocket:", error);
  }
}
  
export const startDrawing = (e, isScrolling, ctxRef, setIsDrawing) => {
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

export const endDrawing = (ctxRef, setIsDrawing) => {
  ctxRef.current.closePath();
  setIsDrawing(false);
};

export const draw = (e, isDrawing, isScrolling, ctxRef, setEPost, post) => {
  if (!isDrawing || isScrolling) {
    return;
  }
  let clientX, clientY;

  if (e.type === 'mousemove') {
    clientX = e.nativeEvent.offsetX;
    clientY = e.nativeEvent.offsetY;
  } else if (e.type === 'touchmove') {
    clientX = e.touches[0].pageX - e.touches[0].target.offsetLeft - 30;
    clientY = e.touches[0].pageY - e.touches[0].target.offsetTop - 100;
  }

  setEPost({clientX, clientY})

  ctxRef.current.lineTo(clientX, clientY);
  ctxRef.current.stroke();
  post();
};