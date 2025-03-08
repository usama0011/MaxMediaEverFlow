import React, { useState } from "react";
import {
  Form,
  Input,
  DatePicker,
  Button,
  message,
  Select,
  Table,
  Modal,
  Row,
  Col,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import Papa from "papaparse";
import "../styles/DailyActivity.css";

const { RangePicker } = DatePicker;
const { Option } = Select;

const DailyActivity = () => {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]); // First table
  const [campaignTableData, setCampaignTableData] = useState([]); // Second table with extra fields
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal control for file name
  const [fileName, setFileName] = useState("LatestNewReport"); // Default file name
  // Function to generate a random number in a given range
  const getRandomInRange = (min, max) =>
    Math.floor(Math.random() * (max - min + 1) + min);

  const handleSubmit = async (values) => {
    console.log(values);
    setLoading(true);
    try {
      const [startDate, endDate] = values.dateRange.map((date) =>
        dayjs(date).format("YYYY-MM-DD")
      );

      const payload = {
        timezone_id: values.timezone,
        from: startDate,
        to: endDate,
        offerID: values.offerID,
        refreshToken: values.refreshToken,
      };

      const response = await axios.post(
        "https://max-media-ever-flow-59s6.vercel.app/api/fetch-report",
        payload
      );
      const formattedData = response.data.table.map((item) => {
        const totalClicks = item.reporting.total_click;
        const multiplier = getRandomInRange(2400, 2800);
        const bidRequest = totalClicks * multiplier;

        // Calculate WinRate (Avoid division by zero)
        const winRate =
          bidRequest !== 0 ? (totalClicks / bidRequest) * 1000 : 0;

        // Generate random CPC value between 0.11 and 0.41
        const cpc = (Math.random() * (0.41 - 0.11) + 0.11).toFixed(2);

        // Calculate Cost (Total Clicks * CPC)
        const cost = (totalClicks * parseFloat(cpc)).toFixed(2);

        return {
          key: item.columns.find((col) => col.column_type === "date")?.id,
          date: dayjs
            .unix(item.columns.find((col) => col.column_type === "date")?.id)
            .format("YYYY-MM-DD"),
          total_clicks: totalClicks,
          bid_request: bidRequest.toLocaleString(),
          campaign_name: values.campaignName,
          win_rate: winRate.toFixed(2), // Format to 2 decimal places
          cpc, // CPC value
          cost, // New Cost Column
        };
      });

      // Generate data for second table with additional form fields
      const campaignFormattedData = formattedData.map((item) => ({
        ...item,
        adFormat: values.adFormat,
        id: values.id,
        adFor: values.adFor,
        videoImp: values.videoImp,
        dailyCap: values.dailyCap,
        title: values.title,
        descriptionone: values.descriptionone,
        descriptiontwo: values.descriptiontwo,
        destinationURL: values.destinationURL,
        displayURL: values.displayURL,
        compaignImage: values.compaignImage,
        bidRequests: values.bidRequests,
        geo: values.geo,
      }));

      // Sort data by date in ascending order
      formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));
      campaignFormattedData.sort((a, b) => new Date(a.date) - new Date(b.date));

      setTableData(formattedData);
      setCampaignTableData(campaignFormattedData);
      message.success("Data fetched successfully!");
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to fetch data.");
    }
    setLoading(false);
  };

  const downloadCSV = () => {
    if (tableData.length === 0) {
      message.error("No data available to download.");
      return;
    }

    const csvData = tableData.map(
      ({
        date,
        campaign_name,
        total_clicks,
        bid_request,
        win_rate,
        cost,
        cpc,
        CoversionRate,
        CostConversion,
      }) => ({
        Date: date,
        "Bid Request": bid_request,
        Visits: total_clicks, // Changed from "Total Clicks" to "Visits" based on model
        "Campaign Name": campaign_name,
        "Win Rate": win_rate,
        Cost: cost,
        CPC: cpc,
        "Conversion Rate": CoversionRate || "N/A", // Ensure no undefined values
        "Cost Conversion": CostConversion || "N/A", // Ensure no undefined values
      })
    );

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    link.click();
    message.success("CSV file downloaded successfully!");
    setIsModalVisible(false);
  };
  // Function to download second table CSV (Campaign Table)
  const downloadCampaignCSV = () => {
    if (campaignTableData.length === 0) {
      message.error("No data available to download.");
      return;
    }

    const csvData = campaignTableData.map(
      ({
        date,
        campaign_name,
        total_clicks,
        bid_request,
        win_rate,
        cost,
        cpc,
        adFormat,
        id,
        adFor,
        videoImp,
        dailyCap,
        title,
        descriptionone,
        descriptiontwo,
        destinationURL,
        displayURL,
        compaignImage,
        bidRequests,
        geo,
      }) => ({
        "Ad Format": adFormat,
        ID: id,
        "Ad For": adFor,
        "Campaign Name": campaign_name,
        "Campaign Image": compaignImage,
        "Campaign Bid": bid_request,
        Geo: geo,
        "Bid Requests": bidRequests,
        "Video Imp": videoImp,
        Visits: total_clicks,
        "Win Rate": win_rate,
        Cost: cost,
        "Daily Cap": dailyCap,
        Title: title,
        "Description 1": descriptionone,
        "Description 2": descriptiontwo,
        "Destination URL": destinationURL,
        "Display URL": displayURL,
        "Entry Date": dayjs(date).format("MM/DD/YY"), // Convert to MM/DD/YY format
      })
    );

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `CampaignDownload.csv`;
    link.click();
    message.success("Campaign CSV file downloaded successfully!");
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Bid Request",
      dataIndex: "bid_request",
      key: "bid_request",
    },

    {
      title: "Visits",
      dataIndex: "total_clicks",
      key: "total_clicks",
    },
    {
      title: "Campaign Name",
      dataIndex: "campaign_name",
      key: "campaign_name",
    },
    {
      title: "Win Rate", // New Column
      dataIndex: "win_rate",
      key: "win_rate",
      render: (text) => `${text}`, // Add percentage sign
    },
    {
      title: "Cost", // New Column for Cost
      dataIndex: "cost",
      key: "cost",
      render: (text) => `${text}`, // Format as currency
    },
    {
      title: "CPC", // New Column for CPC
      dataIndex: "cpc",
      key: "cpc",
    },
    {
      title: "CoversionRate", // New Column for CPC
      dataIndex: "CoversionRate",
      key: "CoversionRate",
    },
    {
      title: "CostConversion", // New Column for CPC
      dataIndex: "CostConversion",
      key: "CostConversion",
    },
  ];
  const campaignTableColumns = [
    {
      title: "Ad Format",
      dataIndex: "adFormat",
      key: "adFormat",
      width: "200px",
    },
    { title: "ID", dataIndex: "id", key: "id", width: "200px" },
    { title: "Ad For", dataIndex: "adFor", key: "adFor", width: "200px" },
    {
      title: "Campaign Name",
      dataIndex: "campaign_name",
      key: "campaign_name",
      width: "200px",
    },
    {
      title: "Campaign Image",
      dataIndex: "compaignImage",
      key: "compaignImage",
      width: "200px",
    },
    {
      title: "Campaign Bid",
      dataIndex: "bid_request",
      key: "bid_request",
      width: "200px",
    },

    {
      title: "Geo",
      dataIndex: "geo",
      key: "geo",
      width: "200px",
    },

    {
      title: "Bid Requests",
      dataIndex: "bidRequests",
      key: "bidRequests",
      width: "200px",
    },

    {
      title: "Video Imp",
      dataIndex: "videoImp",
      key: "videoImp",
      width: "200px",
    },

    {
      title: "Visits",
      dataIndex: "total_clicks",
      key: "total_clicks",
      width: "200px",
    },
    {
      title: "Win Rate", // New Column
      dataIndex: "win_rate",
      key: "win_rate",
      render: (text) => `${text}`, // Add percentage sign
      width: "200px",
    },

    {
      title: "Cost", // New Column for Cost
      dataIndex: "cost",
      key: "cost",
      render: (text) => `${text}`, // Format as currency
      width: "200px",
    },

    {
      title: "Daily Cap",
      dataIndex: "dailyCap",
      key: "dailyCap",
      width: "200px",
    },

    { title: "Title", dataIndex: "title", key: "title", width: "200px" },

    {
      title: "Description 1",
      dataIndex: "descriptionone",
      key: "descriptionone",
      width: "200px",
    },
    {
      title: "Description 2",
      dataIndex: "descriptiontwo",
      key: "descriptiontwo",
      width: "200px",
    },
    {
      title: "Destination URL",
      dataIndex: "destinationURL",
      key: "destinationURL",
      width: "200px",
    },
    {
      title: "Display URL",
      dataIndex: "displayURL",
      key: "displayURL",
      width: "200px",
    },

    {
      title: "Entry Date",
      dataIndex: "date",
      key: "date",
      width: "200px",
    },
  ];

  return (
    <div className="containerDailyActivity">
      <h2 className="titleDailyAcitvity">MaxMdeia Everflow Fetcher</h2>
      <Form requiredMark={false} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              label="Refresh Token"
              name="refreshToken"
              rules={[
                { required: true, message: "Please enter your Refresh Token" },
              ]}
            >
              <Input placeholder="Enter Refresh Token" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Campaign Name"
              name="campaignName"
              rules={[
                { required: true, message: "Please enter a Campaign Name" },
              ]}
            >
              <Input placeholder="Enter Campaign Name" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Offer ID"
              name="offerID"
              rules={[{ required: true, message: "Please enter Offer ID" }]}
            >
              <Input placeholder="Enter Offer ID" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Select Date Range"
              name="dateRange"
              rules={[
                { required: true, message: "Please select a date range" },
              ]}
            >
              <RangePicker />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={6}>
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
          </Col>
          <Col span={6}>
            <Form.Item label="Ad Format" name="adFormat">
              <Input placeholder="Enter Ad Format" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="ID" name="id">
              <Input placeholder="Enter ID" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Ad For" name="adFor">
              <Input placeholder="Enter Ad For" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Video Imp" name="videoImp">
              <Input placeholder="Enter Video Imp" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Daily Cap" name="dailyCap">
              <Input placeholder="Enter Daily Cap" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Title" name="title">
              <Input placeholder="Enter Title" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Description One" name="descriptionone">
              <Input placeholder="Enter Description One" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Description Two" name="descriptiontwo">
              <Input placeholder="Enter Description Two" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Destination URL" name="destinationURL">
              <Input placeholder="Enter Destination URL" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Display URL" name="displayURL">
              <Input placeholder="Enter Display URL" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Campaign Image" name="compaignImage">
              <Input placeholder="Enter Compaign Image" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Enter GEO" name="geo">
              <Input placeholder="Enter Geo" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Enter Campaing Bid Requests(Your Bid)"
              name="bidRequests"
            >
              <Input placeholder="Enter bidRequests" />
            </Form.Item>
          </Col>
        </Row>
        <Button type="primary" htmlType="submit" loading={loading}>
          Fetch Data
        </Button>
      </Form>

      <h3 style={{ marginTop: "20px" }}>Daily Activity Report</h3>
      <Table
        scroll={{ x: "auto" }}
        columns={columns}
        dataSource={tableData}
        pagination={false}
      />

      {/* Download CSV Button */}
      <Button
        type="default"
        onClick={() => setIsModalVisible(true)}
        style={{ marginTop: "20px" }}
      >
        Download CSV
      </Button>
      <Table
        pagination={false}
        scroll={{ x: "auto" }}
        columns={campaignTableColumns}
        dataSource={campaignTableData}
      />
      <Button onClick={downloadCampaignCSV}>Download Campaign CSV</Button>
      {/* Modal for entering filename */}
      <Modal
        title="Enter File Name"
        visible={isModalVisible}
        onOk={downloadCSV}
        onCancel={() => setIsModalVisible(false)}
        okText="Download"
        cancelText="Cancel"
      >
        <Input
          placeholder="Enter File Name"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default DailyActivity;
