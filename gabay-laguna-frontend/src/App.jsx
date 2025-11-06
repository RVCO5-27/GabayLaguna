import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Features from "./components/Features";
import Footer from "./components/Footer";
const Login = lazy(() => import("./pages/Login"));
const SignupTourist = lazy(() => import("./pages/SignupTourist"));
const SignupGuide = lazy(() => import("./pages/SignupGuide"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const TouristDashboard = lazy(() => import("./pages/TouristDashboard"));
const GuideDashboard = lazy(() => import("./pages/GuideDashboard"));
const TouristProfile = lazy(() => import("./pages/TouristProfile"));
const TourGuideProfile = lazy(() => import("./pages/TourGuideProfile"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const GuideBookings = lazy(() => import("./pages/GuideBookings"));
const POIGuides = lazy(() => import("./pages/POIGuides"));
const CitiesList = lazy(() => import("./pages/CitiesList"));
const POIs = lazy(() => import("./pages/POIs"));
const CategoryList = lazy(() => import("./pages/CategoryList"));
const POIList = lazy(() => import("./pages/POIList"));
import ProtectedRoute from "./components/ProtectedRoute";
import GuideLocationApplications from "./pages/GuideLocationApplications";
import GuideDutyLocations from "./pages/GuideDutyLocations";
import GuideSpotSuggestions from "./pages/GuideSpotSuggestions";
import AdminLocationApplications from "./pages/AdminLocationApplications";
import AdminSpotSuggestions from "./pages/AdminSpotSuggestions";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminReports from "./pages/AdminReports";
import AdminGCashVerification from "./pages/AdminGCashVerification";
import TouristReviews from "./pages/TouristReviews";
import GuideReviews from "./pages/GuideReviews";
import PublicGuideProfile from "./pages/PublicGuideProfile";
import Sidebar from "./components/Sidebar";
import "./App.css";

const App = () => {
  const location = useLocation();
  const publicPaths = [
    "/login",
    "/signup/tourist",
    "/signup/guide",
    "/admin/login",
  ];
  const isPublic = publicPaths.includes(location.pathname);
  const isHomePage = location.pathname === "/";
  
  return (
    <ThemeProvider>
      <div className="app-wrapper">
        <Navbar />
        <div className="container-fluid px-3 mt-3">
          <div className="row g-3">
            {!isPublic && !isHomePage && (
              <div className="col-md-2 d-none d-md-block">
                <Sidebar />
              </div>
            )}
            <div className={isPublic || isHomePage ? "col-12" : "col-12 col-md-10"}>
              <main>
                <Suspense fallback={<div className="text-center py-5">Loading…</div>}>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <>
                        <Hero />
                        <About />
                        <Features />
                      </>
                    }
                  />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup/tourist" element={<SignupTourist />} />
                  <Route path="/signup/guide" element={<SignupGuide />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route
                    path="/tourist-dashboard"
                    element={<TouristDashboard />}
                  />
                  <Route path="/guide-dashboard" element={<GuideDashboard />} />
                  <Route path="/tourist-profile" element={<TouristProfile />} />
                  <Route path="/guide-profile" element={<TourGuideProfile />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route
                    path="/booking/:guideId/:poiId"
                    element={<BookingPage />}
                  />
                  <Route path="/my-bookings" element={<MyBookings />} />
                  <Route path="/guide-bookings" element={<GuideBookings />} />
                  <Route path="/tourist/reviews" element={<TouristReviews />} />
                  <Route path="/guide/reviews" element={<GuideReviews />} />
                  <Route path="/guide/:guideId/profile" element={<PublicGuideProfile />} />
                  <Route path="/cities" element={<CitiesList />} />
                  <Route path="/categories/:city" element={<CategoryList />} />
                  <Route path="/spots/:city/:category" element={<POIList />} />
                  <Route path="/city/:cityId/pois" element={<POIs />} />
                  <Route path="/poi/:poiId" element={<POIs />} />
                  <Route path="/poi/:poiId/guides" element={<POIGuides />} />
                  {/* Guide-only routes */}
                  <Route
                    path="/guide/location-applications"
                    element={
                      <ProtectedRoute allowedRoles={["guide"]}>
                        <GuideLocationApplications />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/guide/duty-locations"
                    element={
                      <ProtectedRoute allowedRoles={["guide"]}>
                        <GuideDutyLocations />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/guide/spot-suggestions"
                    element={
                      <ProtectedRoute allowedRoles={["guide"]}>
                        <GuideSpotSuggestions />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin-only routes */}
                  <Route
                    path="/admin/location-applications"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminLocationApplications />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/spot-suggestions"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminSpotSuggestions />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/user-management"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminUserManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/reports"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminReports />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/gcash-verification"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminGCashVerification />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
                </Suspense>
              </main>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default App;
