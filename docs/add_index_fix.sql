-- This index is crucial for improving the performance of fetching user-specific
-- settings, like their timezone. Without it, the database has to scan the
-- entire table, which can cause timeouts on larger datasets.
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON public.notification_settings (user_id);
