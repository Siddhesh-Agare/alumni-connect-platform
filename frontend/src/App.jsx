import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ProfileView from "./pages/ProfileView";
import Directory from "./pages/Directory";
import Connections from "./pages/Connections";
import Chat from "./pages/Chat";
import Jobs from "./pages/Jobs";
import Admin from "./pages/Admin";

const member = ["student", "alumni"];

// "/" shows the public landing page to visitors and the dashboard to logged-in users
function Home() {
  const { user } = useAuth();
  return user ? <Dashboard /> : <Landing />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { borderRadius: "12px", fontSize: "14px" } }} />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
          <Route path="/u/:id" element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute roles={member}><Profile /></ProtectedRoute>} />
          <Route path="/directory" element={<ProtectedRoute roles={member}><Directory /></ProtectedRoute>} />
          <Route path="/connections" element={<ProtectedRoute roles={member}><Connections /></ProtectedRoute>} />
          <Route path="/chat/:userId?" element={<ProtectedRoute roles={member}><Chat /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><Admin /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
