import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_CONFIG from "../config/api";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaDownload,
  FaClock,
  FaUser,
} from "react-icons/fa";

const AdminGCashVerification = () => {
  const navigate = useNavigate();
  const [pendingPayments, setPendingPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/admin/gcash/pending-verifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPendingPayments(data);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId, isVerified) => {
    try {
      setProcessing(true);
      const token = localStorage.getItem("token");

      await fetch(
        `${API_CONFIG.BASE_URL}/api/admin/gcash/${paymentId}/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            is_verified: isVerified,
            rejection_reason: isVerified ? null : rejectionReason,
          }),
        }
      );

      setShowModal(false);
      setRejectionReason("");
      fetchPendingPayments();
    } catch (error) {
      console.error("Verification error:", error);
    } finally {
      setProcessing(false);
    }
  };

  const viewScreenshot = (payment) => {
    setSelectedPayment(payment);
  };

  const openVerifyModal = (payment, isVerified) => {
    if (isVerified) {
      handleVerifyPayment(payment.id, true);
    } else {
      setSelectedPayment(payment);
      setShowModal(true);
    }
  };

  return (
    <div
      style={{
        background: "var(--color-bg)",
        minHeight: "100vh",
        padding: "2rem 0",
      }}
    >
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 style={{ color: "var(--color-text)", marginBottom: "0.5rem" }}>
              GCash Payment Verification
            </h2>
            <p style={{ color: "var(--color-text-muted)" }}>
              Review and verify pending GCash payments
            </p>
          </div>
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate(-1)}
            style={{
              color: "var(--color-text)",
              borderColor: "var(--color-border)",
            }}
          >
            ← Back
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p style={{ color: "var(--color-text-muted)", marginTop: "1rem" }}>
              Loading pending payments...
            </p>
          </div>
        )}

        {/* No Payments */}
        {!loading && pendingPayments.length === 0 && (
          <div
            style={{
              background: "var(--color-bg-secondary)",
              padding: "3rem",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <FaCheckCircle style={{ fontSize: "4rem", color: "var(--color-success)" }} />
            <h4 style={{ color: "var(--color-text)", marginTop: "1rem" }}>
              No Pending Payments
            </h4>
            <p style={{ color: "var(--color-text-muted)" }}>
              All payments have been processed.
            </p>
          </div>
        )}

        {/* Payment Cards */}
        {!loading && pendingPayments.length > 0 && (
          <div className="row g-4">
            {pendingPayments.map((payment) => (
              <div key={payment.id} className="col-md-6 col-lg-4">
                <div
                  style={{
                    background: "var(--color-bg-secondary)",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 style={{ color: "var(--color-text)" }}>
                        <FaClock className="me-2" style={{ color: "var(--color-warning)" }} />
                        Pending
                      </h5>
                      <p
                        style={{
                          color: "var(--color-primary)",
                          fontFamily: "monospace",
                          fontSize: "0.9rem",
                          margin: 0,
                        }}
                      >
                        {payment.reference_number}
                      </p>
                    </div>
                    <span
                      style={{
                        background: "var(--color-warning)",
                        color: "white",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "20px",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                      }}
                    >
                      Verify Now
                    </span>
                  </div>

                  {/* Payment Details */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <div className="mb-2">
                      <strong style={{ color: "var(--color-text-muted)" }}>Amount:</strong>
                      <span style={{ color: "var(--color-text)", float: "right" }}>
                        PHP {parseFloat(payment.amount).toFixed(2)}
                      </span>
                    </div>
                    <div className="mb-2">
                      <strong style={{ color: "var(--color-text-muted)" }}>Tourist:</strong>
                      <span style={{ color: "var(--color-text)", float: "right" }}>
                        <FaUser className="me-1" />
                        {payment.booking?.tourist?.name || "N/A"}
                      </span>
                    </div>
                    <div className="mb-2">
                      <strong style={{ color: "var(--color-text-muted)" }}>Submitted:</strong>
                      <span style={{ color: "var(--color-text)", float: "right" }}>
                        {new Date(payment.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="d-grid gap-2">
                    <button
                      className="btn"
                      onClick={() => viewScreenshot(payment)}
                      style={{
                        background: "var(--color-info)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                      }}
                    >
                      <FaEye className="me-2" />
                      View Screenshot
                    </button>
                    <div className="d-flex gap-2">
                      <button
                        className="btn flex-fill"
                        onClick={() => openVerifyModal(payment, true)}
                        disabled={processing}
                        style={{
                          background: "var(--color-success)",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                        }}
                      >
                        <FaCheckCircle className="me-2" />
                        Approve
                      </button>
                      <button
                        className="btn flex-fill"
                        onClick={() => openVerifyModal(payment, false)}
                        disabled={processing}
                        style={{
                          background: "var(--color-danger)",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                        }}
                      >
                        <FaTimesCircle className="me-2" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Screenshot Modal */}
        {selectedPayment && (
          <div
            className="modal"
            style={{
              display: showModal ? "block" : "none",
              background: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <div
              className="modal-dialog modal-lg"
              style={{ marginTop: "10vh" }}
            >
              <div
                className="modal-content"
                style={{
                  background: "var(--color-bg-secondary)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  className="modal-header"
                  style={{
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <h5 style={{ color: "var(--color-text)", margin: 0 }}>
                    Payment Screenshot
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedPayment(null);
                    }}
                  />
                </div>
                <div className="modal-body">
                  <img
                    src={`${API_CONFIG.BASE_URL}/storage/${selectedPayment.payment_screenshot_path}`}
                    alt="Payment Screenshot"
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                </div>
                <div
                  className="modal-footer"
                  style={{
                    borderTop: "1px solid var(--color-border)",
                  }}
                >
                  <textarea
                    placeholder="Enter rejection reason (required for rejection)"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    style={{
                      width: "100%",
                      marginBottom: "1rem",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-bg)",
                      color: "var(--color-text)",
                      minHeight: "80px",
                    }}
                  />
                  <div className="d-flex gap-2" style={{ width: "100%" }}>
                    <button
                      className="btn flex-fill"
                      onClick={() => handleVerifyPayment(selectedPayment.id, true)}
                      disabled={processing}
                      style={{
                        background: "var(--color-success)",
                        color: "white",
                        border: "none",
                      }}
                    >
                      {processing ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <FaCheckCircle className="me-2" />
                          Approve Payment
                        </>
                      )}
                    </button>
                    <button
                      className="btn flex-fill"
                      onClick={() =>
                        handleVerifyPayment(selectedPayment.id, false)
                      }
                      disabled={processing || !rejectionReason}
                      style={{
                        background: "var(--color-danger)",
                        color: "white",
                        border: "none",
                      }}
                    >
                      {processing ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <FaTimesCircle className="me-2" />
                          Reject Payment
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1050;
        }
      `}</style>
    </div>
  );
};

export default AdminGCashVerification;
