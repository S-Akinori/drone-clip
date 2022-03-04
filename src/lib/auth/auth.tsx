import { browserLocalPersistence, browserSessionPersistence, createUserWithEmailAndPassword, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, setPersistence, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, signOut, updateProfile, User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";

interface authProps {
  user: User | null;
  register: (registerData: RegisterData) => Promise<User | false>
  signinWithEmail: (loginData: LoginData) => Promise<User | false>;
  signin: (user: User) => Promise<void>
  signinWithGoogle: (provider: GoogleAuthProvider) => Promise<false | User>
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

  const signinWithGoogle = async(provider: GoogleAuthProvider, isNew = true) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
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
    signinWithGoogle,
    signout,
  }
}