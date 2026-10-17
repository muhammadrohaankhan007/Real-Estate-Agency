-- ==============================================================================
-- PRIME TIME REAL ESTATE - SUPABASE SCHEMA MIGRATION
-- Migration: Add category, floor number, and Cadastral GIS coordinates
-- ==============================================================================

-- 1. Add category, floor number, and GIS coordinates to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'Bungalow',
ADD COLUMN IF NOT EXISTS floor_number text,
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision;

-- 2. Create index for high-performance category queries
CREATE INDEX IF NOT EXISTS idx_properties_category ON properties (category);

-- 3. Comments for cadastral documentation
COMMENT ON COLUMN properties.category IS 'Property category classification (Bungalow, Villa, Apartment, Condo, Penthouse, etc.)';
COMMENT ON COLUMN properties.floor_number IS 'Floor level/number for multi-story residential units (Apartment, Condo, Penthouse)';
COMMENT ON COLUMN properties.latitude IS 'Cadastral WGS84 latitude coordinate (sub-meter accuracy)';
COMMENT ON COLUMN properties.longitude IS 'Cadastral WGS84 longitude coordinate (sub-meter accuracy)';
