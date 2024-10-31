import { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import UsersContext from "../../contexts/UserContext";
import { MessageType } from "../../../../server/types";
import { FaHeart } from "react-icons/fa";

const ChatContainer = styled.section`
  max-width: 800px;
  margin: auto;
  padding: 20px;
  background: #f4f4f8;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const MessagesContainer = styled.div`
  max-height: 500px;
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #fff;
  border-radius: 5px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
`;

const Message = styled.div<{ $isOwnMessage: boolean }>`
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  padding: 8px;
  background: ${(props) => (props.$isOwnMessage ? "#e1ffc7" : "#f0f0f0")};
  border-radius: 8px;
  max-width: 90%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
`;

const MessageInfo = styled.div`
  margin-left: 10px;
`;

const SenderImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

const MessageText = styled.p`
  margin: 5px 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  white-space: pre-wrap;
`;

const MessageTime = styled.span`
  font-size: 0.8em;
  color: #555;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
`;

const SendButton = styled.button`
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const LikeButton = styled.button<{ $liked: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: ${(props) => (props.$liked ? "red" : "gray")};
  &:hover {
    color: ${(props) => (props.$liked ? "darkred" : "black")};
  }
`;

const ChatPage = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const context = useContext(UsersContext);
  const { loggedInUser, users } = context || {};
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // Get user info based on sender ID
  const getSenderInfo = (senderId: string) => {
    return users?.find((user) => user._id === senderId);
  };

  const fetchMessages = useCallback(async () => {
    if (!conversationId || conversationId === "null") {
      console.error("conversationId is missing. Redirecting to conversations.");
      navigate("/conversations");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5500/api/conversations/${conversationId}/messages`
      );
      if (!response.ok) throw new Error("Error fetching messages");

      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  }, [conversationId, navigate]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !loggedInUser) return;

    try {
      const response = await fetch(
        `http://localhost:5500/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ senderId: loggedInUser._id, content: newMessage }),
        }
      );

      if (!response.ok) throw new Error("Error sending message");

      const data = await response.json();
      setMessages((prevMessages) => [...prevMessages, data]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const likeMessage = async (messageId: string) => {
    try {
      const response = await fetch(`http://localhost:5500/api/messages/${messageId}/like`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Error liking message");

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, liked: !msg.liked } : msg
        )
      );
    } catch (error) {
      console.error("Error liking message:", error);
    }
  };

  return (
    <ChatContainer>
      <h2>Pokalbis</h2>
      <MessagesContainer>
        {messages.map((msg) => {
          const sender = getSenderInfo(msg.senderId);
          const isOwnMessage = msg.senderId === loggedInUser?._id;

          return (
            <Message key={msg._id} $isOwnMessage={isOwnMessage}>
              <SenderImage src={sender?.profileImage || "default-profile.png"} alt="siuntėjo profilis" />
              <MessageInfo>
                <strong>{sender?.username || "Nežinomas"}: </strong>
                <MessageText>{msg.content}</MessageText>
                <MessageTime>{new Date(msg.sentAt).toLocaleString()}</MessageTime>
                <LikeButton 
                  $liked={msg.liked || false} 
                  onClick={() => !isOwnMessage && likeMessage(msg._id)}
                  disabled={isOwnMessage}
                >
                  <FaHeart />
                </LikeButton>
              </MessageInfo>
            </Message>
          );
        })}
      </MessagesContainer>
      <InputContainer>
        <MessageInput
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Parašykite žinutę..."
        />
        <SendButton onClick={sendMessage}>Siųsti</SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatPage;