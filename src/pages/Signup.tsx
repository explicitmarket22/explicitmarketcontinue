import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Select } from '../components/ui/Select';

export function SignupPage() {
  const { login, allUsers } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [notRobot, setNotRobot] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Read referral code from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    if (!fullName.trim()) {
      setError('Full name is required');
      setIsLoading(false);
      return;
    }
    if (!phone.trim()) {
      setError('Phone number is required');
      setIsLoading(false);
      return;
    }
    if (!country) {
      setError('Country is required');
      setIsLoading(false);
      return;
    }
    if (!notRobot) {
      setError('Please confirm you are not a robot');
      setIsLoading(false);
      return;
    }

    // Simulate network delay
    setTimeout(() => {
      const signupData = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        country,
        password,
        referralCode: referralCode.trim() || undefined
      };

      const result = login(email, password, signupData);
      if (!result.success) {
        setError(result.error || 'Signup failed');
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
              Create Live Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {referralCode && allUsers && allUsers.some(u => u.referralCode === referralCode) && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-xs font-semibold">✅ Referral Applied</p>
                  <p className="text-green-300 text-xs">Code: <span className="font-mono">{referralCode}</span></p>
                  <p className="text-green-300 text-xs">You'll receive $25 bonus on first deposit!</p>
                </div>
              )}

              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="trader@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Phone Number"
                type="tel"
                placeholder="+1 (555) 123-4567"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <Select
                label="Country"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                options={[
                  { value: '', label: 'Select Country' },
                  { value: 'US', label: 'United States' },
                  { value: 'UK', label: 'United Kingdom' },
                  { value: 'CA', label: 'Canada' },
                  { value: 'DE', label: 'Germany' },
                  { value: 'FR', label: 'France' },
                  { value: 'JP', label: 'Japan' },
                  { value: 'AU', label: 'Australia' },
                  { value: 'IN', label: 'India' },
                  { value: 'BR', label: 'Brazil' },
                  { value: 'MX', label: 'Mexico' },
                  { value: 'IT', label: 'Italy' },
                  { value: 'ES', label: 'Spain' },
                  { value: 'NL', label: 'Netherlands' },
                  { value: 'SE', label: 'Sweden' },
                  { value: 'NO', label: 'Norway' },
                  { value: 'DK', label: 'Denmark' },
                  { value: 'FI', label: 'Finland' },
                  { value: 'PL', label: 'Poland' },
                  { value: 'CZ', label: 'Czech Republic' },
                  { value: 'AT', label: 'Austria' },
                  { value: 'CH', label: 'Switzerland' },
                  { value: 'BE', label: 'Belgium' },
                  { value: 'PT', label: 'Portugal' },
                  { value: 'GR', label: 'Greece' },
                  { value: 'HU', label: 'Hungary' },
                  { value: 'TR', label: 'Turkey' },
                  { value: 'RU', label: 'Russia' },
                  { value: 'CN', label: 'China' },
                  { value: 'KR', label: 'South Korea' },
                  { value: 'SG', label: 'Singapore' },
                  { value: 'MY', label: 'Malaysia' },
                  { value: 'TH', label: 'Thailand' },
                  { value: 'ID', label: 'Indonesia' },
                  { value: 'PH', label: 'Philippines' },
                  { value: 'VN', label: 'Vietnam' },
                  { value: 'ZA', label: 'South Africa' },
                  { value: 'EG', label: 'Egypt' },
                  { value: 'NG', label: 'Nigeria' },
                  { value: 'KE', label: 'Kenya' },
                  { value: 'GH', label: 'Ghana' },
                  { value: 'MA', label: 'Morocco' },
                  { value: 'TN', label: 'Tunisia' },
                  { value: 'AE', label: 'United Arab Emirates' },
                  { value: 'SA', label: 'Saudi Arabia' },
                  { value: 'IL', label: 'Israel' },
                  { value: 'PK', label: 'Pakistan' },
                  { value: 'BD', label: 'Bangladesh' },
                  { value: 'LK', label: 'Sri Lanka' }
                ]}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <Input
                label="Referral Code (Optional)"
                type="text"
                placeholder="Enter referral code to get $25 bonus"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
              />

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notRobot"
                  required
                  checked={notRobot}
                  onChange={(e) => setNotRobot(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
                />
                <label htmlFor="notRobot" className="text-xs text-gray-600 dark:text-gray-400">
                  I'm not a robot
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="rounded border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
                />
                <label htmlFor="terms" className="text-xs text-gray-600 dark:text-gray-400">
                  I accept the Terms & Conditions
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                Open Account
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600 dark:text-gray-500">
                Already have an account?{' '}
              </span>
              <button
                onClick={() => window.location.href = '/auth/login'}
                className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium"
              >
                Sign In
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
