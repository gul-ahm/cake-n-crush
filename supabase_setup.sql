-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create portfolio items table
create table public.portfolio_items (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  category text not null,
  price_range text,
  images text[] default array[]::text[],
  views integer default 0,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.portfolio_items enable row level security;

-- Create policies
-- Allow everyone to read portfolio items
create policy "Public items are viewable by everyone"
  on public.portfolio_items for select
  using ( true );

-- Allow authenticated users (admins) to insert, update, delete
create policy "Admins can insert items"
  on public.portfolio_items for insert
  with check ( auth.role() = 'authenticated' );

create policy "Admins can update items"
  on public.portfolio_items for update
  using ( auth.role() = 'authenticated' );

create policy "Admins can delete items"
  on public.portfolio_items for delete
  using ( auth.role() = 'authenticated' );

-- Create storage bucket for images
insert into storage.buckets (id, name, public)
values ('portfolio-images', 'portfolio-images', true);

-- Storage policies
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'portfolio-images' );

create policy "Admin Upload"
  on storage.objects for insert
  with check ( bucket_id = 'portfolio-images' and auth.role() = 'authenticated' );

create policy "Admin Delete"
  on storage.objects for delete
  using ( bucket_id = 'portfolio-images' and auth.role() = 'authenticated' );
