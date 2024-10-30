import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { UserType } from "../../../../server/types";

const UserCard = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  margin: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  
  img {
    border-radius: 50%;
    width: 50px;
    height: 50px;
    margin-right: 20px;
  }

  .username {
    font-size: 1.5rem;
    font-weight: bold;
  }
`;

const AllUsers = () => {
  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    // API užklausa vartotojams gauti
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
    <div>
      <h2>Visi vartotojai</h2>
      {users.map((user) => (
        <Link key={user._id.toString()} to={`/users/${user._id}`}>
          <UserCard>
            <img src={user.profileImage || "default-profile.png"} alt={user.username} />
            <div className="username">{user.username}</div>
          </UserCard>
        </Link>
      ))}
    </div>
  );
};

export default AllUsers;