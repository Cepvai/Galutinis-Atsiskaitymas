import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserType } from "../../../../types";
import styled from "styled-components";

const UserProfile = styled.div`
  text-align: center;
  img {
    border-radius: 50%;
    width: 100px;
    height: 100px;
  }

  .username {
    font-size: 2rem;
    font-weight: bold;
    margin-top: 10px;
  }

  .start-chat-button {
    margin-top: 20px;
    padding: 10px 20px;
    font-size: 1rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
`;

const ParticularUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:5500/api/users/${id}`);
        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error("Klaida gaunant vartotojo duomenis:", err);
      }
    };

    fetchUser();
  }, [id]);

  const startChat = async () => {
    try {
      const loggedInUserId = "currentLoggedInUserId";
      const response = await fetch("http://localhost:5500/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ user1Id: loggedInUserId, user2Id: id })
      });
      const data = await response.json();
      if (data.conversationId) {
        navigate(`/chat/${data.conversationId}`);
      }
    } catch (err) {
      console.error("Klaida pradedant pokalbį:", err);
    }
  };

  if (!user) return <p>Kraunama...</p>;

  return (
    <UserProfile>
      <img src={user.profileImage || "default-profile.png"} alt={user.username} />
      <div className="username">{user.username}</div>
      <button className="start-chat-button" onClick={startChat}>
        Pradėti pokalbį
      </button>
    </UserProfile>
  );
};

export default ParticularUser;