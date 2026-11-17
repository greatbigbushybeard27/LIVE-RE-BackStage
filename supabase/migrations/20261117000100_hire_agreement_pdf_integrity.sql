-- Hire agreement original-PDF integrity and immutability guard
alter table public.vehicle_hire_agreements
  add column if not exists pdf_sha256 text,
  add column if not exists pdf_size_bytes bigint;

create or replace function public.guard_signed_hire_agreement()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if old.status = 'signed' then
      raise exception 'Signed hire agreements cannot be deleted; retain the original audit record.';
    end if;
    return old;
  end if;

  if old.status = 'signed'
    and (to_jsonb(new) - array[
      'customer_email_status',
      'company_email_status',
      'customer_email_id',
      'company_email_id',
      'email_last_error',
      'email_last_attempt_at',
      'email_sent_at'
    ]) is distinct from (to_jsonb(old) - array[
      'customer_email_status',
      'company_email_status',
      'customer_email_id',
      'company_email_id',
      'email_last_error',
      'email_last_attempt_at',
      'email_sent_at'
    ]) then
    raise exception 'Signed hire agreement content, PDF, signature and audit metadata are immutable.';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_signed_hire_agreement on public.vehicle_hire_agreements;
create trigger guard_signed_hire_agreement
before update or delete on public.vehicle_hire_agreements
for each row execute function public.guard_signed_hire_agreement();
