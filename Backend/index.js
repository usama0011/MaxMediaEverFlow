import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors()); // Allow frontend requests
app.get("/", (req, res, next) => {
  console.log(process.env.BEARER_TOKEN);
  res.send({ success: "yessen", token: process.env.BEARER_TOKEN });
});
app.post("/api/fetch-report", async (req, res) => {
  try {
    const { timezone_id, from, to, offerID, refreshToken } = req.body;

    const payload = {
      timezone_id,
      currency_id: "USD",
      from,
      to,
      columns: [{ column: "offer" }, { column: "date" }],
      query: {
        filters: [{ resource_type: "offer", filter_id_value: offerID }],
        exclusions: [],
        metric_filters: [],
        user_metrics: [],
        settings: {},
      },
    };

    const response = await axios.post(
      "https://api.eflow.team/v1/affiliates/reporting/entity",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${refreshToken}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Server error",
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
