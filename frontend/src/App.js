/* ----------------------------------------------------
React.js / Main App.js

Updated: 05/06/2020
Author: Daria Vodzinskaia
Website: www.dariacode.dev
-------------------------------------------------------  */

import React, {Component} from 'react';
import {BrowserRouter, Route, Redirect, Switch} from 'react-router-dom';

import AuthPage from './pages/Auth';
import TasksPage from './pages/Tasks';
import TodayPage from './pages/Today';
import MainNavigation from './components/Navigation/MainNavigation';
import AuthContext from './context/auth-context';

import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#3B8BEB',
          },
        secondary: {
            main: '#FC3C7B',
          },
      },
  });

class App extends Component {
    state = {
        token: null,
        userId: null
    }

    // componentDidMount() executes when the page loads = is invoked immediately
    // after a component is mounted (inserted into the tree).
    componentDidMount() {
        // To check if there is token in user localStorage and 
        // not to force user login again.
        this.refreshToken().then(result => {
            if (result) {
                // The user is authenticated
                let token = JSON.parse(localStorage.getItem("token"));
                //To extract userId from the token 
                let base64Url = token.split(".")[1];
                const base64 = base64Url.replace("-", "+").replace("_", "/");
                const tokenData = JSON.parse(atob(base64));
                let userId = tokenData.userId;
                this.setState({token: token, userId: userId});
            } else {
                // The user is not authenticated
                console.log("ComponentDidMount: the user is not authenticated");
            }
        })
    }

    refreshToken = () => {
        const token = JSON.parse(localStorage.getItem("token"));
        if (token !== null) {
            // TO MAKE FUNCTION FOR CHECKING THE TOKEN'S EXPIRATION DATE
                console.log("refreshToken: access token not expired, nothing to do.");
                return Promise.resolve(true);
        }
        // No tokens found in localStorage
        return Promise.resolve(false);
    };

    login = (token, userId) => {
        localStorage.setItem("token", JSON.stringify(token));
        localStorage.setItem("userId", JSON.stringify(userId));
        this.setState({token: token, userId: userId});
    }

    logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId")
        this.setState({token: null, userId: null});
    }

    // componentWillUnmount() is invoked immediately before a component is unmounted
    // and destroyed. Perform any necessary cleanup in this method, such as
    // invalidating timers, canceling network requests, or cleaning up any
    // subscriptions that were created in componentDidMount().
    // componentWillUnmount() {

    // }

    render() {
        return (
            <BrowserRouter>
                <React.Fragment>
                <ThemeProvider theme={theme}>
                    <AuthContext.Provider
                        value={{
                        token: this.state.token,
                        userId: this.state.userId,
                        login: this.login,
                        logout: this.logout
                    }}>
                        <MainNavigation/>
                        <main className="main-content">
                            <Switch>
                                {this.state.token && <Redirect from="/" to="/tasks" exact/>}
                                {this.state.token && <Redirect from="/auth" to="/tasks" exact/>}
                                {!this.state.token && <Route path="/auth" component={AuthPage}/>}
                                {this.state.token && <Route path="/tasks" component={TasksPage}/>}
                                {this.state.token && <Route path="/today" component={TodayPage}/>}
                                {!this.state.token && <Redirect to="/auth" exact/>}
                            </Switch>
                        </main>
                    </AuthContext.Provider>
                    </ThemeProvider>
                </React.Fragment>
            </BrowserRouter>
        );
    }
}

export default App;
