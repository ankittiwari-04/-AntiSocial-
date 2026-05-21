import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#050508] flex items-center 
                    justify-center flex-col gap-6 text-center px-4">
      <div className="text-8xl font-black gradient-text">404</div>
      <h2 className="text-2xl font-bold text-white">
        Page not found
      </h2>
      <p className="text-[#71717a] max-w-sm">
        The page you're looking for doesn't exist 
        or has been moved.
      </p>
      <button onClick={() => navigate('/')} className="btn-primary">
        Go Home
      </button>
    </div>
  );
}
