import { useEffect } from "react";
import { useSelector } from "react-redux";
import Login from "../pages/Login";

function AuthModel({ onClose }) {
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (userData) {
      onClose();
    }
  }, [userData, onClose]);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center  backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md">

        <Login isModel={true} />
      </div>
    </div>
  );
}

export default AuthModel;