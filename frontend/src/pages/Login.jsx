import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth, useToast } from "../context/contexts";
import { loginUser } from "../services/userService";
import { getErrorMessage } from "../services/api";
import { Alert } from "../components/Status";

function Login() {
  const { login, isAuthenticated } = useAuth();
  const toast = useToast();
  const [credentials, setCredentials] = useState({ userId: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  if (isAuthenticated && !submitting) return <Navigate to={redirectTo} replace />;

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await loginUser({ userId: credentials.userId.trim(), password: credentials.password });
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name.split(" ")[0]}!`);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Login failed"));
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page flex justify-center py-12 sm:py-20">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-500">Log in to continue shopping for a cause.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <Alert>{error}</Alert>}
          <div>
            <label htmlFor="userId" className="label">Email or mobile number</label>
            <input id="userId" name="userId" value={credentials.userId} onChange={handleChange} className="input" autoComplete="username" required />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={handleChange}
                className="input pr-10"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          New here?{" "}
          <Link to="/register" state={location.state} className="font-medium text-brand-700 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
