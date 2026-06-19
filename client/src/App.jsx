import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import axios from "axios";
import { ServerUrl } from "./utils/constants.js";
import { useDispatch } from "react-redux";
import { setUserData } from "./redux/userSlice.js";
import Interview from "./pages/Interview.jsx";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await axios.get(
          `${ServerUrl}/api/user/current-user`,
          {
            withCredentials: true,
          }
        );

        dispatch(setUserData(data.user || data));
      } catch (error) {
        console.error(
          "Error fetching current user:",
          error.response?.data || error.message
        );

        dispatch(setUserData(null));
      }
    };

    getUser();
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Login />} />
      <Route path="/interview" element={<Interview />} />
    </Routes>
  );
}

export default App;