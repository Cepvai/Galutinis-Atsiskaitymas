import styled from 'styled-components';
import { Link } from 'react-router-dom';

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
    a {
      margin-left: 20px;
      font-size: 1.2rem;
      color: #333;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const Header = () => {
  return (
    <StyledHeader>
      <h1>Chatas</h1>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/register">Register</Link>
        <Link to="/login">Login</Link>
      </nav>
    </StyledHeader>
  );
}

export default Header;
