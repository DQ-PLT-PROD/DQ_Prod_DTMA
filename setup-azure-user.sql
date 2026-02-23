-- Create user record for Azure authenticated user
-- This maps the Azure user ID to an internal database UUID

-- Check if user already exists
DO $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM users WHERE azure_user_id = '39ccac37-6e75-4e4b-8cbc-2dd0422f4f07'
  ) INTO user_exists;

  IF NOT user_exists THEN
    -- Insert new user record
    INSERT INTO users (
      id,
      azure_user_id,
      email,
      name,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      '39ccac37-6e75-4e4b-8cbc-2dd0422f4f07',
      'damarice@example.com',  -- Update with actual email if known
      'Damarice',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'User created successfully';
  ELSE
    RAISE NOTICE 'User already exists';
  END IF;
END $$;

-- Verify the user was created
SELECT 
  id,
  azure_user_id,
  email,
  name,
  created_at
FROM users 
WHERE azure_user_id = '39ccac37-6e75-4e4b-8cbc-2dd0422f4f07';
