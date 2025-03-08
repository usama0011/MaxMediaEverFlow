import React, { useState } from "react";
import { Form, Input, DatePicker, Button, message, Select, Table } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import Papa from "papaparse"; // Import for CSV conversion

const { RangePicker } = DatePicker;
const { Option } = Select;

const MailChimpReport = () => {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]); // Store table data

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const [startDate, endDate] = values.dateRange.map((date) =>
        dayjs(date).format("YYYY-MM-DD")
      );

      const payload = {
        timezone_id: values.timezone,
        from: startDate,
        to: endDate,
        offerID: values.offerID, // Send Offer ID
        refreshToken: values.refreshToken,
      };

      const response = await axios.post(
        "https://max-media-ever-flow-59s6.vercel.app/api/fetch-report", // Call your own backend
        payload
      );

      // Extract relevant data for table
      let formattedData = response.data.table.map((item) => ({
        key: item.columns.find((col) => col.column_type === "date")?.id, // Use date as key
        date: dayjs
          .unix(item.columns.find((col) => col.column_type === "date")?.id)
          .format("YYYY-MM-DD"), // Convert Unix timestamp to readable date
        total_clicks: item.reporting.total_click, // Get total clicks
      }));

      // **Sort data by date in ascending order**
      formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));

      // **Group consecutive 4 dates and sum total_clicks**
      let groupedData = [];
      for (let i = 0; i + 3 < formattedData.length; i += 4) {
        const group = formattedData.slice(i, i + 4); // Get a batch of 4 dates
        const totalClicksSum = group.reduce(
          (sum, item) => sum + item.total_clicks,
          0
        );
        groupedData.push({
          key: group[0].date, // Use first date in the group as key
          date: group[0].date, // Show only the first date of the 4-date group
          total_clicks: totalClicksSum,
        });
      }

      setTableData(groupedData);
      message.success("Data fetched successfully!");
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to fetch data.");
    }
    setLoading(false);
  };

  // **Download CSV Function**
  const downloadCSV = () => {
    if (tableData.length === 0) {
      message.error("No data available to download.");
      return;
    }

    const csvData = tableData.map(({ date, total_clicks }) => ({
      "Start Date": date, // Show only first date of 4-day group
      "Total Clicks": total_clicks,
    }));

    const csv = Papa.unparse(csvData); // Convert to CSV format
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "MailChimpReport.csv";
    link.click();
    message.success("CSV file downloaded successfully!");
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Total Clicks",
      dataIndex: "total_clicks",
      key: "total_clicks",
    },
  ];

  return (
    <div className="containerDailyActivity">
      <h2 className="titleDailyAcitvity">MaxMdeia Everflow Fetcher</h2>
      <Form requiredMark={false} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Refresh Token"
          name="refreshToken"
          rules={[
            { required: true, message: "Please enter your Refresh Token" },
          ]}
        >
          <Input placeholder="Enter Refresh Token" />
        </Form.Item>
        <Form.Item
          label="Offer ID"
          name="offerID"
          rules={[{ required: true, message: "Please enter Offer ID" }]}
        >
          <Input placeholder="Enter Offer ID" />
        </Form.Item>

        <Form.Item
          label="Select Date Range"
          name="dateRange"
          rules={[{ required: true, message: "Please select a date range" }]}
        >
          <RangePicker />
        </Form.Item>

        <Form.Item
          label="Timezone ID"
          name="timezone"
          rules={[{ required: true, message: "Please select Timezone ID" }]}
        >
          <Select placeholder="Select Timezone ID">
            <Option value={32}>32 (UTC-5:00)</Option>
            <Option value={1}>1 (UTC+0:00)</Option>
            <Option value={2}>2 (UTC+1:00)</Option>
          </Select>
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={loading}>
          Fetch Data
        </Button>
      </Form>

      <h3 style={{ marginTop: "20px" }}>Report Data</h3>
      <Table columns={columns} dataSource={tableData} pagination={false} />

      {/* Download CSV Button */}
      <Button
        type="default"
        onClick={downloadCSV}
        style={{ marginTop: "20px" }}
      >
        Download CSV
      </Button>
    </div>
  );
};

export default MailChimpReport;
