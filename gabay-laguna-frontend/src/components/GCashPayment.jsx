import React, { useState, useEffect } from "react";
import API_CONFIG from "../config/api";
import {
  FaQrcode,
  FaUpload,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaCopy,
  FaInfoCircle,
} from "react-icons/fa";

const GCashPayment = ({ booking, onPaymentComplete }) => {
  const [paymentData, setPaymentData] = useState(null);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [status, setStatus] = useState("pending"); // pending, waiting, uploaded, verified, rejected
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (booking) {
      initiatePayment();
    }
  }, [booking]);

  const initiatePayment = async () => {
    try {
      setError("");
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/gcash/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ booking_id: booking.id }),
      });

      const data = await response.json();

      if (data.success) {
        setPaymentData(data);
        setStatus("waiting");
      } else {
        setError(data.error || "Failed to initiate payment");
      }
    } catch (err) {
      console.error("Payment initiation error:", err);
      setError("Failed to connect to payment service");
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError("File must be JPG, PNG, or PDF");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5242880) {
        setError("File size must be less than 5MB");
        return;
      }

      setScreenshotFile(file);
      setError("");
    }
  };

  const handleScreenshotUpload = async () => {
    if (!screenshotFile) {
      setError("Please select a file first");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("screenshot", screenshotFile);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/gcash/${paymentData.payment.id}/upload-screenshot`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setUploadSuccess(true);
        setStatus("uploaded");
        setScreenshotFile(null);
        
        // Poll for status updates
        pollPaymentStatus();
      } else {
        setError(data.error || "Failed to upload screenshot");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const pollPaymentStatus = async () => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `${API_CONFIG.BASE_URL}/api/gcash/${paymentData.payment.id}/status`
        );
        const statusData = await response.json();

        if (statusData.verification_status === "verified") {
          setStatus("verified");
          clearInterval(pollInterval);
          if (onPaymentComplete) {
            onPaymentComplete(statusData);
          }
        } else if (statusData.verification_status === "rejected") {
          setStatus("rejected");
          setError(statusData.rejection_reason || "Payment was rejected");
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error("Status polling error:", err);
      }
    }, 5000); // Poll every 5 seconds

    // Stop polling after 2 hours
    setTimeout(() => clearInterval(pollInterval), 7200000);
  };

  const copyReferenceNumber = () => {
    if (paymentData?.reference_number) {
      navigator.clipboard.writeText(paymentData.reference_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const paymentInstructions = [
    {
      icon: "1️⃣",
      text: "Open your GCash app",
    },
    {
      icon: "2️⃣",
      text: 'Tap "Scan QR Code" or go to "Send Money"',
    },
    {
      icon: "3️⃣",
      text: "Scan the QR code below or enter the account number manually",
    },
    {
      icon: "4️⃣",
      text: `Enter the exact amount: PHP ${paymentData?.amount || booking?.total_amount || "0.00"}`,
    },
    {
      icon: "5️⃣",
      text: `Add this reference number in the message/notes: ${paymentData?.reference_number || ""}`,
    },
    {
      icon: "6️⃣",
      text: "Complete the payment",
    },
    {
      icon: "7️⃣",
      text: "Take a screenshot of your payment confirmation",
    },
    {
      icon: "8️⃣",
      text: "Upload the screenshot below",
    },
  ];

  return (
    <div 
      style={{
        background: "var(--color-bg-secondary)",
        borderRadius: "12px",
        padding: "2rem",
        color: "var(--color-text)"
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h3 style={{ color: "var(--color-success)", marginBottom: "0.5rem" }}>
          <FaQrcode className="me-2" />
          GCash Payment
        </h3>
        <p style={{ color: "var(--color-text-muted)" }}>
          Complete your payment using GCash
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            background: "var(--color-danger)",
            color: "white",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <FaTimesCircle />
          {error}
        </div>
      )}

      {/* Upload Success Message */}
      {uploadSuccess && (
        <div
          style={{
            background: "var(--color-success)",
            color: "white",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <FaCheckCircle />
          Screenshot uploaded successfully! Waiting for admin verification.
        </div>
      )}

      {/* Payment Details */}
      {paymentData && (
        <>
          {/* Account Details */}
          <div
            style={{
              background: "var(--color-bg)",
              padding: "1.5rem",
              borderRadius: "8px",
              marginBottom: "1.5rem",
            }}
          >
            <h5 style={{ color: "var(--color-text)", marginBottom: "1rem" }}>
              Send Payment To:
            </h5>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div>
                <strong style={{ color: "var(--color-primary)" }}>Account Name:</strong>{" "}
                {paymentData.gcash_account?.account_name}
              </div>
              <div>
                <strong style={{ color: "var(--color-primary)" }}>Account Number:</strong>{" "}
                {paymentData.gcash_account?.account_number}
              </div>
              <div>
                <strong style={{ color: "var(--color-primary)" }}>Amount:</strong> PHP{" "}
                {paymentData.amount || booking?.total_amount || "0.00"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <strong style={{ color: "var(--color-primary)" }}>Reference Number:</strong>{" "}
                <span style={{ fontFamily: "monospace" }}>
                  {paymentData.reference_number}
                </span>
                <button
                  onClick={copyReferenceNumber}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--color-primary)",
                    cursor: "pointer",
                  }}
                >
                  <FaCopy />
                </button>
                {copied && <span style={{ fontSize: "0.8rem" }}>Copied!</span>}
              </div>
            </div>
          </div>

          {/* QR Code Display */}
          {paymentData.qr_code_data && (
            <div
              style={{
                textAlign: "center",
                marginBottom: "2rem",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "1.5rem",
                  background: "white",
                  borderRadius: "12px",
                }}
              >
                {/* QR Code Image would be rendered here */}
                <div
                  style={{
                    width: "250px",
                    height: "250px",
                    background: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "4rem",
                    marginBottom: "1rem",
                  }}
                >
                  <FaQrcode />
                </div>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                  Scan this QR code with GCash
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div
            style={{
              background: "var(--color-bg)",
              padding: "1.5rem",
              borderRadius: "8px",
              marginBottom: "2rem",
            }}
          >
            <h5 style={{ color: "var(--color-text)", marginBottom: "1rem" }}>
              <FaInfoCircle className="me-2" />
              Payment Instructions
            </h5>
            <ol style={{ paddingLeft: "1.5rem" }}>
              {paymentInstructions.map((instruction, index) => (
                <li
                  key={index}
                  style={{
                    color: "var(--color-text-secondary)",
                    marginBottom: "0.5rem",
                    lineHeight: "1.6",
                  }}
                >
                  {instruction.icon} {instruction.text}
                </li>
              ))}
            </ol>
          </div>
        </>
      )}

      {/* Screenshot Upload */}
      {status === "waiting" || status === "uploaded" ? (
        <div
          style={{
            background: "var(--color-bg)",
            padding: "1.5rem",
            borderRadius: "8px",
          }}
        >
          <h5 style={{ color: "var(--color-text)", marginBottom: "1rem" }}>
            <FaUpload className="me-2" />
            Upload Payment Screenshot
          </h5>

          {screenshotFile && (
            <div style={{ marginBottom: "1rem" }}>
              <p style={{ color: "var(--color-text-secondary)" }}>
                Selected: {screenshotFile.name}
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <label
              style={{
                display: "inline-block",
                padding: "0.75rem 1.5rem",
                background: "var(--color-primary)",
                color: "white",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "var(--color-primary-dark)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "var(--color-primary)";
              }}
            >
              <FaUpload className="me-2" />
              Choose File
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
            </label>

            {screenshotFile && (
              <button
                onClick={handleScreenshotUpload}
                disabled={uploading}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: uploading ? "var(--color-secondary)" : "var(--color-success)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: uploading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {uploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm"></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Upload Screenshot
                  </>
                )}
              </button>
            )}
          </div>

          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: "0.85rem",
              marginTop: "1rem",
            }}
          >
            Please upload a clear screenshot of your GCash payment confirmation.
            Accepted formats: JPG, PNG, PDF (Max 5MB)
          </p>
        </div>
      ) : null}

      {/* Status Indicator */}
      {status === "uploaded" && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1.5rem",
            background: "var(--color-info)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            color: "white",
          }}
        >
          <FaClock style={{ fontSize: "1.5rem" }} />
          <div>
            <strong>Waiting for Admin Verification</strong>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>
              Your payment is being reviewed. You will be notified once verified.
            </p>
          </div>
        </div>
      )}

      {status === "verified" && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1.5rem",
            background: "var(--color-success)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            color: "white",
          }}
        >
          <FaCheckCircle style={{ fontSize: "1.5rem" }} />
          <div>
            <strong>Payment Verified!</strong>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>
              Your booking has been confirmed.
            </p>
          </div>
        </div>
      )}

      {status === "rejected" && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1.5rem",
            background: "var(--color-danger)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            color: "white",
          }}
        >
          <FaTimesCircle style={{ fontSize: "1.5rem" }} />
          <div>
            <strong>Payment Rejected</strong>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>
              Please contact support for assistance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GCashPayment;
