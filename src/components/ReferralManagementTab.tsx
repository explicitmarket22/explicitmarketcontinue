import { useState } from 'react';
import { Check, X, Plus, Edit2, DollarSign } from 'lucide-react';
import { useStore } from '../lib/store';

export function ReferralManagementTab() {
  const { referralRecords, allUsers, approveReferral, rejectReferral, manuallyAddReferral, adjustReferralBonus } = useStore();
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('pending');
  const [showAddManual, setShowAddManual] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  
  const [manualForm, setManualForm] = useState({
    userId: '',
    referrerId: '',
    bonusAmount: '25'
  });

  const filteredReferrals = referralRecords.filter(r => {
    if (activeFilter === 'all') return true;
    return r.status === activeFilter;
  });

  const pendingCount = referralRecords.filter(r => r.status === 'PENDING').length;
  const completedCount = referralRecords.filter(r => r.status === 'COMPLETED').length;
  const rejectedCount = referralRecords.filter(r => r.status === 'REJECTED').length;

  const handleApprove = (referralId: string) => {
    approveReferral(referralId);
    alert('✅ Referral approved! Bonus added to referrer balance.');
  };

  const handleReject = (referralId: string) => {
    rejectReferral(referralId);
    alert('❌ Referral rejected.');
  };

  const handleManualAdd = () => {
    if (!manualForm.userId || !manualForm.referrerId) {
      alert('❌ Please select both user and referrer');
      return;
    }
    manuallyAddReferral(manualForm.userId, manualForm.referrerId, parseInt(manualForm.bonusAmount) || 25);
    setManualForm({ userId: '', referrerId: '', bonusAmount: '25' });
    setShowAddManual(false);
    alert('✅ Manual referral added and bonus credited!');
  };

  const handleAdjustBonus = (referralId: string) => {
    if (!editAmount || isNaN(parseInt(editAmount))) {
      alert('❌ Please enter a valid amount');
      return;
    }
    adjustReferralBonus(referralId, parseInt(editAmount));
    setEditingId(null);
    setEditAmount('');
    alert('✅ Bonus adjusted!');
  };

  const getReferrerName = (referrerId: string) => {
    const referrer = allUsers.find(u => u.id === referrerId);
    return referrer?.name || 'Unknown';
  };

  const getRefereeName = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    return user?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="text-xs text-yellow-600 dark:text-yellow-200 uppercase font-semibold">Pending Approvals</div>
          <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-100">{pendingCount}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="text-xs text-green-600 dark:text-green-200 uppercase font-semibold">Completed</div>
          <div className="text-3xl font-bold text-green-700 dark:text-green-100">{completedCount}</div>
          <div className="text-xs text-green-600 dark:text-green-300 mt-1">Total Bonus: ${completedCount * 25}</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="text-xs text-red-600 dark:text-red-200 uppercase font-semibold">Rejected</div>
          <div className="text-3xl font-bold text-red-700 dark:text-red-100">{rejectedCount}</div>
        </div>
      </div>

      {/* Manual Add Button */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowAddManual(!showAddManual)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          Manually Add Referral
        </button>
      </div>

      {/* Manual Add Form */}
      {showAddManual && (
        <div className="bg-gray-50 dark:bg-[#0d1117] border border-gray-300 dark:border-[#21262d] rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Manually Add Referral</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#8b949e] mb-1">Referred User</label>
              <select
                value={manualForm.userId}
                onChange={(e) => setManualForm({...manualForm, userId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white"
              >
                <option value="">Select user...</option>
                {allUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#8b949e] mb-1">Referrer User</label>
              <select
                value={manualForm.referrerId}
                onChange={(e) => setManualForm({...manualForm, referrerId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white"
              >
                <option value="">Select referrer...</option>
                {allUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#8b949e] mb-1">Bonus Amount ($)</label>
              <input
                type="number"
                value={manualForm.bonusAmount}
                onChange={(e) => setManualForm({...manualForm, bonusAmount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleManualAdd}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Add Referral
            </button>
            <button
              onClick={() => setShowAddManual(false)}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-300 dark:border-[#21262d]">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 font-medium transition ${
            activeFilter === 'all'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          All ({referralRecords.length})
        </button>
        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-4 py-2 font-medium transition ${
            activeFilter === 'pending'
              ? 'text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-600 dark:border-yellow-400'
              : 'text-gray-600 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          className={`px-4 py-2 font-medium transition ${
            activeFilter === 'completed'
              ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
              : 'text-gray-600 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Completed ({completedCount})
        </button>
        <button
          onClick={() => setActiveFilter('rejected')}
          className={`px-4 py-2 font-medium transition ${
            activeFilter === 'rejected'
              ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400'
              : 'text-gray-600 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Rejected ({rejectedCount})
        </button>
      </div>

      {/* Referral Table */}
      <div className="overflow-x-auto border border-gray-300 dark:border-[#21262d] rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-[#0d1117] border-b border-gray-300 dark:border-[#21262d]">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Referrer</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">User</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Email</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">Bonus</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">Status</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReferrals.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-600 dark:text-[#8b949e]">
                  No referrals found
                </td>
              </tr>
            ) : (
              filteredReferrals.map(referral => (
                <tr key={referral.id} className="border-b border-gray-300 dark:border-[#21262d] hover:bg-gray-50 dark:hover:bg-[#0d1117]/50">
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{getReferrerName(referral.referrerId)}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{referral.referredUserName}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-[#8b949e]">{referral.referredUserEmail}</td>
                  <td className="px-4 py-3 text-center">
                    {editingId === referral.id ? (
                      <div className="flex items-center gap-1 justify-center">
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 dark:border-[#30363d] rounded bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white"
                          autoFocus
                        />
                        <button
                          onClick={() => handleAdjustBonus(referral.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        ${referral.bonusAmount}
                        <button
                          onClick={() => {
                            setEditingId(referral.id);
                            setEditAmount(referral.bonusAmount.toString());
                          }}
                          className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      referral.status === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-200' :
                      referral.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200'
                    }`}>
                      {referral.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      {referral.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(referral.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition"
                            title="Approve and credit $25 to referrer"
                          >
                            <Check className="h-3 w-3" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(referral.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition"
                          >
                            <X className="h-3 w-3" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
