import { Navigate, useLocation } from 'react-router-dom'
import { useBusinessAuth } from './BusinessAuthContext'

/** Gate for console routes. Waits for the stored token to be checked so a
 *  refresh doesn't bounce a signed-in owner back to the login screen. */
export default function RequireBusiness({ children }) {
  const { isSignedIn, isReady } = useBusinessAuth()
  const location = useLocation()

  if (!isReady) {
    return <div className="biz-boot">Checking your access&hellip;</div>
  }

  if (!isSignedIn) {
    return <Navigate to="/business/login" replace state={{ from: location.pathname }} />
  }

  return children
}
