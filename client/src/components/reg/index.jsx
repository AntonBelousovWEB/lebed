import React from "react";
import axios from "axios";
import { gql, useQuery, useMutation } from '@apollo/client';

const GET_USERS = gql `
  query GetUser {
    getUser {
      name
      color
      level
      guild
    }
  }
`

export function Reg() {
  const [datas, setDatas] = React.useState(null);
  const [selectedColor, setSelectedColor] = React.useState(null);
  const [view, setView] = React.useState(false);

  const { loading, error, data } = useQuery(GET_USERS);
  

  React.useEffect(() => {
      axios
        .get(process.env.REACT_APP_COLOR_LINK)
        .then((response) => {
          setTimeout(() => {
            setDatas(response.data);
            setSelectedColor(response.data[0]);
          }, 500);
        });
  }, []);

  if(loading) return null
  if(error) return "Error: " + error;
  console.log(data);

  // Функция для проверки яркости цвета
  const isTooBright = (hexColor) => {
    const hex = hexColor.replace("#", "");
    const rgb = [
      parseInt(hex.substr(0, 2), 16), 
      parseInt(hex.substr(2, 2), 16), 
      parseInt(hex.substr(4, 2), 16)
    ];
    const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    return brightness > 200;
  };

  const handleColorClick = (color) => {
    setSelectedColor(color);
  };

  return (
    <div className="reg__page">
      {datas ? (
        <div className="registration__form">
          <div className="box__inputs">
            <form className="form__reg">
              <input style={{
                marginTop: "20px"
              }} type="text" placeholder="name" />
              <div className="box__pssword">
                <input
                  className="inpt__password"
                  type={view ? "text" : "password"}
                  placeholder="password"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setView(!view);
                  }}
                  className="button__view"
                ></button>
              </div>
              <button className="reg__bttn">Register</button>
              <a href="https://">Sign in</a>
            </form>
          </div>
          <div className="box__colors">
            {datas &&
              datas.map((color) => {
                if (isTooBright(color.hex)) {
                  return null;
                }
                return (
                  <div className="box__color">
                    <div
                      key={color.name}
                      style={{
                        backgroundColor: color.hex,
                        width: "100px",
                        height: "100px",
                        borderRadius: "10px",
                        backgroundImage:
                          selectedColor === color
                            ? "url(./img/checked.png)"
                            : "none",
                        backgroundPosition: "center",
                        backgroundSize: "50px",
                        backgroundRepeat: "no-repeat",
                      }}
                      onClick={() => handleColorClick(color)}
                    ></div>
                    <p style={{ marginTop: "10px", textAlign: "center", fontFamily: "'Montserrat', sans-serif" }}>
                      {color.hex}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        <h1 className="loading">Loading...</h1>
      )}
    </div>
  );  
}