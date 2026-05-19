-- Migration: Add registration_details column to event_registrations to support customizable registration details.
ALTER TABLE event_registrations 
ADD COLUMN IF NOT EXISTS registration_details JSONB DEFAULT '{}'::jsonb;

-- Adjust comment to describe column purpose
COMMENT ON COLUMN event_registrations.registration_details IS 'Stores student-provided custom registration details such as motivation, remarks, custom fields in JSONB format.';
