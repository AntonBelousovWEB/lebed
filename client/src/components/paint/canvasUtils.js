export function post(canvasRef, createRef, setError) {
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
            dataRef: blobURL,
          },
        },
      }).catch((err) => {
        setError(err.toString());
      });
    };
    postLogic();
}
  
export function get(canvasRef) {
  const getLogic = async () => {
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
  getLogic();
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

export const draw = (e, isDrawing, isScrolling, ctxRef, post) => {
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