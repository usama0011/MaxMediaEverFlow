import React from "react";
import { Link } from "react-router-dom";

import "./App.css";

const App = () => {
  return (
    <div className="app-container">
      <h1 className="title">Select Report Type</h1>
      <div className="cards-container">
        {/* Card 1: Daily Activity Report */}
        <Link to="/daily-activity" className="card">
          <img
            src="https://images.unsplash.com/photo-1669399213378-2853e748f217?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Daily Activity Report"
          />
          <h2>Daily Activity Generate Report</h2>
        </Link>

        {/* Card 2: Summary Report */}
        <Link to="/summary-report" className="card">
          <img
            src="https://images.unsplash.com/photo-1669399213378-2853e748f217?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Summary Report"
          />
          <h2>Summary Generate Report</h2>
        </Link>

        {/* Card 3: MailChimp Report */}
        <Link to="/mailchimp-report" className="card">
          <img
            src="https://images.unsplash.com/photo-1669399213378-2853e748f217?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="MailChimp Report"
          />
          <h2>MailChimp Data Generate Report</h2>
        </Link>
      </div>
    </div>
  );
};

export default App;
