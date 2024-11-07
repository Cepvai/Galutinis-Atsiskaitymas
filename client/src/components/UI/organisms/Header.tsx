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
  background-color: #2d2d2d;
  color: #e3e3e3;
  border-bottom: 2px solid #444;

  h1 {
    font-size: 2rem;
    font-weight: bold;
    margin: 0;
    color: #007bff;
  }

  nav {
    display: flex;
    align-items: center;

    a, button {
      margin-left: 20px;
      font-size: 1rem;
      color: #bbb;
      text-decoration: none;
      background: none;
      border: none;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #007bff;
        text-decoration: none;
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
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-left: 20px;
    border: 2px solid #555;
  }

  span, a {
    font-size: 1.2rem;
    color: #e3e3e3;
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
        {loggedInUser ? (
          <>
            <Link to="/conversations">Pokalbiai {conversationsCount > 0 ? `(${conversationsCount})` : ''}</Link>
            <Link to="/all-users">Visi vartotojai</Link>
            <Link to={`/users/${loggedInUser._id}`}>Specifinis vartotojas</Link>
            <UserContainer>
              <img src={loggedInUser.profileImage || 'default-avatar.png'} alt="Profile" />
              <Link to="/profile">{loggedInUser.username}</Link>
              <button onClick={handleLogout}>Atsijungti</button>
            </UserContainer>
          </>
        ) : (
          <>
            <Link to="/register">Registruotis</Link>
            <Link to="/login">Prisijungti</Link>
          </>
        )}
      </nav>
    </StyledHeader>
  );
};

export default Header;
