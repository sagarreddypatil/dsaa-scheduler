import { Outlet, useNavigate, useNavigation } from "react-router-dom";

export default function App() {
  const navigation = useNavigation();
  const navigate = useNavigate();

  return (
    <div className="my-4 max-w-xl mx-auto">
      <div className="flex flex-row justify-between mb-2">
        <button className="text-2xl" onClick={() => navigate("/")}>
          schd
        </button>
      </div>
      <hr className="border-gray-500" />
      <br className="h-2" />
      <Outlet />
    </div>
  );
}
