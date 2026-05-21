import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { dispatch } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Sign In | AntiSocial';
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", form);
      dispatch({ type: "LOGIN", payload: res.data });
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen animate-fade-in grid-cols-1 md:grid-cols-2">
      <section className="hidden flex-col justify-center bg-gradient-brand p-10 md:flex">
        <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">AntiSocial</h1>
        <p className="mt-4 max-w-md text-lg text-white/90">
          Real-time social, communities, and creator tools — built for the dark aesthetic you actually want.
        </p>
        <ul className="mt-8 space-y-3 text-white/85">
          <li className="flex items-center gap-2">✓ AI captions & smart feed</li>
          <li className="flex items-center gap-2">✓ Stories, DMs, notifications</li>
          <li className="flex items-center gap-2">✓ Tipping & premium posts</li>
        </ul>
      </section>
      <section className="flex items-center justify-center bg-dark-950 p-6">
        <div className="card w-full max-w-md p-8 shadow-glow-sm">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-white">Welcome back</h2>
          <form onSubmit={submit} className="space-y-4">
            <input
              type="email"
              required
              placeholder="Email"
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              type="password"
              required
              placeholder="Password"
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-[#71717a]">
            New here?{" "}
            <Link to="/register" className="font-medium text-brand-400 hover:text-brand-300">
              Create account
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
