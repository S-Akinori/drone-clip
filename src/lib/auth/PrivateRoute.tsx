import LoginAlert from "../../components/organisms/LoginAlert";
import { useAuth } from "./auth"

interface Props {
  children: React.ReactNode
}

const PrivateRoute = ({children}: Props) => {
  const auth = useAuth();
  if(auth?.user) {
    return (
      <div>
        {children}
      </div>
    )
  } else {
    return (
      <>
        <LoginAlert open={true} />
      </>
    )
  }
}
export default PrivateRoute