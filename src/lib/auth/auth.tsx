import { browserLocalPersistence, browserSessionPersistence, createUserWithEmailAndPassword, FacebookAuthProvider, getRedirectResult, GithubAuthProvider, GoogleAuthProvider, linkWithPopup, OAuthCredential, onAuthStateChanged, setPersistence, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, signOut, TwitterAuthProvider, updateProfile, User, UserCredential } from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";

interface authProps {
  user: User | null;
  register: (registerData: RegisterData) => Promise<User | false>
  signinWithEmail: (loginData: LoginData) => Promise<User | false>;
  signin: (user: User) => Promise<void>
  signinWithSNS: (provider: GoogleAuthProvider | FacebookAuthProvider | TwitterAuthProvider | GithubAuthProvider, providerName: 'google' | 'facebook' | 'twitter' | 'github', isNew?: boolean) => Promise<false | User>
  linkSNS: (provider: GoogleAuthProvider | FacebookAuthProvider | TwitterAuthProvider | GithubAuthProvider, providerName: 'google' | 'facebook' | 'twitter' | 'github') => Promise<false | User>
  signout: () => Promise<boolean>

}

const authContext = createContext<authProps | null>(null);

interface Props {
  children: React.ReactNode
}
const ProvideAuth = ({children}: Props) => {
  const auth = useProvideAuth(); // data about user, e.g) user data, register, login methods ...
  return (
    <authContext.Provider value={auth}>
      {children}
    </authContext.Provider>
  )
}
export default ProvideAuth

export const useAuth = () => { // return context -> components that use this hook have access to data of user
  return useContext(authContext);
}
interface RegisterData {
  username: string,
  email: string,
  password: string
}
interface LoginData {
  email: string,
  password: string
}

const useProvideAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  const register = async (registerData: RegisterData) => {
    if(!registerData.username) {
      const str = "0123456789";
      const len = 6
      let userName = "user_";
      for(let i = 0; i < len; i++){
        userName += str.charAt(Math.floor(Math.random() * str.length));
      }
      registerData.username = userName;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, registerData.email, registerData.password);
      let currentUser = userCredential.user
      if(auth.currentUser) {
        await updateProfile(auth.currentUser, {displayName: registerData.username})
        currentUser = auth.currentUser
        const userData = {
          displayName: currentUser.displayName,
          email: currentUser.email,
          emailVerified: currentUser.emailVerified,
          phoneNumber: currentUser.phoneNumber,
          photoURL: currentUser.photoURL,
          providerData: currentUser.providerData,
          uid: currentUser.uid
        }
        await setDoc(doc(db, "users", currentUser.uid), userData)
      }
      setUser(currentUser);
      return currentUser;
    } catch (e) {
      console.log(e)
      return false
    }
  }

  const signinWithEmail = async (loginData: LoginData) => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      const idToken = await userCredential.user.getIdToken();
      setUser(userCredential.user)
      return userCredential.user
    } catch {
      return false
    }
  }

  const signin = async(user: User) => {
    setUser(user);
  }

  const signinWithSNS = async (
    provider: GoogleAuthProvider | FacebookAuthProvider | TwitterAuthProvider | GithubAuthProvider, 
    providerName: 'google' | 'facebook' | 'twitter' | 'github',
    isNew = true,
  ) => {
    try {
      const result = await signInWithPopup(auth, provider);

      let credential: OAuthCredential | null = null;

      if(providerName == 'google') {
        credential = GoogleAuthProvider.credentialFromResult(result);
      } else if(providerName == 'facebook') {
        credential = FacebookAuthProvider.credentialFromResult(result);
      } else if(providerName == 'twitter') {
        credential = TwitterAuthProvider.credentialFromResult(result);
      } else if(providerName == 'github') {
        credential = GithubAuthProvider.credentialFromResult(result)
      } else {
        console.log('provider name is null')
        return false;
      }
      const token = credential?.accessToken;
      const user = result.user;
      if(isNew) {
        const userData = {
          displayName: user.displayName,
          email: user.email,
          emailVerified: user.emailVerified,
          phoneNumber: user.phoneNumber,
          photoURL: user.photoURL,
          providerData: user.providerData,
          uid: user.uid
        }
        await setDoc(doc(db, "users", user.uid), userData)
      }
      return user;
    } catch (e) {
      console.log(e)
      return false
    }
  }

  const linkSNS = async(
    provider: GoogleAuthProvider | FacebookAuthProvider | TwitterAuthProvider | GithubAuthProvider, 
    providerName: 'google' | 'facebook' | 'twitter' | 'github',
  ) => {
    if(!user) return false;
    try {
      const result = await linkWithPopup(user, provider)
      let credential: OAuthCredential | null = null;
      if(providerName == 'google') {
        credential = GoogleAuthProvider.credentialFromResult(result);
      } else if(providerName == 'facebook') {
        credential = FacebookAuthProvider.credentialFromResult(result);
      } else if(providerName == 'twitter') {
        credential = TwitterAuthProvider.credentialFromResult(result);
      } else if(providerName == 'github') {
        credential = GithubAuthProvider.credentialFromResult(result)
      } else {
        console.log('provider name is null')
        return false;
      }
      const token = credential?.accessToken;
      const newUser = result.user;
      const userData = {
        providerData: newUser.providerData,
      }
      await updateDoc(doc(db, "users", user.uid), userData)
      setUser(newUser);
      return newUser;
    } catch (e) {
      console.log(e)
      return false
    }
  }

  const signout = async () => {
    try {
      await signOut(auth)
      setUser(null);
      return true
    } catch {
      return false
    }
  }

  useEffect(() => {
    onAuthStateChanged(auth, user => {
      if(user) {
        setUser(user)
      } else {
        setUser(null)
      }
    })
  }, []);

  return {
    user,
    register,
    signin,
    signinWithEmail,
    signinWithSNS,
    linkSNS,
    signout,
  }
}