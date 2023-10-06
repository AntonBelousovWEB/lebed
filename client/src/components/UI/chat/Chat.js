import React from "react";
import { useMutation, useSubscription, useQuery } from "@apollo/client";
import { ADD_MESSAGE } from "../../../mutation/addMessage";
import { AuthContext } from "../../../context/authContext";
import { CHAT_UPDATED } from "../../../subscription/chat";
import { GET_MESSAGES } from "../../../query/Messages";
import { formatMessageText } from "./FormatterMessages";

export default function Chat({ sidebar }) {
    const [message, setMessage] = React.useState("");
    const [messages, setMessages] = React.useState([]);
    const [addMessage] = useMutation(ADD_MESSAGE);
    const { user } = React.useContext(AuthContext);
    const { refetch: refetchMessages } = useQuery(GET_MESSAGES);
    const messageListRef = React.useRef(null);
    const [error, setError] = React.useState("");   

    useSubscription(CHAT_UPDATED, {
        onData: ({ data }) => {
            const messageData = data.data.chatUpdated;
            setMessages(prevMessages => [
                ...prevMessages,
                {
                    ...messageData,
                    color: messageData.color,
                },
            ]);
        },
    });    

    React.useEffect(() => {
        refetchMessages().then(({ data }) => {
            setMessages(data.getMessages);
        });
    }, [refetchMessages]);

    React.useEffect(() => {
        messageListRef.current.scrollTo({
          top: messageListRef.current.scrollHeight
        });
    }, [messages]);

    const sendMessage = (messageText) => {
        addMessage({
            variables: {
                addMessageInput: {
                    color: user.color,
                    message: messageText,
                },
            },
        }).catch((err) => {
            setError(err.toString().substring(20, 100));
            setTimeout(() => {
                setError("");
            }, 2000)
        });
        setMessage("");
    }

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            sendMessage(message);
        }
    };

    return (
        <div className={sidebar}>
            <div className='chat'>
                <h2 className='title_chat'>LEBED CHAT</h2>
                <div className="Errors chat_error">{error.toString()}</div>
                <div className="message-list scroll"  ref={messageListRef}>
                    {messages.map((message, index) => (
                        <div key={index} className="message">
                            <div 
                                className="message_color" 
                                style={{ backgroundColor: message.color }}>
                            </div>
                            <p className="message_text">{formatMessageText(message.message)}</p>
                        </div>
                    ))}
                </div>
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className='input_text_chat'
                    type='text'
                    placeholder='type text'
                />
                <button onClick={() => sendMessage(message)} className='send'>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M.5 1.163A1 1 0 0 1 1.97.28l12.868 6.837a1 1 0 0 1 0 1.766L1.969 15.72A1 1 0 0 1 .5 14.836V10.33a1 1 0 0 1 .816-.983L8.5 8 1.316 6.653A1 1 0 0 1 .5 5.67V1.163Z"></path></svg>
                </button>
            </div>
        </div>
    )
}