import { useState, useEffect, useContext } from "react";
import UsersContext from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { ConversationType, UserType } from "../../../../server/types";
import styled from "styled-components";

const ProfileContainer = styled.section`
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #1c1c1e;
  color: #eaeaea;
`;

const ConversationsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 30px;
  background-color: #1c1c1e;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  color: #eaeaea;
`;

const ConversationItem = styled.div`
  padding: 20px;
  border: 1px solid #444;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #2e2e2e, #1e1e1e);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);

  &:hover {
    background-color: #333;
    box-shadow: 0 8px 16px rgba(0, 123, 255, 0.3);
  }

  p {
    margin: 5px 0;
    color: #dcdcdc;
  }
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  font-size: 1.1rem;
  transition: color 0.3s;

  &:hover {
    color: #ff6b6b;
    text-decoration: underline;
  }
`;

const UnreadMessage = styled.span`
  color: #ff4757;
  font-size: 0.9em;
  font-weight: bold;
  margin-left: 10px;
`;

const Strong = styled.strong`
  font-weight: bold;
  color: #0056b3; /* Galite pakeisti spalvą */
  font-size: 1.1em; /* Šiek tiek padidintas dydis */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2); /* Pridėtas šešėlis */
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
    <ProfileContainer>
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
                <p>Bendrauji su: <Strong>{names}</Strong></p>
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
    </ProfileContainer>
  );
};

export default Conversations;
