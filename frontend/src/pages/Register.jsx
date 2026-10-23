import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth, useToast } from "../context/contexts";
import { loginUser, registerUser } from "../services/userService";
import { getErrorMessage } from "../services/api";
import { Alert } from "../components/Status";

// Mirrors backend/middlewares/validateRegister.js
function validate({ name, email, mobile, password }) {
  if (!/^[A-Za-z\s]+$/.test(name.trim())) return "Name should contain only letters and spaces";
  if (!/^\S+@\S+\.\S+$/.test(email)) return "Please enter a valid email";
  if (!/^[0-9]{10}$/.test(mobile)) return "Mobile number must be 10 digits";
  if (password.length < 6 || password.length > 12) return "Password must be 6-12 characters";
  if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password))
    return "Password needs an uppercase letter, a number and a special character (!@#$%^&*)";
  return "";
}

function Register() {
  const { login, isAuthenticated } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({ name: "", email: "", mobile: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  if (isAuthenticated && !submitting) return <Navigate to={redirectTo} replace />;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = validate(formData);
    if (message) return setError(message);
    setError("");
    setSubmitting(true);
    try {
      const data = { ...formData, name: formData.name.trim(), email: formData.email.trim() };
      await registerUser(data);
      // Log straight in so the user doesn't have to re-enter their details.
      const res = await loginUser({ userId: data.email, password: data.password });
      login(res.data.token, res.data.user);
      toast.success("Account created. Welcome!");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed"));
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page flex justify-center py-12 sm:py-20">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-gray-500">Every order you place supports a charity.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          {error && <Alert>{error}</Alert>}
          <div>
            <label htmlFor="name" className="label">Full name</label>
            <input id="name" name="name" value={formData.name} onChange={handleChange} className="input" autoComplete="name" required />
          </div>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="input" autoComplete="email" required />
          </div>
          <div>
            <label htmlFor="mobile" className="label">Mobile number</label>
            <input id="mobile" name="mobile" inputMode="numeric" maxLength={10} value={formData.mobile} onChange={handleChange} className="input" autoComplete="tel-national" required />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} className="input" autoComplete="new-password" required />
            <p className="mt-1.5 text-xs text-gray-500">6-12 characters, with an uppercase letter, a number and a special character.</p>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" state={location.state} className="font-medium text-brand-700 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
