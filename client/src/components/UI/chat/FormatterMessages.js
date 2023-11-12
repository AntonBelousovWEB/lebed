export const formatMessageText = (messageText) => {
  const parts = messageText.split(/(<(.*?)>(.*?)<\/\2>)/g);

  switch (messageText) {
    default:
      if (parts.length === 5) {
        return parts.map((part, index) => {
          if (part.startsWith("<") && part.endsWith(">")) {
            const matches = part.match(/<([^>]+)>(.*?)<\/\1>/);
            if (matches) {
              const colorName = matches[1];
              const content = matches[2];
              if(colorName === "img") {
                return (
                  <img key={index} src={content} alt="chat_img" style={{pointerEvents: "none"}} />
                )
              } else {
                return (
                  <span key={index} style={{ color: colorName }}>
                    {content}
                  </span>
                );
              }
            } else {
              return (
                <span key={index} style={{ color: 'black' }}>
                  {messageText}
                </span>
              );
            }
          }

          return null;
        });
      } else {
        return (
          <span style={{ color: 'black' }}>
            {messageText}
          </span>
        );
      }
  }
};