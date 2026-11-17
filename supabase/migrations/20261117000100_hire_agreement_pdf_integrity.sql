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

  if old.status = 'signed' then
    if new.booking_id is distinct from old.booking_id
      or new.template_key is distinct from old.template_key
      or new.template_version is distinct from old.template_version
      or new.token_hash is distinct from old.token_hash
      or new.booking_snapshot is distinct from old.booking_snapshot
      or new.terms_snapshot is distinct from old.terms_snapshot
      or new.customer_details is distinct from old.customer_details
      or new.accepted is distinct from old.accepted
      or new.signature_path is distinct from old.signature_path
      or new.pdf_path is distinct from old.pdf_path
      or new.pdf_sha256 is distinct from old.pdf_sha256
      or new.pdf_size_bytes is distinct from old.pdf_size_bytes
      or new.reference is distinct from old.reference
      or new.signed_at is distinct from old.signed_at
      or new.ip_address is distinct from old.ip_address
      or new.user_agent is distinct from old.user_agent
      or new.status is distinct from old.status then
      raise exception 'Signed hire agreement content and signature metadata are immutable.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_signed_hire_agreement on public.vehicle_hire_agreements;
create trigger guard_signed_hire_agreement
before update or delete on public.vehicle_hire_agreements
for each row execute function public.guard_signed_hire_agreement();
