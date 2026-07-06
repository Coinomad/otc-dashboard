import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Wallet, ArrowRight, Mail, Lock, User, Eye, EyeOff, Building2 } from 'lucide-react';
import { api } from '../api/client';
import { CountryPicker } from '../components/CountryPicker';

interface AuthProps {
  mode: 'login' | 'signup';
}

export function Login({ mode }: AuthProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isSignup = mode === 'signup';

  useEffect(() => {
    const token = localStorage.getItem('otc_token');
    if (token) {
      api.getOverview().then(() => navigate('/')).catch(() => localStorage.removeItem('otc_token'));
    }
  }, [navigate]);

  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const canSubmit = emailValid && password.length >= 6 && (!isSignup || (name.trim().length > 0 && companyName.trim().length > 0 && country.length > 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!emailValid) { setError('Enter a valid email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setIsLoading(true);
    try {
      const res = isSignup
        ? await api.register(email, password, name, companyName, country)
        : await api.login(email, password);

      const { token, user } = res.data;
      localStorage.setItem('otc_token', token);
      localStorage.setItem('otc_user', user.email);
      navigate('/');
    } catch (err: any) {
      localStorage.removeItem('otc_token');
      localStorage.removeItem('otc_user');
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-navy-100/30 rounded-full blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative">
        {/* Logo + Title */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center shadow-xl shadow-navy-900/10 ring-1 ring-navy-800/10">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <h2 className="mt-5 text-center text-2xl font-bold tracking-tight text-slate-900">
            Coinomad OTC Console
          </h2>
          <p className="mt-1.5 text-center text-sm text-slate-500">
            {isSignup
              ? 'Create your partner account'
              : 'Sign in to the Exchange Operations Dashboard'}
          </p>
        </div>

        {/* Form Card */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 border border-slate-200 sm:rounded-2xl">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {isSignup && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Full name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full rounded-lg border border-slate-300 bg-white pl-11 pr-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-150 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                        placeholder="Ama Owusu"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Company name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="companyName"
                        type="text"
                        autoComplete="organization"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="block w-full rounded-lg border border-slate-300 bg-white pl-11 pr-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-150 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                        placeholder="Acme Trading Ltd"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <CountryPicker value={country} onChange={setCountry} />
                  </div>
                </>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 bg-white pl-11 pr-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-150 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                    placeholder="ops@coinomad.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 bg-white pl-11 pr-11 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-150 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {isSignup && (
                  <p className="mt-1.5 text-xs text-slate-500">At least 6 characters.</p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !canSubmit}
                className="btn-primary w-full py-2.5"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {isSignup ? 'Creating account...' : 'Signing in...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {isSignup ? 'Create account' : 'Sign In'}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              {isSignup ? (
                <>
                  Already have an account?{' '}
                  <Link to="/login" state={location.state} className="font-semibold text-teal hover:text-teal-700 transition-colors">
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <Link to="/signup" state={location.state} className="font-semibold text-teal hover:text-teal-700 transition-colors">
                    Sign up
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
