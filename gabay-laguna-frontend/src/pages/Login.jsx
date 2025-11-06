import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import API_CONFIG from "../config/api";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaSignInAlt,
} from "react-icons/fa";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.email || !form.email.includes("@")) {
      errs.email = "Valid email is required";
    }
    if (!form.password || form.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    return errs;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm({ ...form, [id]: value });
    if (errors[id]) {
      setErrors({ ...errors, [id]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setServerError("");

    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      try {
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}/api/login`,
          {
            email: form.email,
            password: form.password,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            withCredentials: false,
          }
        );
        const { user, token } = response.data;

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);

        const role = user?.user_type || user?.role || "user";
        const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
        alert(`Login successful as ${roleLabel}!`);

        if (role === "tourist") {
          navigate("/tourist-dashboard");
        } else if (role === "guide") {
          navigate("/guide-dashboard");
        } else if (role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/");
        }
      } catch (error) {
        // Enhanced error handling
        if (error.message === "Network Error") {
          setServerError(
            "Network Error: Unable to connect to the server. " +
            "Please check your internet connection and try again."
          );
        } else {
          const errMsg = error.response?.data?.message || error.message || "Login failed.";
          setServerError(errMsg);
        }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center"
      style={{
        background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
        padding: "2rem 0",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="text-white fw-bold mb-2" style={{ fontSize: "2.5rem" }}>Welcome Back</h1>
              <p className="text-white-50" style={{ fontSize: "1.1rem" }}>Sign in to your account</p>
            </div>

            {/* Login Form Card */}
            <div 
              className="card"
              style={{
                background: "#374151",
                border: "none",
                borderRadius: "16px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
              }}
            >
              <div className="card-body p-5">
                {serverError && (
                  <div
                    className="alert alert-danger d-flex align-items-center"
                    role="alert"
                  >
                    <div className="me-2">⚠️</div>
                    <div>{serverError}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  {/* Email Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="email"
                      className="form-label fw-semibold text-white d-flex align-items-center"
                      style={{ fontSize: "0.9rem" }}
                    >
                      <FaEnvelope className="me-2" style={{ color: "#9ca3af" }} />
                      Email Address
                    </label>
                    <input
                      type="email"
                      className={`form-control form-control-lg ${
                        errors.email ? "is-invalid" : ""
                      }`}
                      id="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="tour@gmail.com"
                      required
                      style={{
                        background: "#4b5563",
                        border: "1px solid #6b7280",
                        borderRadius: "8px",
                        color: "white",
                        padding: "12px 16px",
                      }}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="password"
                      className="form-label fw-semibold text-white d-flex align-items-center"
                      style={{ fontSize: "0.9rem" }}
                    >
                      <FaLock className="me-2" style={{ color: "#9ca3af" }} />
                      Password
                    </label>
                    <div className="position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control form-control-lg ${
                          errors.password ? "is-invalid" : ""
                        }`}
                        id="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                        style={{
                          background: "#4b5563",
                          border: "1px solid #6b7280",
                          borderRadius: "8px",
                          color: "white",
                          padding: "12px 50px 12px 16px",
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-link position-absolute"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          right: "8px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#9ca3af",
                          border: "none",
                          background: "none",
                          padding: "4px",
                        }}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      {errors.password && (
                        <div className="invalid-feedback">
                          {errors.password}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* No role selection: role is auto-detected on login */}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-lg w-100 mb-4 d-flex align-items-center justify-content-center"
                    disabled={isLoading}
                    style={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                      borderRadius: "8px",
                      color: "white",
                      fontWeight: "600",
                      padding: "12px 24px",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-1px)";
                      e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "none";
                    }}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Signing In...
                      </>
                    ) : (
                      <>
                        <FaSignInAlt className="me-2" />
                        Sign In
                      </>
                    )}
                  </button>

                  {/* Navigation Links */}
                  <div className="text-center">
                    <p className="text-white-50 mb-3" style={{ fontSize: "0.9rem" }}>
                      Don't have an account? Choose your path:
                    </p>
                    <div className="d-grid gap-2 mb-3">
                      <Link
                        to="/signup/tourist"
                        className="btn btn-sm d-flex align-items-center justify-content-center"
                        style={{
                          background: "transparent",
                          border: "1px solid #3b82f6",
                          borderRadius: "8px",
                          color: "#3b82f6",
                          fontWeight: "500",
                          padding: "8px 16px",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#3b82f6";
                          e.target.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "transparent";
                          e.target.style.color = "#3b82f6";
                        }}
                      >
                        <span className="me-2">🧳</span>
                        Sign Up as Tourist
                      </Link>
                      <Link
                        to="/signup/guide"
                        className="btn btn-sm d-flex align-items-center justify-content-center"
                        style={{
                          background: "transparent",
                          border: "1px solid #f59e0b",
                          borderRadius: "8px",
                          color: "#f59e0b",
                          fontWeight: "500",
                          padding: "8px 16px",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#f59e0b";
                          e.target.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "transparent";
                          e.target.style.color = "#f59e0b";
                        }}
                      >
                        <span className="me-2">🧭</span>
                        Sign Up as Guide
                      </Link>
                    </div>
                    <Link
                      to="/"
                      className="btn btn-link text-decoration-none text-white"
                      style={{ 
                        color: "white",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                      }}
                    >
                      ← Back to Home
                    </Link>
                  </div>
                </form>
              </div>
            </div>

            {/* Footer Note */}
            <div className="text-center mt-4">
              <p className="text-white-50 small mb-0" style={{ fontSize: "0.8rem" }}>
                Secure login powered by Gabay Laguna
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
