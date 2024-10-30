import { useState, useEffect, useContext } from "react";
import UsersContext from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { ConversationType, UserType } from "../../../../server/types";
import styled, { css } from "styled-components";

const ConversationsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 20px;
`;

const ConversationItem = styled.div<{ hasUnreadMessages?: boolean }>`
  padding: 15px;
  border: 2px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9f9f9;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;

  ${(props) =>
    props.hasUnreadMessages &&
    css`
      background-color: #ffecec;
      border-color: #ff4d4d;
      font-weight: bold;
      box-shadow: 0px 4px 12px rgba(255, 0, 0, 0.2);
    `}

  &:hover {
    background-color: ${(props) => (props.hasUnreadMessages ? '#ffcccc' : '#e0e0e0')};
  }
`;

const UnreadBadge = styled.span`
  background-color: #ff4d4d;
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: bold;
  margin-right: 10px;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: red;
  cursor: pointer;
  font-size: 1rem;
  margin-left: 10px;

  &:hover {
    text-decoration: underline;
  }
`;

const Conversations = () => {
  const { loggedInUser, users } = useContext(UsersContext) || {};
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      if (!loggedInUser?._id) return;

      try {
        const response = await fetch(`http://localhost:5500/api/conversations/${loggedInUser._id}`);
        
        if (response.status === 404) {
          console.warn("Vartotojas neturi pradėtų pokalbių.");
          setConversations([]);  // Nustatome, kad pokalbių nėra
          return;
        }
        
        if (!response.ok) throw new Error('Nepavyko gauti pokalbių');

        const data = await response.json();
        console.log("Fetched conversations with unread status:", data);
        setConversations(data);

      } catch (err) {
        console.error("Klaida gaunant pokalbius:", err);
      }
    };

    fetchConversations();
  }, [loggedInUser]);

  const openChat = (conversationId: string) => {
    navigate(`/chat/${conversationId}`);
  };

  const deleteConversation = async (conversationId: string) => {
    if (!loggedInUser?._id) return;

    try {
      const response = await fetch(`http://localhost:5500/api/conversations/${conversationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Nepavyko ištrinti pokalbio');

      setConversations(conversations.filter((convo) => convo._id !== conversationId));
    } catch (err) {
      console.error("Klaida trynimo metu:", err);
    }
  };

  const getParticipantNames = (participantIds: string[]) => {
    if (!users || users.length === 0) return "N/A";
    return participantIds
      .filter((id) => id !== loggedInUser?._id)
      .map((id) => users.find((user: UserType) => user._id === id)?.username || "Nežinomas vartotojas")
      .join(", ");
  };

  return (
    <ConversationsContainer>
      <h2>Pokalbiai</h2>
      {conversations.length > 0 ? (
        conversations.map((convo) => (
          <ConversationItem
            key={convo._id}
            onClick={() => openChat(convo._id)}
            hasUnreadMessages={convo.hasUnreadMessages}
          >
            <div>
              <p>Dalyviai: {getParticipantNames(convo.participants)}</p>
              <p>Pradėta: {new Date(convo.createdAt).toLocaleString()}</p>
            </div>
            <div>
              {convo.hasUnreadMessages && <UnreadBadge>Naujos žinutės</UnreadBadge>}
              <DeleteButton
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(convo._id);
                }}
              >
                Trinti
              </DeleteButton>
            </div>
          </ConversationItem>
        ))
      ) : (
        <p>Nėra pradėtų pokalbių.</p>
      )}
    </ConversationsContainer>
  );
};

export default Conversations;