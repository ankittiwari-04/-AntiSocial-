import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  document.title = 'Reset Password | AntiSocial';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match!');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await API.post(`/auth/reset-password/${token}`, { 
        password 
      });
      setDone(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(
        err.response?.data?.message || 
        'Reset failed. Link may be expired.'
      );
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
          {done ? (
            <>
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-bold 
                             text-white">
                Password reset!
              </h2>
              <p className="text-[#71717a] text-sm mt-2">
                Redirecting to login...
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold 
                             text-white mb-2">
                Set new password
              </h2>
              <p className="text-[#71717a] text-sm">
                Choose a strong password
              </p>
            </>
          )}
        </div>

        {!done && (
          <form onSubmit={handleSubmit} 
                className="space-y-4">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field"
              required
              minLength={6}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="input-field"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full 
                         disabled:opacity-50">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
