import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuditStore } from '@/store/audit-store';
import { Shield, Building2, UserCheck, Loader2 } from 'lucide-react';
import api from '@/lib/api';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken, setRole, setCurrentOrg, organizations, loadFromBackend } = useAuditStore();
  
  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get('role') as 'organization' | 'auditor' ?? 'auditor';

  const [isLogin, setIsLogin] = useState(true);
  const [role, setLocalRole] = useState<'organization' | 'auditor'>(initialRole);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyId, setCompanyId] = useState<string>('');
  const [newCompanyName, setNewCompanyName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load companies when page mounts (needed for registration dropdown)
  useEffect(() => {
    if (organizations.length === 0) {
      loadFromBackend();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin 
        ? { email, password }
        : { 
            email, 
            password, 
            name, 
            role, 
            companyId: (role === 'organization' && companyId !== 'NEW_COMPANY' && companyId !== '') ? Number(companyId) : null,
            newCompanyName: (role === 'organization' && companyId === 'NEW_COMPANY') ? newCompanyName : null
          };

      const res = await api.post(endpoint, payload);
      const { token, role: userRole } = res.data;

      // Save token and state
      setToken(token);
      setRole(userRole);
      
      // Load data with new token
      await loadFromBackend();

      if (userRole === 'organization') {
        const firstOrg = useAuditStore.getState().organizations[0];
        if (firstOrg) setCurrentOrg(firstOrg.id);
        navigate('/org/dashboard');
      } else {
        navigate('/auditor/dashboard');
      }

    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-lg">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            {role === 'organization' ? <Building2 className="w-7 h-7 text-primary" /> : <Shield className="w-7 h-7 text-primary" />}
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            {role === 'organization' ? 'Organization Portal' : 'Auditor Portal'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Role Toggle for Registration */}
          {!isLogin && (
            <div className="flex bg-surface p-1 rounded-lg mb-6 border border-border">
              <button
                type="button"
                onClick={() => setLocalRole('organization')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === 'organization' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Organization
              </button>
              <button
                type="button"
                onClick={() => setLocalRole('auditor')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === 'auditor' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Auditor
              </button>
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="John Doe"
              />
            </div>
          )}

          {!isLogin && role === 'organization' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Select Company</label>
                <select
                  required
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                >
                  <option value="">-- Choose Company --</option>
                  <option value="NEW_COMPANY">+ Register New Company</option>
                  {organizations.map(org => (
                    <option key={org.backendId} value={org.backendId}>{org.name}</option>
                  ))}
                </select>
              </div>

              {companyId === 'NEW_COMPANY' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">New Company Name</label>
                  <input
                    type="text"
                    required
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="e.g. Tata"
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-medium rounded-lg px-4 py-2.5 mt-6 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline font-medium"
          >
            {isLogin ? 'Register' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
