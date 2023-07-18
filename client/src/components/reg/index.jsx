import React, { useContext } from "react";
import axios from "axios";
import { REGISTER_USER, LOGIN_USER } from '../../mutation/user';
import { useMutation } from '@apollo/client';
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";

export function Reg() {
  const [datas, setDatas] = React.useState(null);
  const [selectedColor, setSelectedColor] = React.useState(null);
  const [view, setView] = React.useState(false);
  const [error, setError] = React.useState("");
  
  const { login } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [regUser] = useMutation(REGISTER_USER);

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

  const registerUser = (e) => {
    e.preventDefault();
  
    regUser({
      variables: {
        registerUserInput: {
          color: selectedColor.hex,
          name,
          password,
        },
      },
    })
      .then(({ data }) => {
        console.log(data);
        setName("");
        setPassword("");
  
        // Saving token to local storage
        localStorage.setItem("token", data.registerUser.tokenJWT);
  
        // Logging in the user
        login(data.registerUser);
  
        navigate("/draw");
      })
      .catch((err) => {
        setError(err.toString());
      });
  };

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
          <div className="Errors">{error.toString()}</div>
          <div className="box__inputs">
            <form className="form__reg">
              <input 
                style={{
                  marginTop: "20px"
                }} 
                type="text" 
                placeholder="name"
                onChange={e => setName(e.target.value)}
              />
              <div className="box__pssword">
                <input
                  onChange={e => setPassword(e.target.value)}
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
              <button onClick={(e) => registerUser(e)} className="reg__bttn">Register</button>
              <Link to="/auth">Sign in</Link>
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