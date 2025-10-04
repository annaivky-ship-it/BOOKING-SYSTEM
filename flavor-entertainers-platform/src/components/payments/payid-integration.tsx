'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  CreditCard,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Phone,
  Mail,
  Building,
  Zap,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  Send,
  ArrowRight,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PayIDAccount {
  id: string;
  user_id: string;
  payid_identifier: string;
  payid_type: 'email' | 'phone' | 'abn';
  account_name: string;
  bank_name: string;
  bsb?: string;
  account_number?: string;
  is_verified: boolean;
  is_active: boolean;
  verification_status: 'pending' | 'verified' | 'failed' | 'expired';
  created_at: string;
  updated_at: string;
  last_used?: string;
}

interface PayIDTransaction {
  id: string;
  booking_id: string;
  payer_name: string;
  payer_payid: string;
  recipient_payid: string;
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  reference_number: string;
  fee_amount: number;
  net_amount: number;
  initiated_at: string;
  completed_at?: string;
  failure_reason?: string;
}

interface PayIDIntegrationProps {
  performerId: string;
  className?: string;
  onPaymentReceived?: (transaction: PayIDTransaction) => void;
}

const payidTypes = [
  {
    value: 'email',
    label: 'Email Address',
    icon: Mail,
    description: 'Use your email as PayID',
    placeholder: 'performer@email.com'
  },
  {
    value: 'phone',
    label: 'Mobile Number',
    icon: Phone,
    description: 'Use your mobile number as PayID',
    placeholder: '+61400123456'
  },
  {
    value: 'abn',
    label: 'ABN',
    icon: Building,
    description: 'Use your ABN as PayID',
    placeholder: '12345678901'
  }
];

const australianBanks = [
  { code: 'CBA', name: 'Commonwealth Bank', bsb: '062' },
  { code: 'WBC', name: 'Westpac Banking Corporation', bsb: '032' },
  { code: 'ANZ', name: 'Australia and New Zealand Banking Group', bsb: '013' },
  { code: 'NAB', name: 'National Australia Bank', bsb: '083' },
  { code: 'BEN', name: 'Bendigo Bank', bsb: '633' },
  { code: 'BOQ', name: 'Bank of Queensland', bsb: '124' },
  { code: 'SGB', name: 'St.George Bank', bsb: '112' },
  { code: 'ING', name: 'ING Bank Australia', bsb: '923' },
  { code: 'MAC', name: 'Macquarie Bank', bsb: '182' },
  { code: 'UNI', name: 'Unibank', bsb: '704' }
];

