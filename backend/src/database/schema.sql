-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  plan          VARCHAR(50) DEFAULT 'starter',
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id       UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  name              VARCHAR(100) NOT NULL,
  source_type       VARCHAR(50) NOT NULL,        -- 'razorpay', 'zoho', 'tally', etc.
  destination_type  VARCHAR(50) NOT NULL,        -- 'postgresql', 'webhook', etc.
  encrypted_config  TEXT NOT NULL,               -- Encrypted JSON keys/auth tokens
  schedule          VARCHAR(50) DEFAULT 'hourly',-- sync frequency
  is_active         BOOLEAN DEFAULT true,
  last_synced_at    TIMESTAMP WITH TIME ZONE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create sync_logs table
CREATE TABLE IF NOT EXISTS sync_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE NOT NULL,
  status         VARCHAR(20) NOT NULL,           -- 'success', 'failed', 'retrying'
  records_synced INTEGER DEFAULT 0,
  error_message  TEXT,
  started_at     TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  finished_at    TIMESTAMP WITH TIME ZONE
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
  customer_id    UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  message        TEXT NOT NULL,
  is_resolved    BOOLEAN DEFAULT false,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
