import React, { useState } from 'react';
import withFirebaseAuth, {
  WrappedComponentProps,
} from 'react-with-firebase-auth';
import firebase from 'firebase/app';
import 'firebase/auth';
import firebaseConfig from '../Config/firebaseConfig';

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
  const getWebsites = () => {
    const websites = window.localStorage.getItem('once_websites');

    if (!websites) {
      const default_websites = [
        {
          display_name: '9gag',
          url: 'https://9gag.com/',
          blocked: false,
          last_visited: 0,
        },
        {
          display_name: 'BuzzFeed',
          url: 'https://www.buzzfeed.com/',
          blocked: false,
          last_visited: 0,
        },
        {
          display_name: 'CNN',
          url: 'https://www.cnn.com/',
          blocked: false,
          last_visited: 0,
        },
        {
          display_name: 'Facebook',
          url: 'https://www.facebook.com/',
          blocked: false,
          last_visited: 0,
        },
        {
          display_name: 'Feedly',
          url: 'https://feedly.com/i/my',
          blocked: false,
          last_visited: 0,
        },
        {
          display_name: 'Instagram',
          url: 'https://www.instagram.com/',
          blocked: false,
          last_visited: 0,
        },
        {
          display_name: 'Reddit',
          url: 'https://www.reddit.com/',
          blocked: false,
          last_visited: 0,
        },
        {
          display_name: 'Twitter',
          url: 'https://twitter.com/home',
          blocked: false,
          last_visited: 0,
        },
        {
          display_name: 'Pinterest',
          url: 'https://www.pinterest.com/',
          blocked: false,
          last_visited: 0,
        },
        {
          display_name: 'Tiktok',
          url: 'https://www.tiktok.com/',
          blocked: false,
          last_visited: 0,
        },
        {
          display_name: 'Youtube',
          url: 'https://www.youtube.com/',
          blocked: false,
          last_visited: 0,
        },
      ];

      window.localStorage.setItem(
        'once_websites',
        JSON.stringify(default_websites)
      );

      return default_websites;
    }

    return JSON.parse(websites);
  };

  const getblockedWebsitesValues = () => {
    const blockedWebsitesValues: string[] = [];
    websites.map((d: { url: string; blocked: boolean }) =>
      d.blocked ? blockedWebsitesValues.push(d.url) : ''
    );
    return blockedWebsitesValues;
  };

  const saveWebsites = (
    blockedWebsites: HTMLCollectionOf<HTMLOptionElement>
  ) => {
    const websites = getWebsites();
    const newblockedWebsites: string[] = [];
    Array.from(blockedWebsites).forEach(function (element) {
      newblockedWebsites.push(element.value);
    });
    websites.map((d: { url: string; blocked: boolean }) => {
      if (newblockedWebsites.includes(d.url) && d.blocked == false) {
        d.blocked = true;
      } else if (!newblockedWebsites.includes(d.url) && d.blocked == true) {
        d.blocked = false;
      }
    });
    window.localStorage.setItem('once_websites', JSON.stringify(websites));
    setWebsites(websites);
  };

  const [websites, setWebsites] = useState(getWebsites());

  return (
    <React.Fragment>
      {user ? (
        <>
          <h1>Hi, {user.displayName?.split(' ')[0]}!</h1>
          <h2>Select the websites you'd like to limit the usage of.</h2>
          <p>
            Don't worry, you will still access those websites. The only
            difference is that you will be able to visit them only once per
            hour.
          </p>
          <select
            name="websites"
            size={Object.keys(websites).length}
            multiple
            defaultValue={getblockedWebsitesValues()}
            onChange={(e) => saveWebsites(e.target.selectedOptions)}
          >
            {websites.map((d: { display_name: string; url: string }) => (
              <option key={d.url} value={d.url}>
                {d.display_name}
              </option>
            ))}
          </select>
          <br />
          <br />
          <button className="small" onClick={signOut}>
            Sign out
          </button>
          <ul></ul>
        </>
      ) : (
        <>
          <h1>Get started with Once.</h1>
          <button className="primary" onClick={signInWithGoogle}>
            Sign in with Google
          </button>
        </>
      )}
    </React.Fragment>
  );
};

export default createComponentWithAuth(Options);
