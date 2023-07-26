import React from "react"
import { LOGIN_USER } from "../../mutation/user";
import { AuthContext } from "../../context/authContext";
import { useMutation } from '@apollo/client';
import { Link, useNavigate } from "react-router-dom";

export const Auth = () => {
    const [logUser] = useMutation(LOGIN_USER);

    const [name, setName] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");
    const [view, setView] = React.useState(false);

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
              <div className="box__inputs-sign">
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
                  <button onClick={(e) => loginUser(e)} className="reg__bttn">Sign in</button>
                  <Link to="/">Registration</Link>
                </form>
              </div>
            </div>
        </div>
    );  
}