-- Enable RLS on realtime.messages and restrict channel topics to the current user's own topic
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can subscribe to their own realtime topic" ON realtime.messages;
CREATE POLICY "Users can subscribe to their own realtime topic"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = ('user-' || auth.uid()::text)
);

DROP POLICY IF EXISTS "Users can send to their own realtime topic" ON realtime.messages;
CREATE POLICY "Users can send to their own realtime topic"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  realtime.topic() = ('user-' || auth.uid()::text)
);
