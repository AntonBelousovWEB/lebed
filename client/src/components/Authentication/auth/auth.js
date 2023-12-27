import React from "react"
import { LOGIN_USER } from "../../../server/mutation/user";
import { AuthContext } from "../../../context/authContext";
import { useMutation } from '@apollo/client';
import { Link, useNavigate } from "react-router-dom";

export const Auth = () => {
    const [logUser] = useMutation(LOGIN_USER);

    const [name, setName] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");

    const { login, user } = React.useContext(AuthContext);
    const navigate = useNavigate();

    React.useEffect(() => {
      if(user) {
        navigate('/draw')
      }
    }, [user, navigate])

    const loginUser = (e) => {
        e.preventDefault();
      
        logUser({
          variables: {
            loginUserInput: {
              name,
              password,
            },
          },
        }).then(({ data }) => {
            setName("");
            setPassword("");
      
            localStorage.setItem("token", data.loginUser.tokenJWT);
            login(data.loginUser);
      
            navigate("/draw");
          })
          .catch((err) => {
            setError(err.toString());
          });
    };

    return (
        <div className="reg__page">
            <div className="registration__form">
              <div className="Errors">{error.toString()}</div>
              <div className="wrapper_box">
                <div className="box__inputs-sign">
                  <form className="form__reg">
                    <h2 className="reg_title">Sign in</h2>
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
                        type={"password"}
                        placeholder="password"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                        className="button__view"
                      ></button>
                    </div>
                    <div style={{"display": "flex", "gap": "5px"}}>
                      <h2 className="text_sign-in">Don't have account?</h2>
                      <Link to="/">Registration</Link>
                    </div>
                  </form>
                </div>
                <div>
                  <button 
                    onClick={(e) => loginUser(e)}
                    className="reg__bttn"
                  ><img src="./img/chevron-double-up.svg" alt="" /></button>
                </div>
              </div>
            </div>
        </div>
    );  
}