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

  // Function to generate a random number between 1.24 and 1.66
  const getRandomDivisor = () =>
    (Math.random() * (1.66 - 1.16) + 1.16).toFixed(2);

  // Function to generate a random number between 4.4 and 7.4
  const getRandomClicksDivisor = () =>
    (Math.random() * (6.9 - 3.4) + 3.4).toFixed(2);
  const getRandomTime = () => {
    const hours = Math.floor(Math.random() * 24); // Random hour (0-23)
    const minutes = Math.floor(Math.random() * 60); // Random minutes (0-59)
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  };
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
      const getRandomDeliveryReduction = () =>
        Math.floor(Math.random() * (300 - 60) + 60);

      // Function to generate a random time in HH:mm format
      const getRandomTime = () => {
        const hours = Math.floor(Math.random() * 24); // Random hour (0-23)
        const minutes = Math.floor(Math.random() * 60); // Random minutes (0-59)
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
          2,
          "0"
        )}`;
      };

      let formattedData = response.data.table.map((item) => {
        const totalClicks = item.reporting.total_click; // Get total clicks
        const successfulDeliveries = totalClicks - getRandomDeliveryReduction();
        const divisor = getRandomDivisor(); // Generate a random divisor
        // for Opened
        const clicksDivisor = getRandomClicksDivisor(); // Generate a random divisor for Clicks
        const opened = Math.floor(totalClicks / divisor); // Calculate Opened
        const clicks = Math.floor(totalClicks / clicksDivisor); // Calculate Clicks
        const openedPercentage = Math.round((opened / totalClicks) * 100); // Rounded Opened Percentage
        const clickPercentage = Math.round((clicks / totalClicks) * 100); // Rounded Clicked Percentage

        // Generate Last Edit Date (2 days later + random time)
        const lastEditDate =
          dayjs
            .unix(item.columns.find((col) => col.column_type === "date")?.id)
            .add(2, "day") // Add 2 days
            .format("ddd MMMM D, YYYY") + ` ${getRandomTime()}`; // Append random time

        // Generate Last Opened Date (1 day after Last Edit Date + random time)
        const lastOpenedDate =
          dayjs(lastEditDate, "ddd MMMM D, YYYY HH:mm")
            .add(1, "day") // Add 1 day
            .format("MM/DD YYYY") + ` ${getRandomTime()}`; // Append random time

        return {
          key: item.columns.find((col) => col.column_type === "date")?.id, // Use date as key
          date: dayjs
            .unix(item.columns.find((col) => col.column_type === "date")?.id)
            .format("YYYY-MM-DD"), // Convert Unix timestamp to readable date
          sendTime:
            dayjs
              .unix(item.columns.find((col) => col.column_type === "date")?.id)
              .format("ddd MMMM D, YYYY") +
            " " +
            getRandomTime(), // Append random time
          lastEditDate, // Now includes random time
          lastOpenedDate, // Now includes random time
          total_clicks: totalClicks, // Audience Recipients
          opened, // Opened value
          clicks, // Clicks value
          openedPercentage, // Rounded Opened Percentage
          clickPercentage,
          successfulDeliveries,
        };
      });

      // **Sort data by date in ascending order**
      formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));

      // **Group consecutive 4 dates and sum total_clicks**
      let groupedData = [];
      for (let i = 0; i + 3 < formattedData.length; i += 4) {
        const group = formattedData.slice(i, i + 4); // Get a batch of 4 dates
        const totalClicksSum =
          group.reduce((sum, item) => sum + item.total_clicks, 0) + 1000;

        const totalOpenedSum = group.reduce(
          (sum, item) => sum + item.opened,
          0
        );
        const totalClicksSumNew = group.reduce(
          (sum, item) => sum + item.clicks,
          0
        );
        const openedPercentage = Math.round(
          (totalOpenedSum / totalClicksSum) * 100
        ); // Rounded Opened Percentage
        const clickedPercentage = Math.round(
          (totalClicksSumNew / totalClicksSum) * 100
        );

        groupedData.push({
          key: group[0].date, // Use first date in the group as key
          date: group[0].date, // Show only the first date of the 4-date group
          sendTime: group[0].sendTime,
          successfulDeliveries: group[0].successfulDeliveries,
          lastEditDate: dayjs(group[0].date)
            .add(2, "day")
            .format("ddd MMMM D, YYYY HH:mm"), // Ensure it's 2 days later
          // Ensure Last Opened Date is 1 day after Last Edit Date
          lastOpenedDate: dayjs(group[0].lastEditDate)
            .add(1, "day")
            .format("MM/DD HH:mm"),

          total_clicks: totalClicksSum, // Audience Recipients
          opened: totalOpenedSum, // Opened (sum of the grouped opened values)
          clicks: totalClicksSumNew, // Clicks (sum of the grouped clicks values)
          openedPercentage, // Rounded Opened Percentage
          clickedPercentage,
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

    const csvData = tableData.map(
      ({
        date,
        total_clicks,
        opened,
        clicks,
        openedPercentage,
        clickedPercentage,
        sendTime,
        lastEditDate,
      }) => ({
        "Delivered Date": date, // Show only first date of 4-day group
        sendTime: sendTime, // Show only first date of 4-day group
        "Last Edit Date": lastEditDate, // Include in CSV
        "Last Opened Date": lastOpenedDate,
        "Total Clicks (Audience Recipients)": total_clicks,
        Opened: opened, // Opened column
        Clicks: clicks, // Clicks column
        "Opened Percentage(%)": `${Math.round(openedPercentage)}`, // Ensure it's rounded
        "Clicked Percentage(%)": `${Math.round(clickedPercentage)}`, // Ensure it's rounded
        successfulDeliveries: successfulDeliveries,
      })
    );

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
      title: "Deliverd Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Send Time",
      dataIndex: "sendTime",
      key: "sendTime",
    },
    {
      title: "Last Edit Date", // New Column
      dataIndex: "lastEditDate",
      key: "lastEditDate",
    },
    {
      title: "Last Opened Date",
      dataIndex: "lastOpenedDate",
      key: "lastOpenedDate",
    },

    {
      title: "Audience Recipients",
      dataIndex: "total_clicks",
      key: "total_clicks",
    },
    {
      title: "Opened", // New column
      dataIndex: "opened",
      key: "opened",
    },
    {
      title: "Clicks",
      dataIndex: "clicks",
      key: "clicks",
    },

    {
      title: "Opened Percentage(%)",
      dataIndex: "openedPercentage",
      key: "openedPercentage",
      render: (text) => `${text}`, // Append percentage symbol
    },
    {
      title: "Clicked Percentage(%)",
      dataIndex: "clickedPercentage",
      key: "clickedPercentage",
      render: (text) => `${text}`, // Append percentage sign
    },
    {
      title: "Successful Deliveries Count",
      dataIndex: "successfulDeliveries",
      key: "successfulDeliveries",
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
      <Table
        columns={columns}
        dataSource={tableData}
        scroll={{ x: "auto" }}
        pagination={false}
      />

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
