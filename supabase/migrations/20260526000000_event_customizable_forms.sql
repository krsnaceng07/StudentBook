-- Migration: Add custom_form_config to events to support fully customizable student registration forms
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS custom_form_config JSONB DEFAULT '{
    "fields": [
      {"id": "full_name", "label": "Full Name", "required": true, "enabled": true},
      {"id": "email", "label": "Email Address", "required": true, "enabled": true},
      {"id": "department", "label": "Department", "required": false, "enabled": true},
      {"id": "year", "label": "Year / Semester", "required": false, "enabled": true},
      {"id": "remarks", "label": "Remarks / Motivation", "required": false, "enabled": true},
      {"id": "portfolio_link", "label": "GitHub / Portfolio Link", "required": false, "enabled": false}
    ],
    "custom_questions": []
  }'::jsonb;

-- Adjust comment to describe column purpose
COMMENT ON COLUMN public.events.custom_form_config IS 'Stores the customized registration form layout configuration including standard field toggles and optional custom college questions.';
