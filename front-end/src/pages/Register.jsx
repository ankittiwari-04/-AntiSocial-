import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { dispatch } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Create Account | AntiSocial';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { username, email, password } = form;
    console.log('API URL being used:', 
      import.meta.env.VITE_API_URL);
    console.log('Attempting register with:', 
      { username, email });
    try {
      const res = await API.post(
        '/auth/register', 
        { username, email, password }
      );
      console.log('Register success:', res.data);
      dispatch({ type: 'LOGIN', payload: res.data });
      toast.success('Welcome to AntiSocial! 🎉');
      navigate('/');
    } catch (err) {
      console.error('Full error:', err);
      console.error('Response:', err.response);
      console.error('Status:', err.response?.status);
      console.error('Data:', err.response?.data);
      toast.error(
        err.response?.data?.message || 
        'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="grid min-h-screen animate-fade-in grid-cols-1 md:grid-cols-2">
      <section className="hidden flex-col justify-center bg-gradient-brand p-10 md:flex">
        <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">Join AntiSocial</h1>
        <p className="mt-4 max-w-md text-lg text-white/90">
          Share posts, join communities, and grow your audience with a premium dark UI.
        </p>
        <ul className="mt-8 space-y-3 text-white/85">
          <li className="flex items-center gap-2">✓ Secure auth & media uploads</li>
          <li className="flex items-center gap-2">✓ Explore & discovery</li>
          <li className="flex items-center gap-2">✓ Built for creators</li>
        </ul>
      </section>
      <section className="flex items-center justify-center bg-dark-950 p-6">
        <div className="card w-full max-w-md p-8 shadow-glow-sm">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-white">Create account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              required
              placeholder="Username"
              className="input-field"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
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
              minLength={6}
              placeholder="Password"
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-[#71717a]">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-brand-400 hover:text-brand-300">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
