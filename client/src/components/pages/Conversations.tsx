import { useState, useEffect, useContext } from "react";
import UsersContext from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { ConversationType, UserType } from "../../../../server/types";
import styled from "styled-components";

const ConversationsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 20px;
`;

const ConversationItem = styled.div`
  padding: 15px;
  border: 2px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9f9f9;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    background-color: #e0e0e0;
  }
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

const UnreadMessage = styled.span`
  color: red;
  font-size: 0.9em;
  margin-left: 10px;
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
        if (!response.ok) throw new Error("Nepavyko gauti pokalbių");

        const data = await response.json();
       // console.log("Pokalbiai su žinutėmis:", data);
        setConversations(data);
      } catch (error) {
        console.error("Klaida gaunant pokalbius:", error);
      }
    };

    fetchConversations();
  }, [loggedInUser]);

  const openChat = (conversationId: string) => {
    navigate(`/chat/${conversationId}`);
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`http://localhost:5500/api/conversations/${conversationId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Nepavyko ištrinti pokalbio");

      setConversations((prevConversations) =>
        prevConversations.filter((convo) => convo._id.toString() !== conversationId)
      );
    } catch (error) {
      console.error("Klaida trynimo metu:", error);
    }
  };

  const getParticipantNamesAndUnreadStatus = (conversation: ConversationType) => {
    if (!users || users.length === 0) return { names: "N/A", hasUnreadMessages: false };

    const names = conversation.participants
      .filter((id) => id.toString() !== loggedInUser?._id)
      .map((id) => users.find((user: UserType) => user._id === id.toString())?.username || "Nežinomas vartotojas")
      .join(", ");

    const hasUnreadMessages = conversation.messages?.some(
      (msg) => !msg.isRead && msg.senderId !== loggedInUser?._id
    ) || false;

    return { names, hasUnreadMessages };
  };

  return (
    <ConversationsContainer>
      <h2>Pokalbiai</h2>
      {conversations.length > 0 ? (
        conversations.map((convo) => {
          const { names, hasUnreadMessages } = getParticipantNamesAndUnreadStatus(convo);

          return (
            <ConversationItem
              key={convo._id.toString()}
              onClick={() => openChat(convo._id.toString())}
            >
              <div>
                <p>Dalyviai: {names}</p>
                <p>Pradėta: {new Date(convo.createdAt).toLocaleString()}</p>
                {hasUnreadMessages && <UnreadMessage>Neperskaityta</UnreadMessage>}
              </div>
              <DeleteButton
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(convo._id.toString());
                }}
              >
                Trinti
              </DeleteButton>
            </ConversationItem>
          );
        })
      ) : (
        <p>Nėra pradėtų pokalbių.</p>
      )}
    </ConversationsContainer>
  );
};

export default Conversations;
