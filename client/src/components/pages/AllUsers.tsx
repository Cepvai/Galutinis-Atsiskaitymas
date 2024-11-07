import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { UserType } from "../../../../server/types";

const ProfileContainer = styled.section`
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #1c1c1e;
  color: #eaeaea;
`;

const Container = styled.div`
  max-width: 400px;
  margin: auto;
  padding: 20px;
  text-align: center;
  background-color: #1a1a1d;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  color: #e0e0e0;
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  margin: 15px 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #333, #1f1f1f);
  transition: transform 0.2s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
    background-color: #333;
    box-shadow: 0 8px 16px rgba(0, 123, 255, 0.3);
  }

  img {
    border-radius: 50%;
    width: 60px;
    height: 60px;
    margin-right: 20px;
    border: 2px solid #007bff;
  }

  .username {
    font-size: 1.25rem;
    font-weight: bold;
    color: #f0f0f0;
  }

  .details {
    font-size: 0.9rem;
    color: #aaa;
  }
`;

const AllUsers = () => {
  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5500/api/users");
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error("Klaida gaunant vartotojus:", err);
      }
    };

    fetchUsers();
  }, []);

  return (
    <ProfileContainer>
    <Container>
      <h2>Visi vartotojai</h2>
      {users.map((user) => (
        <Link key={user._id.toString()} to={`/users/${user._id}`} style={{ textDecoration: 'none' }}>
          <UserCard>
            <img src={user.profileImage || "default-profile.png"} alt={user.username} />
            <div>
              <div className="username">{user.username}</div>
            </div>
          </UserCard>
        </Link>
      ))}
    </Container>
    </ProfileContainer>
  );
};

export default AllUsers;