export function PayIDIntegration({
  performerId,
  className,
  onPaymentReceived
}: PayIDIntegrationProps) {
  const [accounts, setAccounts] = useState<PayIDAccount[]>([]);
  const [transactions, setTransactions] = useState<PayIDTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'transactions'>('overview');

  // New account form state
  const [newAccount, setNewAccount] = useState({
    payid_type: 'email' as PayIDAccount['payid_type'],
    payid_identifier: '',
    account_name: '',
    bank_name: '',
    bsb: '',
    account_number: ''
  });

  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    loadPayIDData();

    // Simulate real-time transaction monitoring
    const interval = setInterval(() => {
      if (Math.random() > 0.9) {
        simulateNewTransaction();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [performerId]);

  const loadPayIDData = async () => {
    setIsLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      const mockAccounts: PayIDAccount[] = [
        {
          id: 'payid_1',
          user_id: performerId,
          payid_identifier: 'performer@email.com',
          payid_type: 'email',
          account_name: 'Anna Performer',
          bank_name: 'Commonwealth Bank',
          bsb: '062001',
          account_number: '****1234',
          is_verified: true,
          is_active: true,
          verification_status: 'verified',
          created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
          updated_at: new Date().toISOString(),
          last_used: new Date(Date.now() - 86400000 * 2).toISOString()
        }
      ];

      const mockTransactions: PayIDTransaction[] = [
        {
          id: 'txn_1',
          booking_id: 'booking_1',
          payer_name: 'Sarah Wilson',
          payer_payid: 'sarah.wilson@email.com',
          recipient_payid: 'performer@email.com',
          amount: 375.00,
          currency: 'AUD',
          description: 'Deposit for wedding performance - March 15th',
          status: 'completed',
          reference_number: 'FE20241215001',
          fee_amount: 3.75,
          net_amount: 371.25,
          initiated_at: new Date(Date.now() - 3600000).toISOString(),
          completed_at: new Date(Date.now() - 3000000).toISOString()
        },
        {
          id: 'txn_2',
          booking_id: 'booking_2',
          payer_name: 'Mike Johnson',
          payer_payid: '+61400123789',
          recipient_payid: 'performer@email.com',
          amount: 450.00,
          currency: 'AUD',
          description: 'Payment for corporate event performance',
          status: 'processing',
          reference_number: 'FE20241215002',
          fee_amount: 4.50,
          net_amount: 445.50,
          initiated_at: new Date(Date.now() - 1800000).toISOString()
        }
      ];

      setAccounts(mockAccounts);
      setTransactions(mockTransactions);
    } catch (error) {
      toast.error('Failed to load PayID data');
    } finally {
      setIsLoading(false);
    }
  };

  const simulateNewTransaction = () => {
    const newTransaction: PayIDTransaction = {
      id: `txn_${Date.now()}`,
      booking_id: `booking_${Date.now()}`,
      payer_name: ['Emma Davis', 'John Smith', 'Lisa Brown'][Math.floor(Math.random() * 3)],
      payer_payid: 'client@email.com',
      recipient_payid: accounts[0]?.payid_identifier || 'performer@email.com',
      amount: Math.floor(Math.random() * 500) + 200,
      currency: 'AUD',
      description: 'Booking deposit payment',
      status: 'completed',
      reference_number: `FE${Date.now()}`,
      fee_amount: 0,
      net_amount: 0,
      initiated_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    };

    newTransaction.fee_amount = newTransaction.amount * 0.01; // 1% fee
    newTransaction.net_amount = newTransaction.amount - newTransaction.fee_amount;

    setTransactions(prev => [newTransaction, ...prev]);
    onPaymentReceived?.(newTransaction);

    toast.success(
      `PayID payment received: $${newTransaction.amount.toFixed(2)}`,
      {
        description: `From ${newTransaction.payer_name} • Net: $${newTransaction.net_amount.toFixed(2)}`,
        duration: 5000,
      }
    );
  };

  const setupPayID = async () => {
    if (!newAccount.payid_identifier || !newAccount.account_name || !newAccount.bank_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsVerifying(true);
    try {
      // Simulate PayID verification
      await new Promise(resolve => setTimeout(resolve, 3000));

      const account: PayIDAccount = {
        id: `payid_${Date.now()}`,
        user_id: performerId,
        payid_identifier: newAccount.payid_identifier,
        payid_type: newAccount.payid_type,
        account_name: newAccount.account_name,
        bank_name: newAccount.bank_name,
        bsb: newAccount.bsb,
        account_number: newAccount.account_number,
        is_verified: true,
        is_active: true,
        verification_status: 'verified',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setAccounts(prev => [account, ...prev]);
      setShowSetupDialog(false);
      setNewAccount({
        payid_type: 'email',
        payid_identifier: '',
        account_name: '',
        bank_name: '',
        bsb: '',
        account_number: ''
      });

      toast.success('PayID account setup successfully!');
    } catch (error) {
      toast.error('Failed to set up PayID account');
    } finally {
      setIsVerifying(false);
    }
  };

  const validatePayID = (type: string, value: string): boolean => {
    switch (type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'phone':
        return /^\+61[4-5]\d{8}$/.test(value.replace(/\s/g, ''));
      case 'abn':
        return /^\d{11}$/.test(value.replace(/\s/g, ''));
      default:
        return false;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'processing': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'pending': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      case 'cancelled': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const totalReceived = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.net_amount, 0);

  const pendingAmount = transactions
    .filter(t => t.status === 'processing' || t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <CreditCard className="w-6 h-6 text-primary" />
            <span>PayID Integration</span>
          </h2>
          <p className="text-muted-foreground">
            Instant payments with Australia's PayID system
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Zap className="w-3 h-3 mr-1" />
            Real-time
          </Badge>
          {accounts.length === 0 && (
            <Button onClick={() => setShowSetupDialog(true)}>
              <CreditCard className="w-4 h-4 mr-2" />
              Setup PayID
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Total Received</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalReceived)}
              </div>
              <div className="text-sm text-muted-foreground">
                {transactions.filter(t => t.status === 'completed').length} payments
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium">Pending</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(pendingAmount)}
              </div>
              <div className="text-sm text-muted-foreground">
                {transactions.filter(t => t.status === 'processing' || t.status === 'pending').length} payments
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Active Accounts</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-blue-600">
                {accounts.filter(a => a.is_active).length}
              </div>
              <div className="text-sm text-muted-foreground">
                {accounts.filter(a => a.is_verified).length} verified
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* No PayID Setup Alert */}
      {accounts.length === 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Setup PayID to start receiving instant payments.</strong> PayID allows clients to send payments instantly using just your email, phone number, or ABN.
            <Button variant="link" className="p-0 h-auto ml-2 text-blue-600" onClick={() => setShowSetupDialog(true)}>
              Setup now →
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* PayID Accounts */}
      {accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>PayID Accounts</span>
              <Button variant="outline" size="sm" onClick={() => setShowSetupDialog(true)}>
                <CreditCard className="w-4 h-4 mr-2" />
                Add Account
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accounts.map(account => {
                const typeConfig = payidTypes.find(t => t.value === account.payid_type);
                const IconComponent = typeConfig?.icon || Mail;

                return (
                  <div key={account.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{account.payid_identifier}</div>
                          <div className="text-sm text-muted-foreground">
                            {account.account_name} • {account.bank_name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {account.is_verified ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAccountDetails(!showAccountDetails)}
                        >
                          {showAccountDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    {showAccountDetails && (
                      <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">BSB:</span>
                          <span className="ml-2 font-mono">{account.bsb}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Account:</span>
                          <span className="ml-2 font-mono">{account.account_number}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <span className="ml-2">{new Date(account.created_at).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Used:</span>
                          <span className="ml-2">
                            {account.last_used ? new Date(account.last_used).toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Transactions</span>
            <Button variant="outline" size="sm" onClick={loadPayIDData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">Payments will appear here once clients start using PayID</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, 5).map(transaction => (
                <div key={transaction.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{transaction.payer_name}</span>
                        <Badge variant="outline" className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {transaction.description}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Ref: {transaction.reference_number} • From: {transaction.payer_payid}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {formatCurrency(transaction.amount)}
                      </div>
                      {transaction.status === 'completed' && (
                        <div className="text-sm text-muted-foreground">
                          Net: {formatCurrency(transaction.net_amount)}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.initiated_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup PayID Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Setup PayID Account</DialogTitle>
            <DialogDescription>
              Connect your bank account to receive instant payments from clients via PayID.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* PayID Type Selection */}
            <div>
              <Label>PayID Type</Label>
              <Select value={newAccount.payid_type} onValueChange={(value: any) => setNewAccount({...newAccount, payid_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {payidTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <type.icon className="w-4 h-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* PayID Identifier */}
            <div>
              <Label>PayID Identifier</Label>
              <Input
                placeholder={payidTypes.find(t => t.value === newAccount.payid_type)?.placeholder}
                value={newAccount.payid_identifier}
                onChange={(e) => setNewAccount({...newAccount, payid_identifier: e.target.value})}
              />
              {newAccount.payid_identifier && !validatePayID(newAccount.payid_type, newAccount.payid_identifier) && (
                <p className="text-sm text-red-600 mt-1">
                  Please enter a valid {payidTypes.find(t => t.value === newAccount.payid_type)?.label.toLowerCase()}
                </p>
              )}
            </div>

            {/* Account Name */}
            <div>
              <Label>Account Name</Label>
              <Input
                placeholder="Name on bank account"
                value={newAccount.account_name}
                onChange={(e) => setNewAccount({...newAccount, account_name: e.target.value})}
              />
            </div>

            {/* Bank Selection */}
            <div>
              <Label>Bank</Label>
              <Select value={newAccount.bank_name} onValueChange={(value) => {
                const bank = australianBanks.find(b => b.name === value);
                setNewAccount({
                  ...newAccount,
                  bank_name: value,
                  bsb: bank?.bsb || ''
                });
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent>
                  {australianBanks.map(bank => (
                    <SelectItem key={bank.code} value={bank.name}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* BSB */}
            <div>
              <Label>BSB</Label>
              <Input
                placeholder="123-456"
                value={newAccount.bsb}
                onChange={(e) => setNewAccount({...newAccount, bsb: e.target.value})}
                maxLength={7}
              />
            </div>

            {/* Account Number */}
            <div>
              <Label>Account Number</Label>
              <Input
                placeholder="123456789"
                value={newAccount.account_number}
                onChange={(e) => setNewAccount({...newAccount, account_number: e.target.value})}
                maxLength={12}
              />
            </div>

            {/* Security Notice */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your banking details are encrypted and secure. PayID verification typically takes 1-2 business days.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                onClick={setupPayID}
                disabled={isVerifying || !validatePayID(newAccount.payid_type, newAccount.payid_identifier)}
                className="flex-1"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Setup PayID
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowSetupDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}