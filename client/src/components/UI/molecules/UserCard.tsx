import { Link } from "react-router-dom";
import styled from "styled-components";
import { UserType } from "../../../../../types";

const Card = styled.div`
  width: 150px;
  padding: 10px;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 10px;
  }

  h3 {
    font-size: 1.1rem;
    margin: 0;
  }

  a {
    text-decoration: none;
    color: #007bff;
    &:hover {
      text-decoration: underline;
    }
  }
`;

interface UserCardProps {
  user: UserType;
}

const UserCard = ({ user }: UserCardProps) => {
  return (
    <Card>
      <Link to={`/users/${user._id}`}>
        <img src={user.profileImage} alt={`${user.username} avatar`} />
        <h3>{user.username}</h3>
      </Link>
    </Card>
  );
};

export default UserCard;