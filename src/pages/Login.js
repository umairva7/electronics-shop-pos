import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Store, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, settings } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      const success = login(username, password, remember);
      setIsLoading(false);
      
      if (success) {
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error('Invalid credentials. Try admin/password or staff1/password');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-brand-dark p-8 text-center text-white">
          <Store className="w-16 h-16 mx-auto mb-4 text-brand-light" />
          <h1 className="text-3xl font-bold mb-2">{settings.shopName}</h1>
          <p className="text-slate-300">Staff & Manager Portal</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all text-lg"
                placeholder="Enter your username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all text-lg"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-5 w-5 text-brand-blue focus:ring-brand-blue border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember" className="ml-3 block text-sm text-slate-700 cursor-pointer">
                Remember me on this device
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-blue hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors focus:ring-4 focus:ring-blue-300 disabled:opacity-70 text-lg h-14"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-6 h-6" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-slate-500">
            <p>Demo Credentials:</p>
            <p>Admin: admin / password</p>
            <p>Staff: staff1 / password</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
