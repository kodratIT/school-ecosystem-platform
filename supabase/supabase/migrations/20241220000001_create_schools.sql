-- ============================================
-- SCHOOLS TABLE - Tenants (Multi-tenant)
-- ============================================
-- Each school is a separate organization/tenant
-- Created: 2024-12-20
-- Story: STORY-013

-- Create schools table
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Info
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    logo TEXT,
    
    -- Official Info
    npsn VARCHAR(8) NOT NULL UNIQUE, -- Nomor Pokok Sekolah Nasional
    education_level VARCHAR(20) NOT NULL CHECK (
        education_level IN ('tk', 'sd', 'smp', 'sma', 'smk')
    ),
    
    -- Contact
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    website TEXT,
    
    -- Address
    address TEXT NOT NULL,
    village VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(5),
    
    -- Principal
    principal_name VARCHAR(255) NOT NULL,
    principal_phone VARCHAR(20) NOT NULL,
    
    -- Status & Subscription
    is_active BOOLEAN NOT NULL DEFAULT true,
    subscription_tier VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (
        subscription_tier IN ('free', 'basic', 'premium', 'enterprise')
    ),
    subscription_starts_at TIMESTAMPTZ,
    subscription_ends_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_schools_slug ON schools(slug);
CREATE INDEX idx_schools_npsn ON schools(npsn);
CREATE INDEX idx_schools_is_active ON schools(is_active);
CREATE INDEX idx_schools_deleted_at ON schools(deleted_at) WHERE deleted_at IS NULL;

-- Comments for documentation
COMMENT ON TABLE schools IS 'Tenants - each school is a separate organization';
COMMENT ON COLUMN schools.npsn IS 'Nomor Pokok Sekolah Nasional - unique national school ID';
COMMENT ON COLUMN schools.slug IS 'URL-friendly identifier for school';
COMMENT ON COLUMN schools.subscription_tier IS 'Subscription level: free, basic, premium, enterprise';
COMMENT ON COLUMN schools.education_level IS 'Level: tk (kindergarten), sd (elementary), smp (junior high), sma (senior high), smk (vocational)';

-- Updated at trigger function (reusable)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at() IS 'Automatically update updated_at column on row update';

-- Trigger for schools table
CREATE TRIGGER schools_updated_at
    BEFORE UPDATE ON schools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- RLS Policies for schools table

-- Super admins can see all schools
CREATE POLICY "Super admins can view all schools"
    ON schools FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    );

-- Users can see their own school
CREATE POLICY "Users can view their own school"
    ON schools FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT school_id FROM users
            WHERE users.id = auth.uid()
        )
    );

-- Only super admins can insert schools
CREATE POLICY "Super admins can insert schools"
    ON schools FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    );

-- Super admins and school admins can update their school
CREATE POLICY "Admins can update schools"
    ON schools FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND (
                users.role = 'super_admin'
                OR (users.role = 'school_admin' AND users.school_id = schools.id)
            )
        )
    );

-- Only super admins can delete (soft delete)
CREATE POLICY "Super admins can delete schools"
    ON schools FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    );
