import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  document.title = 'Forgot Password | AntiSocial';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent! Check your email.');
    } catch (err) {
      toast.error('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] flex 
                    items-center justify-center px-4">
      <div className="card w-full max-w-md p-8 
                      animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold 
                         gradient-text mb-2">
            AntiSocial
          </h1>
          {!sent ? (
            <>
              <h2 className="text-xl font-bold 
                             text-white mb-2">
                Forgot password?
              </h2>
              <p className="text-[#71717a] text-sm">
                Enter your email and we'll send 
                you a reset link
              </p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">📧</div>
              <h2 className="text-xl font-bold 
                             text-white mb-2">
                Check your email!
              </h2>
              <p className="text-[#71717a] text-sm">
                We sent a password reset link to
                <span className="text-brand-400"> {email}</span>
              </p>
            </>
          )}
        </div>

        {!sent && (
          <form onSubmit={handleSubmit} 
                className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-field"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full 
                         disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="text-center text-sm 
                      text-[#71717a] mt-6">
          Remember your password?{' '}
          <Link to="/login" 
                className="text-brand-400 
                           hover:text-brand-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
