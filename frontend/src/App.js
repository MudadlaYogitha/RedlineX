import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Container, Form, Button,
  Spinner, ProgressBar, Alert, Card
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

export default function App() {
  const [playbookFile, setPlaybookFile] = useState(null);
  const [contractFile, setContractFile] = useState(null);
  const [report, setReport] = useState("");
  const [txtPath, setTxtPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const mdComponents = {
    p({ children }) {
      const text = children[0];
      return (
        <p style={{ color: typeof text === "string" && text.startsWith("🔴") ? "#ff6b6b" : "#ddd" }}>
          {children}
        </p>
      );
    }
  };

  const handleDownload = () => {
    window.open(`${API_BASE}/download-txt?path=${encodeURIComponent(txtPath)}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!playbookFile || !contractFile) {
      return setError("Both Playbook and Contract files are required.");
    }

    const fd = new FormData();
    fd.append("playbook", playbookFile);
    fd.append("contract", contractFile);

    try {
      setLoading(true);
      setProgress(0);
      const res = await axios.post(`${API_BASE}/analyze`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total))
      });
      setReport(res.data.report);
      setTxtPath(res.data.txt_path);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-section">
      <div className="overlay">
        <Container fluid className="py-5 text-light text-center">
          <h1 className="display-3 fw-bold text-info mb-2">AI Redliner</h1>
          <p className="lead mx-auto mb-4" style={{ maxWidth: '700px' }}>
            Automatically review contracts against compliance rules using AI. Upload your playbook and contract to get a clear, audit-ready report.
          </p>

          <Card className="mx-auto app-card shadow">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label className="form-label-light">Playbook (.txt only)</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".txt"
                    className="form-control-dark"
                    onChange={e => setPlaybookFile(e.target.files[0])}
                  />
                </Form.Group>
                <Form.Group className="mb-3 text-start">
                  <Form.Label className="form-label-light">Contract (.txt only)</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".txt"
                    className="form-control-dark"
                    onChange={e => setContractFile(e.target.files[0])}
                  />
                </Form.Group>
                <Button variant="info" type="submit" disabled={loading} className="me-2">
                  {loading
                    ? <><Spinner animation="border" size="sm" /> Analyzing… {progress}%</>
                    : "🚀 Start Analysis"}
                </Button>
                {loading && <ProgressBar now={progress} variant="info" className="mt-3 rounded-pill" />}
              </Form>
              {error && (
                <Alert variant="danger" className="mt-4" dismissible>{error}</Alert>
              )}
            </Card.Body>
          </Card>

          {report && (
            <Card bg="dark" text="light" className="mt-5">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h2 className="h5 text-warning mb-0">Compliance Report</h2>
                <Button size="sm" variant="outline-light" onClick={handleDownload}>
                  ⬇️ Download Report
                </Button>
              </Card.Header>
              <Card.Body className="report-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                  {report}
                </ReactMarkdown>
              </Card.Body>
            </Card>
          )}
        </Container>
      </div>
    </div>
  );
}
