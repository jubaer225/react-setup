import { RouterProvider } from "react-router-dom";
import router from "./routes.jsx";
import { useDispatch, useSelector } from "react-redux";
import { refreshToken } from "./features/auth/register-slice";
import { useEffect } from "react";

function App() {
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.register.accessToken);

  useEffect(() => {
    if (!accessToken) {
      dispatch(refreshToken());
    }
  }, [accessToken, dispatch]);

  return <RouterProvider router={router} />;
}

export default App;
