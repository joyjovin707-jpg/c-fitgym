import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Member, PaymentRecord } from '../../types/index.ts';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: Omit<PaymentRecord, 'id'>) => Promise<void>;
  members: Member[];
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  members,
}) => {
  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState('2500');
  const [dueDate, setDueDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending' | 'Overdue'>('Paid');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (members.length > 0 && !memberId) {
      setMemberId(members[0].member_id);
    }
    const today = new Date().toISOString().split('T')[0];
    setDueDate(today);
    setAmount('2500');
    setPaymentStatus('Paid');
    setError('');
  }, [isOpen, members]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !amount || !dueDate) {
      setError('Please fill in all required fields.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const selectedMember = members.find((m) => m.member_id === memberId);
      const planDesc = selectedMember ? `${selectedMember.plan_type} fee` : 'Membership fee';
      await onSave({
        member_id: memberId,
        plan_description: planDesc,
        amount: parseFloat(amount) || 0,
        due_date: dueDate,
        payment_status: paymentStatus,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save payment record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#2C3034]">
          <h2 className="text-lg font-bold text-[#EDEEEA]">Record Payment / Invoice</h2>
          <button onClick={onClose} className="text-[#9A9E9F] hover:text-[#EDEEEA] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#FF5F45]/15 border border-[#FF5F45]/40 text-[#FF5F45] text-xs rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
              Member *
            </label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
              required
            >
              {members.map((m) => (
                <option key={m.member_id} value={m.member_id}>
                  {m.member_id} — {m.full_name} ({m.plan_type})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                step="50"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] font-mono focus:outline-none focus:border-[#C9FF3D]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
                Due / Paid Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as any)}
              className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2C3034]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold text-[#EDEEEA] border border-[#2C3034] hover:bg-[#212528] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-[#C9FF3D] text-[#101214] hover:bg-[#b8eb32] cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
