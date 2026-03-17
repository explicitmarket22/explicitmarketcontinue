import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export function LoginPage() {
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const result = login(email, password);
      if (!result.success) {
        setError(result.error || 'Invalid email or password');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-black p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            ExplicitMarket
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Professional MT4-Style Trading Platform
          </p>
        </div>

        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl text-center text-gray-900 dark:text-white">
              Sign In to Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                placeholder="trader@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                Login to Dashboard
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600 dark:text-gray-500">
                Don't have an account?{' '}
              </span>
              <button
                onClick={() => window.location.href = '/auth/signup'}
                className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium"
              >
                Sign Up
              </button>
            </div>

            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs text-blue-400">
              <p className="font-semibold mb-1">Admin Access:</p>
              <p>Email: <span className="font-mono">admin@work.com</span></p>
              <p>Password: <span className="font-mono">admin</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
