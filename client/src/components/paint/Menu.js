import React from "react";
import { AuthContext } from "../../context/authContext";
import { GET_ALL_USERS } from "../../query/user";
import { useQuery } from "@apollo/client";
import useToggleState from "../../hooks/useToggleState";

const Menu = ({ handleScroll }) => {
  const { user, logout } = React.useContext(AuthContext);
  const [users, setUsers] = React.useState([]);

  const { refetch: refetchUsers } = useQuery(GET_ALL_USERS);

  const { state: viewUser, toggleState: toggleViewUser, ref: userRef } = useToggleState(true);
  const { state: viewTop, toggleState: toggleViewTop, ref: topRef } = useToggleState(true);

  React.useEffect(() => {
    refetchUsers().then(({ data }) => {
      const sortedUsers = data.getUser.slice().sort((a, b) => b.level - a.level);
      setUsers(sortedUsers);
    });
  }, [refetchUsers]);

  return (
    <div className="Menu">
      <div className="container__menu">
        <label>Profile</label>
        <div
          onClick={toggleViewUser}
          style={{ backgroundColor: user && user.color }}
          className="user__profile"
          ref={userRef}
        ></div>
        <div 
          style={{ display: viewUser ? "none" : "block" }} 
          className="ghost__box-profile">
          <button onClick={() => logout()} className="logout__bttn">
            Logout
          </button>
        </div>
      </div>
      <div className="container__menu">
        <h2 className="what">ЧАВО?</h2>
      </div>
      <div className="container__menu">
        <h2 onClick={toggleViewTop} ref={topRef} className="what">
          TOPs
        </h2>
      </div>
      <div style={{ display: viewTop ? "none" : "flex" }} className="box scroll">
        {users &&
          users.map((user) => (
            <div 
              className="flexbox-container__users-tops" 
              key={user.__typename + user.name}>
              <div 
                style={{ backgroundColor: user.color }} 
                className="user__profile-tops">
              </div>
              {user.name} - level {user.level}
            </div>
          ))}
      </div>
      <button className="scroll-of-drawing" onClick={handleScroll}>
        Scroll or Drawing
      </button>
    </div>
  );
};

export default Menu;