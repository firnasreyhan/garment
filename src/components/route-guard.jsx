import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getToken } from "../utils/tokenManager";

export default function RouteGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = getToken();

  useEffect(() => {
    if (!token) {
      navigate("/sign-in");
    }
  }, [navigate, token, location.pathname]);

  return <Outlet />;
}
