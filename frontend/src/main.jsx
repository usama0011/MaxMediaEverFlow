import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import DailyActivity from "./pages/DailyActivity";
import SummaryReport from "./pages/SummaryReport";
import MailChimpReport from "./pages/MailChimpReport";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/daily-activity" element={<DailyActivity />} />
        <Route path="/summary-report" element={<SummaryReport />} />
        <Route path="/mailchimp-report" element={<MailChimpReport />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
