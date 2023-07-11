import React from "react";
  
const Menu = ({ handleScroll }) => {
  return (
    <div className="Menu">
      <div className="container__menu">
        <label>Profile</label>
        <div className="user__profile"></div>
      </div>
      <div className="container__menu">
          <h2 className="what">ЧАВО?</h2>
      </div>
      <button className="scroll-of-drawing" onClick={handleScroll}>
        Scroll or Drawing
      </button>
    </div>
  );
};
  
export default Menu;