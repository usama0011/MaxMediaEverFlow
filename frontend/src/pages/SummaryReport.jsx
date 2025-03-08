import React, { useState } from "react";
import { Form, Input, DatePicker, Button, message, Select, Table } from "antd";
import axios from "axios";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

const SummaryReport = () => {
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
      };

      const response = await axios.post(
        "http://localhost:5000/api/fetch-report", // Call your own backend
        payload
      );

      // Extract relevant data for table
      const formattedData = response.data.table.map((item) => ({
        key: item.columns.find((col) => col.column_type === "date")?.id, // Use date as key
        date: dayjs
          .unix(item.columns.find((col) => col.column_type === "date")?.id)
          .format("YYYY-MM-DD"), // Convert Unix timestamp to readable date
        total_clicks: item.reporting.total_click, // Get total clicks
      }));

      setTableData(formattedData);
      message.success("Data fetched successfully!");
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to fetch data.");
    }
    setLoading(false);
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
      <h2 className="titleDailyAcitvity">Affiliate Report Fetcher</h2>
      <Form layout="vertical" onFinish={handleSubmit}>
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
      <Table
        columns={columns}
        dataSource={tableData}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default SummaryReport;
