import React from "react";
import { AuthContext } from '../../context/authContext';
  
const Menu = ({ handleScroll }) => {
  const { user, logout } = React.useContext(AuthContext);
  const [view, isView] = React.useState(true)

  return (
    <div className="Menu">
      <div className="container__menu">
        <label>Profile</label>
        <div onClick={() => isView(!view)} style={{backgroundColor: user && user.color}} className="user__profile"></div>
        <div style={{display: view ? "none" : "block"}} className="ghost__box-profile">
          <button onClick={() => logout()} className="logout__bttn">Logout</button>
        </div>
      </div>
      <div className="container__menu">
          <h2 className="what">ЧАВО?</h2>
      </div>
      <div className="container__menu">
          <h2 className="what">TOPs</h2>
      </div>
      <button className="scroll-of-drawing" onClick={handleScroll}>
        Scroll or Drawing
      </button>
    </div>
  );
};
  
export default Menu;