import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserType } from "../../../../server/types";
import styled from "styled-components";
import UsersContext from "../../contexts/UserContext";

const UserProfile = styled.div`
  max-width: 500px;
  margin: auto;
  padding: 40px;
  background: linear-gradient(145deg, #3a3a3a, #1a1a1a);
  border-radius: 12px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
  text-align: center;
  color: #f3f3f3;

  img {
    border-radius: 50%;
    width: 120px;
    height: 120px;
    border: 3px solid #007bff;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
    margin-bottom: 15px;
  }

  .username {
    font-size: 2.2rem;
    font-weight: bold;
    margin-top: 10px;
    color: #e3e3e3;
  }

  .start-chat-button {
    margin-top: 25px;
    padding: 12px 24px;
    font-size: 1.1rem;
    font-weight: bold;
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 10px rgba(0, 123, 255, 0.3);
    }
  }
`;
const ProfileContainer = styled.section`
  align-items: center;
  height: 100vh;
  background-color: #1c1c1e;
  color: #eaeaea;
`;

const ParticularUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const { loggedInUser } = useContext(UsersContext) || {};

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
    if (!loggedInUser || !id) return;

    try {
      const response = await fetch("http://localhost:5500/api/conversations/check-or-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user1Id: loggedInUser._id, user2Id: id }),
      });

      const { conversationId } = await response.json();
      if (response.ok) {
        navigate(`/chat/${conversationId}`);
      } else {
        console.error("Klaida nukreipiant į pokalbį:", response.statusText);
      }
    } catch (error) {
      console.error("Klaida pradedant pokalbį:", error);
    }
  };

  if (!user) return <p>Kraunama...</p>;

  return (
    <ProfileContainer>
    <UserProfile>
      <img src={user.profileImage || "default-profile.png"} alt={user.username} />
      <div className="username">{user.username}</div>
      <button className="start-chat-button" onClick={startChat}>
        Pradėti pokalbį
      </button>
    </UserProfile>
    </ProfileContainer>
  );
};

export default ParticularUser;
