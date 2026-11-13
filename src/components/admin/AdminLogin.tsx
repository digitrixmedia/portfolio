import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminLoginProps {
  onNavigate: (path: string, replace?: boolean) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onNavigate }) => {
  const {
    user,
    isAdmin,
    authReady,
    loading,
    firebaseConfigured,
    signInWithEmail,
    signInWithGoogle,
    sendPasswordReset,
    resendVerification,
    refreshAdminStatus,
    logout,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [needsConsoleEnableHint, setNeedsConsoleEnableHint] = useState(false);

  // Redirect authenticated admin to /admin/dashboard
  useEffect(() => {
    if (authReady && user && isAdmin) {
      onNavigate('/admin/dashboard', true);
    }
  }, [authReady, user, isAdmin, onNavigate]);

  const mapFirebaseError = (err: unknown): string => {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found')) {
      return 'Invalid email or password. Please verify your credentials.';
    }
    if (msg.includes('auth/operation-not-allowed')) {
      setNeedsConsoleEnableHint(true);
      return 'Email/Password sign-in is not yet enabled in Firebase Authentication. Enable it in the Firebase Console or sign in with Google below.';
    }
    if (msg.includes('auth/too-many-requests')) {
      return 'Too many failed attempts. Please wait a few minutes or reset your password.';
    }
    if (msg.includes('auth/popup-closed-by-user')) {
      return 'Sign-in popup was closed before completing authentication.';
    }
    if (msg.includes('auth/invalid-email')) {
      return 'Please enter a valid email address.';
    }
    return msg;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setNeedsConsoleEnableHint(false);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    try {
      await signInWithEmail(email, password);
    } catch (err) {
      setErrorMsg(mapFirebaseError(err));
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setNeedsConsoleEnableHint(false);
    try {
      await signInWithGoogle();
    } catch (err) {
      setErrorMsg(mapFirebaseError(err));
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your administrator email address.');
      return;
    }

    try {
      await sendPasswordReset(email);
      setInfoMsg(`Password reset email sent to ${email.trim()}. Check your inbox.`);
    } catch (err) {
      setErrorMsg(mapFirebaseError(err));
    }
  };

  const handleResendVerification = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    try {
      await resendVerification();
      setInfoMsg('Verification email sent. Please verify your inbox, then click "Check Verification".');
    } catch (err) {
      setErrorMsg(mapFirebaseError(err));
    }
  };

  const handleRefreshVerification = async () => {
    setErrorMsg(null);
    const verifiedAdmin = await refreshAdminStatus();
    if (!verifiedAdmin) {
      setErrorMsg('Your account is still unverified or lacks administrator authorization.');
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center text-white">
        <div className="flex items-center gap-3 text-sm font-mono text-neutral-400">
          <Loader2 className="w-5 h-5 animate-spin text-[#C8FF00]" />
          <span>Verifying security session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] bg-noise text-white flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden">
      {/* Subtle Ambient Light */}
      <div className="absolute -top-32 right-0 w-96 h-96 bg-[#C8FF00]/8 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Bar */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between z-10">
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portfolio</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#C8FF00] rotate-45" />
          <span className="font-display font-bold text-sm tracking-tight">
            DIGITRIX<span className="text-[#C8FF00] font-light ml-1">ADMIN</span>
          </span>
        </div>
      </div>

      {/* Main Auth Card */}
      <div className="max-w-md w-full mx-auto my-auto py-10 z-10">
        {!firebaseConfigured ? (
          <div className="bg-[#111111] border border-amber-500/30 rounded-2xl p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white">
              Firebase Configuration Required
            </h1>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Firebase Authentication, Firestore, and Storage credentials are missing. Provide valid configuration in <code className="text-[#C8FF00]">firebase-applet-config.json</code> or <code className="text-[#C8FF00]">VITE_FIREBASE_*</code> environment variables before signing in.
            </p>
          </div>
        ) : user && !user.emailVerified ? (
          /* Signed in but Email Not Verified */
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white mb-2">
                Email Verification Required
              </h1>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Signed in as <span className="text-white font-medium">{user.email}</span>. For security, Firestore and Storage rules require a verified email before granting administrator access.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-300">
                {errorMsg}
              </div>
            )}
            {infoMsg && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300">
                {infoMsg}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleRefreshVerification}
                disabled={loading}
                className="w-full py-3 px-4 bg-[#C8FF00] text-black font-semibold text-xs uppercase tracking-wider hover:bg-white transition-colors"
              >
                Check Verification Status
              </button>
              <button
                onClick={handleResendVerification}
                disabled={loading}
                className="w-full py-3 px-4 bg-[#181818] border border-white/10 text-white text-xs font-semibold uppercase tracking-wider hover:border-[#C8FF00] transition-colors"
              >
                Resend Verification Email
              </button>
              <button
                onClick={logout}
                className="w-full py-2.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : user && !isAdmin ? (
          /* Signed in but NOT an Authorized Administrator */
          <div className="bg-[#111111] border border-red-500/30 rounded-2xl p-8 space-y-6 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white mb-2">
                Unauthorized Account
              </h1>
              <p className="text-sm text-neutral-400 leading-relaxed">
                The account <span className="text-white font-medium">{user.email}</span> is authenticated, but does not have administrator privileges in <code className="text-[#C8FF00]">/admins/{user.uid}</code>.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={logout}
                className="w-full py-3 px-4 bg-[#C8FF00] text-black font-semibold text-xs uppercase tracking-wider hover:bg-white transition-colors"
              >
                Sign Out & Switch Account
              </button>
              <button
                onClick={() => onNavigate('/')}
                className="w-full py-3 px-4 bg-[#181818] border border-white/10 text-neutral-300 text-xs uppercase tracking-wider hover:text-white transition-colors"
              >
                Return to Portfolio
              </button>
            </div>
          </div>
        ) : (
          /* Standard Login / Forgot Password Screen */
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-7 sm:p-9 shadow-2xl space-y-7">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#C8FF00] mb-3">
                <Lock className="w-3.5 h-3.5" />
                <span>Private Studio Console</span>
              </div>
              <h1 className="font-display text-3xl font-black tracking-tight text-white">
                {mode === 'login' ? 'Admin Sign In.' : 'Reset Password.'}
              </h1>
              <p className="text-sm text-neutral-400 mt-1.5 font-light">
                {mode === 'login'
                  ? 'Authenticate via Firebase to manage projects, media assets, and site settings.'
                  : 'Enter your administrator email to receive a Firebase password reset link.'}
              </p>
            </div>

            {errorMsg && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 space-y-2">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
                {needsConsoleEnableHint && (
                  <p className="text-[11px] text-neutral-300 pl-6 leading-relaxed">
                    To enable Email/Password login: open <strong>Firebase Console → Authentication → Sign-in method</strong> and enable <strong>Email/Password</strong>, then create your admin user under the <strong>Users</strong> tab.
                  </p>
                )}
              </div>
            )}

            {infoMsg && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{infoMsg}</span>
              </div>
            )}

            {mode === 'login' ? (
              <>
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                      Admin Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="digitrixmedia.agency@gmail.com"
                        className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] pl-10 pr-4 py-3 rounded-lg text-sm text-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setErrorMsg(null);
                          setInfoMsg(null);
                        }}
                        className="text-xs font-mono text-neutral-400 hover:text-[#C8FF00] transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] pl-10 pr-11 py-3 rounded-lg text-sm text-white focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-1"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 bg-[#C8FF00] text-black font-semibold text-xs uppercase tracking-widest hover:bg-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span>Login to Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-white/10" />
                  <span className="flex-shrink mx-3 text-[11px] font-mono uppercase text-neutral-500">
                    Or Verified SSO
                  </span>
                  <div className="flex-grow border-t border-white/10" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#171717] border border-white/10 hover:border-white/30 text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Sign In with Google</span>
                </button>
              </>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                    Registered Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="digitrixmedia.agency@gmail.com"
                      className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] pl-10 pr-4 py-3 rounded-lg text-sm text-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 bg-[#C8FF00] text-black font-semibold text-xs uppercase tracking-widest hover:bg-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Reset Link...</span>
                    </>
                  ) : (
                    <span>Send Password Reset Link</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                    setInfoMsg(null);
                  }}
                  className="w-full py-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
                >
                  Return to Sign In
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <div className="max-w-7xl w-full mx-auto text-center text-[11px] font-mono text-neutral-600 z-10">
        Protected by Firebase Authentication & Zero-Trust Firestore Security Rules
      </div>
    </div>
  );
};
