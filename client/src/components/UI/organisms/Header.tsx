import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import UsersContext from "../../../contexts/UserContext";
import { UsersContextTypes, ConversationType } from "../../../../../server/types";

const StyledHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-bottom: 2px solid #ccc;

  h1 {
    font-size: 2rem;
    font-weight: bold;
    margin: 0;
  }

  nav {
    display: flex;
    align-items: center;

    a, button {
      margin-left: 20px;
      font-size: 1.2rem;
      color: #333;
      text-decoration: none;
      background: none;
      border: none;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }

    button {
      color: #007bff;
    }
  }
`;

const UserContainer = styled.div`
  display: flex;
  align-items: center;

  img {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin-right: 8px;
  }

  span {
    font-size: 1.2rem;
  }
`;

const Header = () => {
  const { loggedInUser, logout } = useContext(UsersContext) as UsersContextTypes;
  const [conversationsCount, setConversationsCount] = useState<number>(0);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    if (!loggedInUser) return;

    const fetchConversationsCount = async () => {
      try {
        const response = await fetch(`http://localhost:5500/api/conversations/${loggedInUser._id}`);

        if (response.status === 404) {
          // Jei pokalbių nėra, nustatome skaičių į 0
          setConversationsCount(0);
          return;
        }

        if (!response.ok) {
          throw new Error('Klaida gaunant pokalbių skaičių');
        }

        const data: ConversationType[] = await response.json();
        setConversationsCount(data.length);
      } catch (err) {
        console.error("Klaida gaunant pokalbių skaičių:", err);
      }
    };

    fetchConversationsCount();
  }, [loggedInUser]);

  return (
    <StyledHeader>
      <h1>Chatas</h1>
      <nav>
        <Link to="/">Home</Link>
        {loggedInUser ? (
          <>
            <Link to="/conversations">Pokalbiai {conversationsCount > 0 ? `(${conversationsCount})` : ''}</Link>
            <Link to="/all-users">Visi vartotojai</Link>
            <UserContainer>
              <img src={loggedInUser.profileImage || 'default-avatar.png'} alt="Profile" />
              <Link to="/profile">{loggedInUser.username}</Link>
              <button onClick={handleLogout}>Logout</button>
            </UserContainer>
          </>
        ) : (
          <>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </nav>
    </StyledHeader>
  );
};

export default Header;
