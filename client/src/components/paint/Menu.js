import React from "react";
import { AuthContext } from "../../context/authContext";
import { GET_ALL_USERS } from "../../server/query/user";
import { useSubscription } from "@apollo/client";
import { LEVEL_UPDATED } from "../../server/subscription/user";
import { useQuery } from "@apollo/client";
import { useDispatch } from "react-redux";
import { addLevel } from "../../store/actions";
import useToggleState from "../../hooks/useToggleState";
import Chat from "../UI/chat/Chat";

const Menu = ({ handleScroll }) => {
  const { user, logout } = React.useContext(AuthContext);
  const [users, setUsers] = React.useState([]);
  const [lvl, setLvl] = React.useState(null);
  const [curLvl, setCurLvl] = React.useState(null);
  const dispatch = useDispatch()

  const { refetch: refetchUsers } = useQuery(GET_ALL_USERS);
  const { refetch: refetchUserOfName} = useQuery(GET_ALL_USERS, {
    variables: { name: user && user.name },
  });

  const { state: viewUser, toggleState: toggleViewUser, ref: userRef } = useToggleState(true);
  const { state: viewTop, toggleState: toggleViewTop, ref: topRef } = useToggleState(true);
  const { state: viewChat, toggleState: toggleViewChat, ref: chatRef } = useToggleState(true);
  const { state: viewBurger, toggleState: toggleViewBurger, ref: burgerRef } = useToggleState(true);

  useSubscription(LEVEL_UPDATED, {
    onData: ({ data }) => {
        const lvl = data.data.levelUpdated;
        setCurLvl(lvl.level)
        dispatch(addLevel(curLvl));
    },
  });

  React.useEffect(() => {
    refetchUsers().then(({ data }) => {
      const sortedUsers = data.getUser.slice().sort((a, b) => b.level - a.level);
      setUsers(sortedUsers);
    });
    refetchUserOfName().then(({ data }) => {
      setCurLvl(data.getUser[0].level);
      dispatch(addLevel(curLvl));
    })
  }, [refetchUsers, refetchUserOfName, curLvl, dispatch]);

  React.useEffect(() => {
    setLvl(Number.isInteger(curLvl) ? curLvl + 1 : Math.ceil(curLvl));
  }, [curLvl]);

  return (
    <div className="Menu">
      <div className="container__menu">
        <label onClick={toggleViewBurger} ref={burgerRef} className="burger"></label>
      </div>
      <div style={{ display: viewBurger ? "none" : "flex" }} className="ghost__box-burger">
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
          <label>Level</label>
          <progress className="progress_lvl" 
            value={curLvl && curLvl - lvl + 1} 
            max={1} 
          />
          <p>{lvl}</p>
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
                {user.name} - level {Math.floor(user.level)}
              </div>
            ))}
        </div>
      </div>
      <div className="chat_menu">
        <div className="container__menu">
          <h2 onClick={toggleViewChat} ref={chatRef} className="what">
            Чат
          </h2>
        </div>
        <div style={{ display: viewChat ? "none" : "flex" }} className="scroll">
            <Chat sidebar="ph_sidebar" />
        </div>
      </div>
      <button className="scroll-of-drawing" onClick={handleScroll}>
        Scroll or Drawing
      </button>
    </div>
  );
};

export default Menu;