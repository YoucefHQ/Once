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
                <a
                  href="https://chrome.google.com/webstore/detail/cmkicojchpmgdakmdjfhjjibbfmfplep/support"
                  target="_blank"
                >
                  <li>Support</li>
                </a>
                <a
                  href="https://chrome.google.com/webstore/detail/cmkicojchpmgdakmdjfhjjibbfmfplep/support"
                  target="_blank"
                >
                  <li>Feedback</li>
                </a>
                <a
                  href="https://chrome.google.com/webstore/detail/cmkicojchpmgdakmdjfhjjibbfmfplep/reviews"
                  target="_blank"
                >
                  <li>Rate Once</li>
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
                Select the websites that waste your time.
              </h2>
              <MultiSelectWebsites />
              <p>
                Once limits your visits to each of these websites to only once
                per hour. The timer starts when you close the tab of one of
                these websites and only applies to the websites' homepages.
              </p>
            </div>
            <div className="col-2"></div>
          </div>
        </>
      ) : (
        <>
          <div className="row">
            <div className="menu">
              <span>Guest ▾</span>
              <ul>
                <a
                  href="https://chrome.google.com/webstore/detail/cmkicojchpmgdakmdjfhjjibbfmfplep/support"
                  target="_blank"
                >
                  <li>Support</li>
                </a>
              </ul>
            </div>
            <div className="col-2"></div>
            <div className="col-8">
              <h1>Once</h1>
              <h2>Welcome to Once!</h2>
              <h3>
                Take control of your digital life, and stay focused by limiting
                the time spent on distracting websites.
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
    if (this.state.saveText == 'Saved!') {
      this.setState({
        saveText: 'Save',
      });
    }
    for (
      let index = 0;
      selectedWebsites != null && index < selectedWebsites.length;
      index++
    ) {
      newSelectedWebsites.push(selectedWebsites[index].value);
      if (selectedWebsites[index].label == 'Twitter') {
        newSelectedWebsites.push('https://twitter.com/home');
      } else if (selectedWebsites[index].label == 'Reddit') {
        newSelectedWebsites.push('https://old.reddit.com/');
      }
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

    const previouslyBlockedWebsites = defaultWebsites.filter(
      (blockedWebsite) =>
        !this.state.selectedWebsites.includes(blockedWebsite.value as never) &&
        window.localStorage.getItem(blockedWebsite.label) !== null
    );
    for (
      let index = 0;
      previouslyBlockedWebsites != null &&
      index < previouslyBlockedWebsites.length;
      index++
    ) {
      window.localStorage.removeItem(previouslyBlockedWebsites[index].label);
    }

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
