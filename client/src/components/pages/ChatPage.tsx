import { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import UsersContext from "../../contexts/UserContext";
import { MessageType } from "../../../../server/types";
import { FaHeart } from "react-icons/fa";

const ProfileContainer = styled.section`
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #1c1c1e;
  color: #eaeaea;
`;

const ChatContainer = styled.section`
  max-width: 800px;
  margin: auto;
  padding: 30px;
  background: linear-gradient(145deg, #2d2d2f, #1c1c1e);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  color: #eaeaea;
`;

const MessagesContainer = styled.div`
  max-height: 500px;
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 20px;
  background: #2b2b2d;
  border-radius: 12px;
  box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.2);

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: #1c1c1e;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 10px;
    border: 2px solid #1f1fc0;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #888;
  }
`;

const Message = styled.div<{ $isOwnMessage: boolean; $isRead: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
  padding: 12px 18px;
  background: ${(props) =>
    props.$isOwnMessage
      ? "linear-gradient(145deg, #4f574e, #8b9789)"
      : props.$isRead
      ? "#333"
      : "#333"};
  border-radius: 12px;
  color: #fff;
  max-width: 80%;
  align-self: ${(props) => (props.$isOwnMessage ? "flex-end" : "flex-start")};
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
  }
`;

const MessageInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const SenderImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #007bff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
`;

const MessageText = styled.p`
  margin: 5px 0;
  font-size: 1rem;
`;

const MessageTime = styled.span`
  font-size: 0.8rem;
  color: #888;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #2d2d2f;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #555;
  background-color: #1f1f21;
  color: #eaeaea;
  font-size: 1rem;
  outline: none;

  &:focus {
    border-color: #007bff;
  }
`;

const SendButton = styled.button`
  padding: 12px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;

  &:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
  }
`;

const LikeButton = styled.button<{ $liked: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  color: ${(props) => (props.$liked ? "#e74c3c" : "#888")};
  display: flex;
  align-items: center;
  font-size: 1.2rem;

  &:hover {
    color: ${(props) => (props.$liked ? "#c0392b" : "#555")};
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

  // Mark messages as read (isRead)
  const markMessagesAsRead = useCallback(async () => {
    if (!conversationId || !loggedInUser) return;

    try {
      await fetch(`http://localhost:5500/api/conversations/${conversationId}/markAsRead`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: loggedInUser._id })
      });
      
      // Update messages locally to reflect they are read
      setMessages(prevMessages => prevMessages.map(msg => ({
        ...msg,
        isRead: msg.senderId !== loggedInUser._id ? true : msg.isRead
      })));
      
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }, [conversationId, loggedInUser]);

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
      await markMessagesAsRead(); // Mark messages as read
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  }, [conversationId, markMessagesAsRead, navigate]);

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
    <ProfileContainer>
    <ChatContainer>
      <h2>Pokalbis</h2>
      <MessagesContainer>
        {messages.map((msg) => {
          const sender = getSenderInfo(msg.senderId);
          const isOwnMessage = msg.senderId === loggedInUser?._id;

          return (
            <Message key={msg._id} $isOwnMessage={isOwnMessage} $isRead={msg.isRead}>
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
                {!msg.isRead && <span style={{ color: "black", fontSize: "0.8em" }}> Neperskaityta</span>}
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
    </ProfileContainer>
  );
};

export default ChatPage;