import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserType } from "../../../../server/types";
import styled from "styled-components";
import UsersContext from "../../contexts/UserContext";

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