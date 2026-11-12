-- Auth owns email uniqueness. customer_account also contains legacy customer
-- rows, so an Auth-linked profile must be allowed to share their email without
-- taking ownership of or overwriting the legacy row.
alter table public.customer_account
  drop constraint if exists customer_account_email_key;
