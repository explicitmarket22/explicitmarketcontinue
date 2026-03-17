import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function ReferralPage() {
  const { user, referralRecords, getReferralStats } = useStore();
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const stats = getReferralStats(user.id);
  const userReferrals = referralRecords.filter(r => r.referrerId === user.id);
  const referralLink = `${window.location.origin}/auth/signup?ref=${user.referralCode}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Referral Program
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Earn $25 for every person you refer who signs up
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-sm text-gray-600 dark:text-gray-400">
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.totalReferrals}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-sm text-gray-600 dark:text-gray-400">
              Completed Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              ${stats.totalEarnings.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-sm text-gray-600 dark:text-gray-400">
              Pending Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              ${stats.pendingEarnings.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Section */}
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
        <CardHeader>
          <CardTitle>Your Referral Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Referral Code</p>
            <div className="flex items-center gap-2">
              <code className="text-lg font-mono font-bold text-gray-900 dark:text-white flex-1">
                {user.referralCode}
              </code>
              <Button
                size="sm"
                onClick={() => copyToClipboard(user.referralCode || '')}
                className="whitespace-nowrap"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Referral Link</p>
            <div className="flex items-center gap-2">
              <div className="text-sm font-mono text-gray-900 dark:text-white flex-1 break-all">
                {referralLink}
              </div>
              <Button
                size="sm"
                onClick={() => copyToClipboard(referralLink)}
                className="whitespace-nowrap"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm font-semibold text-green-900 dark:text-green-200 mb-2">
              💡 How it works
            </p>
            <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
              <li>• Share your referral code or link with friends</li>
              <li>• They sign up using your code - they get $25 bonus on first deposit</li>
              <li>• You earn $25 when they complete their first deposit</li>
              <li>• Unlimited referrals = Unlimited earnings!</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
        <CardHeader>
          <CardTitle>Your Referrals ({userReferrals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {userReferrals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                You haven't referred anyone yet. Share your code to get started!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">
                      Bonus
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {userReferrals.map((referral) => (
                    <tr
                      key={referral.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                    >
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {referral.referredUserName}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {referral.referredUserEmail}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        ${referral.bonusAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        {referral.status === 'COMPLETED' ? (
                          <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-semibold">
                            ✓ Completed
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-xs font-semibold">
                            ⏳ Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
