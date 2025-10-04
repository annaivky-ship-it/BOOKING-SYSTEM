-- PayID Accounts Table
CREATE TABLE IF NOT EXISTS payid_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    payid_identifier VARCHAR(255) NOT NULL UNIQUE,
    payid_type VARCHAR(20) NOT NULL CHECK (payid_type IN ('email', 'phone', 'abn')),
    account_name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    bsb VARCHAR(6),
    account_number VARCHAR(20),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (verification_status IN ('pending', 'verified', 'failed', 'expired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    last_used TIMESTAMPTZ,
    deactivated_at TIMESTAMPTZ
);

-- PayID Transactions Table
CREATE TABLE IF NOT EXISTS payid_transactions (
    id VARCHAR(255) PRIMARY KEY,
    sender_payid_id UUID REFERENCES payid_accounts(id) ON DELETE SET NULL,
    recipient_payid_id UUID REFERENCES payid_accounts(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'AUD',
    description TEXT NOT NULL,
    reference VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    transaction_type VARCHAR(20) NOT NULL DEFAULT 'payment'
        CHECK (transaction_type IN ('payment', 'refund', 'chargeback')),
    external_transaction_id VARCHAR(255),
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- PayID Events Log Table (for audit trail)
CREATE TABLE IF NOT EXISTS payid_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payid_account_id UUID REFERENCES payid_accounts(id) ON DELETE CASCADE,
    transaction_id VARCHAR(255) REFERENCES payid_transactions(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET
);

-- Indexes for performance
CREATE INDEX idx_payid_accounts_user_id ON payid_accounts(user_id);
CREATE INDEX idx_payid_accounts_identifier ON payid_accounts(payid_identifier);
CREATE INDEX idx_payid_accounts_verification_status ON payid_accounts(verification_status);
CREATE INDEX idx_payid_accounts_active ON payid_accounts(is_active, is_verified);

CREATE INDEX idx_payid_transactions_sender ON payid_transactions(sender_payid_id);
CREATE INDEX idx_payid_transactions_recipient ON payid_transactions(recipient_payid_id);
CREATE INDEX idx_payid_transactions_booking ON payid_transactions(booking_id);
CREATE INDEX idx_payid_transactions_status ON payid_transactions(status);
CREATE INDEX idx_payid_transactions_created_at ON payid_transactions(created_at DESC);

CREATE INDEX idx_payid_events_account ON payid_events(payid_account_id);
CREATE INDEX idx_payid_events_transaction ON payid_events(transaction_id);
CREATE INDEX idx_payid_events_type ON payid_events(event_type);
CREATE INDEX idx_payid_events_created_at ON payid_events(created_at DESC);

-- Row Level Security (RLS) Policies

-- PayID Accounts RLS
ALTER TABLE payid_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own PayID accounts" ON payid_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own PayID accounts" ON payid_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own PayID accounts" ON payid_accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own PayID accounts" ON payid_accounts
    FOR DELETE USING (auth.uid() = user_id);

-- PayID Transactions RLS
ALTER TABLE payid_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own PayID transactions" ON payid_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM payid_accounts
            WHERE (id = sender_payid_id OR id = recipient_payid_id)
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create PayID transactions" ON payid_transactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM payid_accounts
            WHERE id = sender_payid_id
            AND user_id = auth.uid()
        )
    );

-- PayID Events RLS
ALTER TABLE payid_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own PayID events" ON payid_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM payid_accounts
            WHERE id = payid_account_id
            AND user_id = auth.uid()
        )
    );

-- Functions for automatic timestamping
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamping
CREATE TRIGGER update_payid_accounts_updated_at
    BEFORE UPDATE ON payid_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payid_transactions_updated_at
    BEFORE UPDATE ON payid_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one primary PayID account per user
CREATE OR REPLACE FUNCTION ensure_single_primary_payid()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary = TRUE THEN
        -- Unset primary flag for all other accounts of this user
        UPDATE payid_accounts
        SET is_primary = FALSE
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER ensure_single_primary_payid_trigger
    BEFORE INSERT OR UPDATE ON payid_accounts
    FOR EACH ROW EXECUTE FUNCTION ensure_single_primary_payid();

-- Add PayID payment method to existing booking tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bookings'
        AND column_name = 'payment_transaction_id'
    ) THEN
        ALTER TABLE bookings ADD COLUMN payment_transaction_id VARCHAR(255);
        CREATE INDEX idx_bookings_payment_transaction ON bookings(payment_transaction_id);
    END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON payid_accounts TO authenticated;
GRANT ALL ON payid_transactions TO authenticated;
GRANT ALL ON payid_events TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;