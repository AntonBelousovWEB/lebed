import React from "react";
import axios from "axios";
import { REGISTER_USER } from '../../../server/mutation/user';
import { ADD_MESSAGE } from "../../../server/mutation/addMessage";
import { useMutation } from '@apollo/client';
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/authContext";
import useEncryption from "../../encrypt/funcs";

const RegistrationForm = ({ 
    setName, 
    setPassword, 
    nextStep 
  }) => (
  <div className="wrapper_box">
    <div className="box__inputs">
      <form className="form__reg">
        <h2 className="reg_title">Registartion | Step 1</h2>
        <input 
          style={{
            marginTop: "4px"
          }} 
          type="text" 
          placeholder="name"
          onChange={(e) => setName(e.target.value)}
        />
        <div className="box__pssword">
          <input
            onChange={(e) => setPassword(e.target.value)}
            className="inpt__password"
            type="password"
            placeholder="password"
          />
        </div>
        <div style={{"display": "flex", "gap": "5px"}}>
          <h2 className="text_sign-in">Already have account?</h2>
          <Link to="/auth">Sign in</Link>
        </div>
      </form>
    </div>
    <div>
      <button 
        onClick={() => nextStep(prev => prev + 1)}
        className="reg__bttn"
      ><img src="./img/chevron-double-up.svg" alt="" /></button>
    </div>
  </div>
);

const ColorSelection = ({ 
    datas, 
    selectedColor, 
    handleColorClick, 
    isTooBright, 
    registerUser 
  }) => (
  <div className="pickcolor_box">
    <div className="step_box">
      <div>
        <h2 className="reg_title">Registartion | Step 2</h2>
        <h2 className="reg_desc">Pick your color</h2>
      </div>
      <button 
        onClick={(e) => registerUser(e)} 
        className="complete_reg"
      >
        Complete
      </button>
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
                  maxWidth: "100%",
                  minWidth: "90px",
                  height: "100px",
                  borderRadius: "4px",
                  backgroundImage:
                    selectedColor === color
                      ? "url(./img/checks.svg)"
                      : "none",
                  backgroundPosition: "center",
                  backgroundSize: "50px",
                  backgroundRepeat: "no-repeat",
                }}
                onClick={() => handleColorClick(color)}
              ></div>
              <p style={{ 
                marginTop: "10px", 
                textAlign: "center", 
                fontFamily: "'Montserrat', sans-serif", 
                color: "#fff"
              }}>
                {color.hex}
              </p>
            </div>
          )
        })}
    </div>
  </div>
);

export function Reg() {
  const [datas, setDatas] = React.useState(null);
  const [selectedColor, setSelectedColor] = React.useState(null);
  const [error, setError] = React.useState("");
  const [enData, setEnData] = React.useState(null);
  const { encryptData } = useEncryption(process.env.REACT_APP_PUBLIC_KEY);
  const [nextStep, setNextStep] = React.useState(1)
  
  const { login, user } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  
  const [regUser] = useMutation(REGISTER_USER, {
    variables: {
      key: {
        id: enData && enData.id,
      },
    },
  });  

  const [addMessage] = useMutation(ADD_MESSAGE);

  React.useEffect(() => {
    if(user) {
      navigate('/draw')
    }
  }, [user, navigate])

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

    const encryptedData = encryptData(process.env.REACT_APP_SECRET_KEY);
    setEnData(encryptedData);

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
        setName("");
        setPassword("");
  
        localStorage.setItem("token", data.registerUser.tokenJWT);
        login(data.registerUser);
        addMessage({
          variables: {
            addMessageInput: {
              color: selectedColor.hex,
              message: `<green>[ I'm new here, welcome ${name}! ]</green>`,
            },
          },
        })
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
          {nextStep === 1 ? (
            <RegistrationForm 
              setName={setName} 
              setPassword={setPassword} 
              nextStep={setNextStep} 
            />
          ) : (
            <ColorSelection
              datas={datas}
              selectedColor={selectedColor}
              handleColorClick={handleColorClick}
              isTooBright={isTooBright}
              registerUser={registerUser}
            />
          )}
        </div>
      ) : (
        <h1 className="loading">Loading...</h1>
      )}
    </div>
  );  
}