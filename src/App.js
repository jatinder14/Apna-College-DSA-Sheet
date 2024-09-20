import React, { useEffect, useState } from 'react';
import { initializeSheet, getSheetData, getData } from './Services/service';
import Header from './Components/Header/Header';
import Footer from './Components/Footer/Footer';
import HomePage from './Pages/HomePage/HomePage';
import SheetTopics from './Pages/SheetTopics/SheetTopics';
import ProgressPage from './Pages/ProgressPage/ProgressPage';
import ProblemsSheetPage from './Pages/ProblemsSheetPage/ProblemsSheetPage';
import { Routes, Route } from 'react-router-dom';
import { getHeatmapData, initializeHeatmapData } from "./Services/progress";
import MobileWarning from './Components/MobileWarning/MobileWarning';
import { useForm } from "react-hook-form";
import "./App.css";

function App() {
  // State to track if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  // State to hold the sheets data
  const [sheetsData, setSheetsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [consistencyPoints, setConsistencyPoints] = useState(0);
  const [avgProblems, setAverage] = useState(0);

  // Check if the user is logged in based on localStorage
  useEffect(() => {
    const userData = localStorage.getItem('isLoggedIn');
    if (userData) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    localStorage.setItem('isLoggedIn', true);
    setIsLoggedIn(true);
  };

  // Function to fetch sheets data
  const fetchSheetsData = async () => {
    try {
      getData((data) => {
        const combinedData = data.reduce((acc, sheet) => acc.concat(sheet.data), []);
        setSheetsData(combinedData);
        setLoading(false);
      });
    } catch (error) {
      console.error('Error fetching sheets data:', error);
      setError(error);
      setLoading(false);
    }
  };

  const onSubmit = (data) => {
    const userData = JSON.parse(localStorage.getItem(data.email));
    handleLoginSuccess(); // Call login success handler
    // if (userData) {
    //   if (userData.password === data.password) {
    //     console.log(userData.name + " You Are Successfully Logged In");
    //   } else {
    //     console.log("Email or Password is not matching with our record");
    //   }
    // } else {
    //   console.log("Email or Password is not matching with our record");
    // }
  };

  useEffect(() => {
    if (isLoggedIn) fetchSheetsData();
  }, [reloadTrigger, isLoggedIn]);

  const calculateAverageProblemsSolvedThisMonth = (heatmapData) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    let totalProblems = 0;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const tempMonth = monthNames[currentMonth];

    Object.keys(heatmapData).forEach((month) => {
      if (tempMonth === month) {
        const days = heatmapData[month];
        days.forEach((day) => {
          totalProblems += day;
        });
      }
    });
    return totalProblems;
  };

  const calculateActivityMetrics = (data) => {
    let streak = 0;
    let points = 0;
    const average = calculateAverageProblemsSolvedThisMonth(data);
    Object.keys(data).forEach((month) => {
      const days = data[month];
      days.forEach((day) => {
        if (day > 0) {
          streak += 1;
          points = day * (2 ** streak);
        } else {
          streak = 1;
        }
      });
    });
    setAverage(average);
    setCurrentStreak(streak);
    setConsistencyPoints(points);
  };

  useEffect(() => {
    if (isLoggedIn) {
      const fetchData = async () => {
        await initializeHeatmapData();
        const data = await getHeatmapData();
        calculateActivityMetrics(data);
      };
      fetchData();
    }
  }, [reloadTrigger, isLoggedIn]);

  return (
    <>
      {!isLoggedIn ? (
        <>
          <p className="title">Login Form</p>
          <form className="App" onSubmit={handleSubmit(onSubmit)}>
            <input type="email" {...register("email", { required: true })} />
            {errors.email && <span style={{ color: "red" }}>*Email* is mandatory </span>}
            <input type="password" {...register("password", { required: true })} />
            <input type="submit" style={{ backgroundColor: "#a1eafb" }} onClick={handleSubmit} />
          </form>
        </>
      ) : (
        <div className="main" id="DSAsheets">
          <MobileWarning />
          <Header />
          <Routes>
            <Route path="/" element={<HomePage sheets={sheetsData} currentStreak={currentStreak} consistencyPoints={consistencyPoints} />} />
            <Route path="/sheets/:sheetId/topics" element={<SheetTopics sheets={sheetsData} reload={reloadTrigger} currentStreak={currentStreak} consistencyPoints={consistencyPoints} />} />
            <Route path="/progress" element={<ProgressPage sheets={sheetsData} currentStreak={currentStreak} consistencyPoints={consistencyPoints} avgProblems={avgProblems} />} />
            <Route path="/sheets/:sheetId/topics/:topicId/problems" element={<ProblemsSheetPage sheets={sheetsData} onChecklistChange={() => setReloadTrigger(!reloadTrigger)} currentStreak={currentStreak} consistencyPoints={consistencyPoints} />} />
          </Routes>
          <Footer />
        </div>
      )}
    </>
  );
}

export default App;
