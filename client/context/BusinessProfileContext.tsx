/**
 * Business Profile Context
 * Provides business profile data to all child components with a single API call
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getCurrentBusinessAccount, type BusinessAccount } from '../services/businessAccountService';

export interface BusinessProfileContextValue {
  businessAccount: BusinessAccount | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const BusinessProfileContext = createContext<BusinessProfileContextValue | undefined>(undefined);

export function BusinessProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [businessAccount, setBusinessAccount] = useState<BusinessAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinessProfile = useCallback(async () => {
    if (!user?.accountId || !isAuthenticated) {
      setBusinessAccount(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const account = await getCurrentBusinessAccount(Number(user.accountId));
      setBusinessAccount(account);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch business profile';
      setError(errorMessage);
      console.error('Business profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.accountId, isAuthenticated]);

  // Fetch on mount and when user changes
  useEffect(() => {
    fetchBusinessProfile();
  }, [fetchBusinessProfile]);

  const refetch = useCallback(async () => {
    await fetchBusinessProfile();
  }, [fetchBusinessProfile]);

  const value: BusinessProfileContextValue = {
    businessAccount,
    loading,
    error,
    refetch,
  };

  return (
    <BusinessProfileContext.Provider value={value}>
      {children}
    </BusinessProfileContext.Provider>
  );
}

/**
 * Hook to access business profile context
 * Must be used within BusinessProfileProvider
 */
export function useBusinessProfile(): BusinessProfileContextValue {
  const context = useContext(BusinessProfileContext);
  if (context === undefined) {
    throw new Error('useBusinessProfile must be used within BusinessProfileProvider');
  }
  return context;
}

/**
 * Transform API business account data to UI-compatible formats
 */
export const businessProfileTransforms = {
  /**
   * Get formatted account status for UI display
   */
  getDisplayStatus: (accountStatus: string): string => {
    switch (accountStatus?.toUpperCase()) {
      case 'ACCOUNT_APPROVED':
      case 'APPROVED':
        return 'Active';
      case 'DRAFT':
        return 'Pending KYC';
      case 'ACCOUNT_CREATED':
        return 'Pending';
      case 'SUSPENDED':
        return 'Suspended';
      default:
        return accountStatus || 'Unknown';
    }
  },

  /**
   * Get primary GST tax identification
   */
  getPrimaryGstInfo: (taxIdentifications: BusinessAccount['taxIdentifications']) => {
    const gst = taxIdentifications?.find(
      (tax) => tax.taxType.type === 'GST' || tax.taxType.type === 'VAT' && tax.isPrimary
    );
    return {
      number: gst?.taxIdentifier || gst?.panNumber || '',
      status: gst?.status === 'Active' ? 'Verified' : gst?.status || 'Pending',
      expiryDate: gst?.validTo || '',
    };
  },

  /**
   * Check if distributor is assigned based on linked accounts
   */
  isDistributorAssigned: (linkedAccounts: BusinessAccount['linkedAccounts']) => {
    return linkedAccounts?.some(account => 
      account.parentAccountType === 'DISTRIBUTOR' && account.active
    ) || false;
  },

  /**
   * Format onboarding date from status timeline
   */
  getOnboardingDate: (statusTimeline: BusinessAccount['statusTimeLine']) => {
    const created = statusTimeline?.find(status => status.status === 'ACCOUNT_CREATED');
    return created?.changeDateTime || '';
  },

  /**
   * Check KYC approval status
   */
  isKycApproved: (accountStatus: string, taxIdentifications: BusinessAccount['taxIdentifications']) => {
    const isAccountApproved = accountStatus?.toUpperCase() === 'ACCOUNT_APPROVED';
    const hasVerifiedGst = taxIdentifications?.some(tax => 
      (tax.taxType.type === 'GST' || tax.taxType.type === 'VAT') && 
      tax.status === 'Active' && tax.isPrimary
    );
    return isAccountApproved && hasVerifiedGst;
  },

  /**
   * Get formatted payment terms from contracts
   */
  getPaymentTerms: (contracts: BusinessAccount['contracts']) => {
    const activeContract = contracts?.find(contract => contract.status === 'ACTIVE');
    return activeContract?.pmtTerms || 'Not specified';
  },

  /**
   * Get primary billing address
   */
  getPrimaryAddress: (addresses: BusinessAccount['addresses'], type: string = 'Billing') => {
    return addresses?.find(addr => addr.addrType === type) || addresses?.[0];
  },
};
