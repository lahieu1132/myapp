import React, { useState , useEffect} from "react";
import {
  Grid,
  CircularProgress,
  Typography,
  Button,
  Tabs,
  Tab,
  TextField,
  Fade,
} from "@material-ui/core";
import { withRouter } from "react-router-dom";
import axios from "axios";

// styles
import useStyles from "./styles";

// context
import { useUserDispatch, loginUser } from "../../context/UserContext";

function Login(props) {
  var classes = useStyles();

  // global
  var userDispatch = useUserDispatch();

  // local
  var [activeTabId, setActiveTabId] = useState(0);
  var [phoneValue, setPhoneValue] = useState("");
  var [loginValue, setLoginValue] = useState("huydoppa");
  var [passwordValue, setPasswordValue] = useState("0329142620");
  const [emailValue, setEmailValue] = useState("")
  const [loginErrorMessage,setLoginErrorMessage] = useState("")
  const [registErrorMessage,setRegistErrorMessage] = useState("")

  const handleLogin = async () => {
    const data = {
      username: loginValue,
      password: passwordValue,
    }
    await axios.post("http://localhost:8080/api/auth/login", {...data})
    .then((response) => {
      const user = response.data;
      loginUser(
        userDispatch,
        user,
        props.history
      )
      setLoginErrorMessage("")
    })
    .catch(error =>{
      setLoginErrorMessage("Something is wrong with your login or password :(")
    })
  }
  
  const handleRegist = async () => {
    const data = {
      username: loginValue,
      password: passwordValue,
      phone: phoneValue,
      email: emailValue,
    }
    if(!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(passwordValue)) {
      setRegistErrorMessage("Minimum eight characters, at least one letter and one number")
      return
    }
    await axios.post("http://localhost:8080/api/auth/signup", {...data})
        .then((response) => {
          if(response.data.error === 0) setActiveTabId(0) 
          else {
            setRegistErrorMessage(response.data.msg)
          }       
        })
        .catch(error => {
          console.log(error)
    })
  }

  return (
    <Grid container className={classes.container}>
      <div className={classes.formContainer}>
        <div className={classes.form}>
          <Tabs
            value={activeTabId}
            onChange={(e, id) => setActiveTabId(id)}
            indicatorColor="primary"
            textColor="primary"
            centered
          >            <Tab label="Login" classes={{ root: classes.tab }} />
            <Tab label="New User" classes={{ root: classes.tab }} />
          </Tabs>
          {activeTabId === 0 && (
            <React.Fragment>
              <Typography variant="h1" className={classes.greeting}>
                Welcome, Admin
              </Typography>
              <Fade in={true}>
                <Typography color="secondary" className={classes.errorMessage}>
                  {loginErrorMessage}
                </Typography>
              </Fade>
              <TextField
                id="email"
                InputProps={{
                  classes: {
                    underline: classes.textFieldUnderline,
                    input: classes.textField,
                  },
                }}
                value={loginValue}
                onChange={e => setLoginValue(e.target.value)}
                margin="normal"
                placeholder="Username"
                type="text"
                fullWidth
              />
              <TextField
                id="password"
                InputProps={{
                  classes: {
                    underline: classes.textFieldUnderline,
                    input: classes.textField,
                  },
                }}
                value={passwordValue}
                onChange={e => setPasswordValue(e.target.value)}
                margin="normal"
                placeholder="Password"
                type="password"
                fullWidth
              />
              <div className={classes.formButtons}>
                <Button
                    disabled={
                      loginValue.length === 0 || passwordValue.length === 0
                    }
                    onClick={handleLogin}
                    variant="contained"
                    color="primary"
                    size="large"
                  >
                    Login
                </Button>
                <Button
                  color="primary"
                  size="large"
                  className={classes.forgetButton}
                >
                  Forget Password
                </Button>
              </div>
            </React.Fragment>
          )}
          {activeTabId === 1 && (
            <React.Fragment>
              <Typography variant="h1" className={classes.greeting}>
                Welcome!
              </Typography>
              <Typography variant="h2" className={classes.subGreeting}>
                Create your account
              </Typography>
              <Fade in={true}>
                <Typography color="secondary" className={classes.errorMessage}>
                  {registErrorMessage}
                </Typography>
              </Fade>
              <TextField
                id="name"
                InputProps={{
                  classes: {
                    underline: classes.textFieldUnderline,
                    input: classes.textField,
                  },
                }}
                value={phoneValue}
                onChange={e => setPhoneValue(e.target.value)}
                margin="normal"
                placeholder="Phone Number"
                type="text"
                fullWidth
              />
              <TextField
                id="email"
                InputProps={{
                  classes: {
                    underline: classes.textFieldUnderline,
                    input: classes.textField,
                  },
                }}
                value={emailValue}
                onChange={e => setEmailValue(e.target.value)}
                margin="normal"
                placeholder="Email"
                type="email"
                fullWidth
              />
              <TextField
                id="username"
                InputProps={{
                  classes: {
                    underline: classes.textFieldUnderline,
                    input: classes.textField,
                  },
                }}
                value={loginValue}
                onChange={e => setLoginValue(e.target.value)}
                margin="normal"
                placeholder="Username"
                fullWidth
              />
              <TextField
                id="password"
                InputProps={{
                  classes: {
                    underline: classes.textFieldUnderline,
                    input: classes.textField,
                  },
                }}
                value={passwordValue}
                onChange={e => setPasswordValue(e.target.value)}
                margin="normal"
                placeholder="Password"
                type="password"
                fullWidth
              />
              <div className={classes.creatingButtonContainer}>
                <Button
                    onClick={handleRegist}
                    disabled={
                      loginValue.length === 0 ||
                      passwordValue.length === 0 ||
                      phoneValue.length === 0
                    }
                    size="large"
                    variant="contained"
                    color="primary"
                    fullWidth
                    className={classes.createAccountButton}
                  >
                    Create your account
                </Button>
              </div>
              
            </React.Fragment>
          )}
        </div>
        
      </div>
    </Grid>
  );
}

export default withRouter(Login);
