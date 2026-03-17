import { useState, useCallback } from 'react';
import { Zap, DollarSign, TrendingUp, ArrowRight, CheckCircle, Star, Flame, Award, Lock } from 'lucide-react';
import { PaymentModal } from '../components/PaymentModal';
import { useStore } from '../lib/store';

export function FundedAccountsPage() {
  const { account, user, purchasedFundedAccounts, purchaseFundedAccount } = useStore();
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    plan: null as any
  });

  const handleClosePayment = useCallback(() => {
    setPaymentModal({ isOpen: false, plan: null });
  }, []);

  const handlePaymentDone = useCallback(() => {
    if (paymentModal.plan) {
      const plan = paymentModal.plan;
      purchaseFundedAccount(plan.id, plan.name, plan.capital, plan.price, plan.profitTarget, plan.maxDrawdown);
    }
    handleClosePayment();
  }, [paymentModal.plan, purchaseFundedAccount, handleClosePayment]);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 0,
      type: 'FREE',
      capital: 5000,
      profitTarget: 200,
      maxDrawdown: 10,
      duration: '30 days',
      topUpRequired: true,
      features: [
        'Up to $5,000 trading capital',
        '4% profit target',
        '10% max drawdown',
        '30-day duration',
        'Demo account access',
        'Email support',
        'Basic strategy allowed',
        'Manual trading only'
      ],
      highlighted: false,
      badge: 'Free Trial'
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 299,
      type: 'PAID',
      capital: 50000,
      profitTarget: 2000,
      maxDrawdown: 8,
      duration: '90 days',
      topUpRequired: false,
      features: [
        'Up to $50,000 trading capital',
        '4% profit target',
        '8% max drawdown',
        '90-day duration',
        'Real account access',
        'Priority support',
        'Scalping & day trading allowed',
        'Algo trading enabled',
        'Withdrawal upon completion',
        'Account reset option'
      ],
      highlighted: true,
      badge: 'Most Popular'
    },
    {
      id: 'elite',
      name: 'Elite',
      price: 799,
      type: 'PAID',
      capital: 200000,
      profitTarget: 8000,
      maxDrawdown: 6,
      duration: '180 days',
      topUpRequired: false,
      features: [
        'Up to $200,000 trading capital',
        '4% profit target',
        '6% max drawdown',
        '180-day duration',
        'Real account access',
        'VIP support (24/7)',
        'All strategies allowed',
        'Advanced tools & indicators',
        'Dedicated account manager',
        'Flexible withdrawal',
        'Account reset option',
        'Performance bonus up to 20%'
      ],
      highlighted: false,
      badge: 'Premium'
    },
    {
      id: 'infinite',
      name: 'Infinite',
      price: 1999,
      type: 'PAID',
      capital: 500000,
      profitTarget: 20000,
      maxDrawdown: 5,
      duration: 'Unlimited',
      topUpRequired: false,
      features: [
        'Unlimited trading capital',
        '4% profit target',
        '5% max drawdown',
        'Unlimited duration',
        'Real account access',
        'VIP support (24/7)',
        'All strategies allowed',
        'Premium tools & data',
        'Dedicated fund manager',
        'Monthly withdrawals',
        'Performance bonus up to 30%',
        'Custom trading hours',
        'Risk management customization'
      ],
      highlighted: false,
      badge: 'Ultimate'
    }
  ];

  const handleUpgrade = (plan: any) => {
    if (plan.price === 0) {
      // Free plan auto-approval and immediate purchase
      purchaseFundedAccount(plan.id, plan.name, plan.capital, plan.price, plan.profitTarget, plan.maxDrawdown);
      setPaymentModal({ isOpen: false, plan: null });
      alert('✅ Free funded account request submitted');
    } else {
      setPaymentModal({
        isOpen: true,
        plan
      });
    }
  };



  // derive current user's funded account requests
  const userFunded = user
    ? purchasedFundedAccounts.filter(a => a.userId === user.id)
    : [];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-12 pb-20 md:pb-6">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#0d1117] via-[#161b22] to-[#0d1117] border border-[#21262d] rounded-lg overflow-hidden p-8 md:p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#2962ff] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-[#2962ff]" />
            <span className="text-[#2962ff] font-bold text-sm">FUNDED TRADING ACCOUNTS</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">Trade with Our Capital</h1>
          <p className="text-gray-600 dark:text-[#8b949e] text-lg">
            Get access to real trading capital and start earning profits. Pass our simple evaluation and get funded with up to $500,000.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-lg p-4 space-y-2">
          <DollarSign className="h-5 w-5 text-[#2962ff]" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">$1.5M+</p>
          <p className="text-xs text-gray-600 dark:text-[#8b949e]">Capital Deployed</p>
        </div>
        <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-lg p-4 space-y-2">
          <Award className="h-5 w-5 text-[#26a69a]" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">2,847</p>
          <p className="text-xs text-gray-600 dark:text-[#8b949e]">Active Traders</p>
        </div>
        <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-lg p-4 space-y-2">
          <TrendingUp className="h-5 w-5 text-yellow-500" />
          <p className="text-2xl font-bold text-[#26a69a]">$487K+</p>
          <p className="text-xs text-gray-600 dark:text-[#8b949e]">Profits Generated</p>
        </div>
        <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-lg p-4 space-y-2">
          <Star className="h-5 w-5 text-orange-500" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">4.8/5</p>
          <p className="text-xs text-gray-600 dark:text-[#8b949e]">Trader Rating</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { num: 1, title: 'Choose a Plan', desc: 'Select the funded account that suits your trading style' },
            { num: 2, title: 'Apply/Pay', desc: 'Complete application or secure payment' },
            { num: 3, title: 'Get Funded', desc: 'Receive instant access to your trading account' },
            { num: 4, title: 'Start Trading', desc: 'Begin trading and earn up to 70% of profits' }
          ].map((step, idx) => (
            <div key={idx} className="relative">
              <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 space-y-3">
                <div className="w-10 h-10 bg-[#2962ff] rounded-full flex items-center justify-center font-bold text-white">
                  {step.num}
                </div>
                <h3 className="font-bold text-white">{step.title}</h3>
                <p className="text-sm text-[#8b949e]">{step.desc}</p>
              </div>
              {idx < 3 && <ArrowRight className="absolute -right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#21262d] hidden md:block" />}
            </div>
          ))}
        </div>
      </div>

      {/* User Funded Account Status */}
      {user && (
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">My Funded Account Requests</h2>
          {userFunded.length > 0 ? (
            <div className="space-y-4">
              {userFunded.map((acc) => (
                <div key={acc.id} className="p-4 bg-[#0d1117] rounded-lg border border-[#21262d] flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">{acc.planName}</p>
                    <p className="text-xs text-[#8b949e]">Capital: ${acc.capital.toLocaleString()}</p>
                    <p className="text-xs text-yellow-500">Status: {acc.status}</p>
                  </div>
                  {acc.status === 'PENDING_APPROVAL' && (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded text-xs font-bold">Pending</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#8b949e]">No funded account requests yet.</p>
          )}
        </div>
      )}

      {/* Pricing Plans */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">Funding Plans</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto">Choose the plan that fits your trading strategy and experience level</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative border rounded-lg overflow-hidden transition-all ${
                plan.highlighted
                  ? 'border-[#2962ff] bg-[#161b22] ring-2 ring-[#2962ff]/20 md:scale-105'
                  : 'border-[#21262d] bg-[#161b22] hover:border-[#30363d]'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-[#2962ff] to-[#1e47a0] px-4 py-1 text-xs font-bold text-white rounded-bl-lg">
                  {plan.badge}
                </div>
              )}

              <div className="p-6 space-y-6 flex flex-col h-full">
                {/* Header */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                  {plan.price === 0 ? (
                    <p className="text-[#26a69a] font-bold text-lg">Free Application</p>
                  ) : (
                    <div>
                      <span className="text-4xl font-bold text-white">${plan.price}</span>
                      <span className="text-[#8b949e] ml-2">one-time</span>
                    </div>
                  )}
                </div>

                {/* Key Metrics */}
                <div className="space-y-3 border-t border-b border-[#21262d] py-4">
                  <div>
                    <p className="text-xs text-[#8b949e]">TRADING CAPITAL</p>
                    <p className="text-lg font-bold text-[#2962ff]">${plan.capital.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8b949e]">PROFIT TARGET</p>
                    <p className="text-lg font-bold text-[#26a69a]">{plan.profitTarget}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8b949e]">MAX DRAWDOWN</p>
                    <p className="text-lg font-bold text-white">{plan.maxDrawdown}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8b949e]">DURATION</p>
                    <p className="text-lg font-bold text-white">{plan.duration}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="flex-1 space-y-2">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-[#26a69a] flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-[#8b949e]">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleUpgrade(plan)}
                  className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                    plan.highlighted
                      ? 'bg-[#2962ff] hover:bg-[#1e47a0] text-white shadow-lg shadow-blue-500/20'
                      : 'bg-[#26a69a] hover:bg-teal-600 text-white'
                  }`}
                >
                  {plan.price === 0 ? 'Start Free Trial' : 'Get Funded'} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-8 space-y-6">
        <h2 className="text-2xl font-bold text-white">Requirements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-[#2962ff]" />
              <h3 className="font-bold text-white">Account Setup</h3>
            </div>
            <ul className="text-sm text-[#8b949e] space-y-2">
              <li>✓ Valid email address</li>
              <li>✓ KYC verification</li>
              <li>✓ Account registration</li>
              <li>✓ Trading experience</li>
            </ul>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Flame className="h-5 w-5 text-orange-500" />
              <h3 className="font-bold text-white">Trading Rules</h3>
            </div>
            <ul className="text-sm text-[#8b949e] space-y-2">
              <li>✓ Achieve profit target</li>
              <li>✓ Stay within drawdown limit</li>
              <li>✓ Follow risk management</li>
              <li>✓ No hedging allowed</li>
            </ul>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-[#26a69a]" />
              <h3 className="font-bold text-white">Profit Sharing</h3>
            </div>
            <ul className="text-sm text-[#8b949e] space-y-2">
              <li>✓ You keep 70% of profits</li>
              <li>✓ We take 30% fee</li>
              <li>✓ Withdrawals after success</li>
              <li>✓ Monthly payouts available</li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { q: 'How long does approval take?', a: 'Free trials are instant. Paid accounts are approved within 24 hours of payment.' },
            { q: 'Can I use multiple accounts?', a: 'No, one funded account per trader. However, you can upgrade to a higher tier.' },
            { q: 'What if I lose the account?', a: 'You can reapply after 30 days. Account reset options are available on higher plans.' },
            { q: 'Are there any hidden fees?', a: 'No hidden fees. We charge 30% of profits. Commission is taken when you withdraw.' },
            { q: 'What trading platforms are supported?', a: 'MetaTrader 4, MetaTrader 5, and our web trading platform.' },
            { q: 'How do I withdraw profits?', a: 'Withdraw anytime after reaching profit target. Payouts are processed within 3-5 business days.' }
          ].map((faq, idx) => (
            <div key={idx} className="bg-[#161b22] border border-[#21262d] rounded-lg p-4 space-y-2">
              <p className="font-bold text-white">{faq.q}</p>
              <p className="text-sm text-[#8b949e]">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#2962ff] to-[#1e47a0] rounded-lg p-12 text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">Ready to Get Funded?</h2>
        <p className="text-blue-100 max-w-md mx-auto">
          Join thousands of traders already profiting with our funded accounts
        </p>
        <button className="px-8 py-3 bg-white text-[#2962ff] font-bold rounded-lg hover:bg-gray-100 transition-colors">
          Start Your Free Trial
        </button>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={handleClosePayment}
        amount={paymentModal.plan?.price || 0}
        itemName={`${paymentModal.plan?.name} Funded Account`}
        currentBalance={account.balance}
        onPaymentComplete={handlePaymentDone}
      />
    </div>
  );
}
