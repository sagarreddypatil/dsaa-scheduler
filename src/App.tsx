import { Outlet, useNavigate, useNavigation } from "react-router-dom";
import { pb } from "./Login";
import { useEffect } from "react";
import { Button } from "./controls/button";

export default function App() {
  const navigation = useNavigation();
  const navigate = useNavigate();

  useEffect(() => {
    // if not logged in, redirect to login page
    if (!pb.authStore.isValid) {
      navigate("/login");
    }
  });

  const logout = () => {
    pb.authStore.clear();
    navigate("/login");
  };

  return (
    <div className="my-4 max-w-xl mx-auto px-2">
      <div className="flex flex-row justify-between mb-2">
        <button className="text-2xl" onClick={() => navigate("/")}>
          schd
        </button>
        <Button onClick={logout}>Logout</Button>
      </div>
      <hr className="border-gray-500" />
      <br className="h-2" />
      <Outlet />
    </div>
  );
}
