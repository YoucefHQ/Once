import React from 'react';
import Select from 'react-select';

import withFirebaseAuth, {
  WrappedComponentProps,
} from 'react-with-firebase-auth';
import firebase from 'firebase/app';
import 'firebase/auth';
import firebaseConfig from '../Config/firebaseConfig';

import '../../assets/css/reset.css';
import '../../assets/css/simple-grid.min.css';
import './Options.css';

import { defaultWebsites } from './default-websites';

const firebaseApp = firebase.initializeApp(firebaseConfig);
const firebaseAppAuth = firebaseApp.auth();
const providers = {
  googleProvider: new firebase.auth.GoogleAuthProvider(),
};

const createComponentWithAuth = withFirebaseAuth({
  providers,
  firebaseAppAuth,
});

const Options = ({
  signInWithGoogle,
  signOut,
  user,
}: WrappedComponentProps) => {
  return (
    <React.Fragment>
      {user ? (
        <>
          <div className="row">
            <div className="menu">
              <span>{user.displayName?.split(' ')[0]} ▾</span>
              <ul>
                <a href="mailto:help@onceforchrome.com" target="_blank">
                  <li>Help</li>
                </a>
                <a href="#" onClick={signOut}>
                  <li>Sign out</li>
                </a>
              </ul>
            </div>
            <div className="col-2"></div>
            <div className="col-8">
              <h1>Once</h1>
              <h2 style={{ color: 'black' }}>
                Select the websites you want to spend less time on.
              </h2>
              <MultiSelectWebsites />
              <p>
                You can still access these websites without any time limits.
                However, Once will help you limit your visits to only once per
                hour. So once you are done browsing these websites and as soon
                as you close their tab, you will able to come back after one
                hour.
              </p>
            </div>
            <div className="col-2"></div>
          </div>
        </>
      ) : (
        <>
          <div className="row">
            <div className="col-2"></div>
            <div className="col-8">
              <h1>Once</h1>
              <h2>Welcome to Once!</h2>
              <h3>
                Once is the best way to be productive and limit the usage of
                time-consuming websites.
              </h3>
              <button onClick={signInWithGoogle}>Sign in with Google</button>
            </div>
            <div className="col-2"></div>
          </div>
        </>
      )}
    </React.Fragment>
  );
};

class MultiSelectWebsites extends React.Component {
  state = {
    selectedWebsites: [],
    saveText: 'Save',
  };

  componentDidMount() {
    const blockedWebsites = window.localStorage.getItem('onceBlockedWebsites');
    if (blockedWebsites) {
      this.setState({
        selectedWebsites: JSON.parse(blockedWebsites),
      });
    }
  }

  getBlockedWebsites = () => {
    const blockedWebsites = window.localStorage.getItem('onceBlockedWebsites');
    if (!blockedWebsites) return null;
    else {
      const blockedWebsitesObject = defaultWebsites.filter(function (
        blockedWebsite
      ) {
        return blockedWebsites.includes(blockedWebsite.value);
      });
      return blockedWebsitesObject;
    }
  };

  handleChange = (selectedWebsites: any) => {
    var newSelectedWebsites = [];
    for (
      let index = 0;
      selectedWebsites != null && index < selectedWebsites.length;
      index++
    ) {
      newSelectedWebsites.push(selectedWebsites[index].value);
    }
    this.setState({
      selectedWebsites: newSelectedWebsites,
    });
  };

  saveBlockedWebsites = () => {
    window.localStorage.setItem(
      'onceBlockedWebsites',
      JSON.stringify(this.state.selectedWebsites)
    );
    this.setState({
      saveText: 'Saved!',
    });
  };

  render() {
    return (
      <>
        <Select
          options={defaultWebsites}
          defaultValue={this.getBlockedWebsites()}
          onChange={this.handleChange}
          isMulti
          name="colors"
          className="multi-select"
        />
        <button onClick={() => this.saveBlockedWebsites()}>
          {this.state.saveText}
        </button>
      </>
    );
  }
}

export default createComponentWithAuth(Options);
