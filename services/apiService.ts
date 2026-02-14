import { supabase } from './supabaseClient';
import { ProposalData, MemoryCrystal, MemoryUploadData } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const createProposal = async (
  creatorId: string,
  partnerName: string,
  nebulaColor: string,
  starColor: string,
  memories: MemoryUploadData[],
  musicUrl?: string,
  musicStartTime?: number,
  videoUrl?: string,
  proposalText?: string,
  galleryImages?: File[],
): Promise<ProposalData | null> => {
  try {
    const token = `HEART-${Math.floor(1000 + Math.random() * 9000)}`; // Simple token generation

    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .insert({
        creator_id: creatorId,
        partner_name: partnerName,
        token: token,
        nebula_color: nebulaColor,
        star_color: starColor,
        music_url: musicUrl,
        music_start_time: musicStartTime,
        video_url: videoUrl,
        proposal_text: proposalText,
      })
      .select()
      .single();

    if (proposalError) throw proposalError;
    if (!proposal) throw new Error('Failed to create proposal.');

    // Upload Gallery Images if any
    if (galleryImages && galleryImages.length > 0) {
      for (const imageFile of galleryImages) {
        if (imageFile) {
          const fileExtension = imageFile.name.split('.').pop();
          const filePath = `${proposal.id}/gallery/${uuidv4()}.${fileExtension}`;
          const { error: uploadError } = await supabase.storage
            .from('memory-images')
            .upload(filePath, imageFile, {
              cacheControl: '3600',
              upsert: false,
            });

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('memory-images')
              .getPublicUrl(filePath);

            await supabase.from('proposal_gallery').insert({
              proposal_id: proposal.id,
              image_url: publicUrlData.publicUrl
            });
          }
        }
      }
    }

    const uploadedMemories: MemoryCrystal[] = [];
    for (const [index, memory] of memories.entries()) {
      let imageUrl = memory.imageUrl || ""; // Default to empty string if no URL

      console.log(`[CreateProposal] Processing memory ${index}. HasFile: ${!!memory.imageFile}, HasURL: ${!!memory.imageUrl}`);

      if (memory.imageFile) {
        const fileExtension = memory.imageFile.name.split('.').pop();
        const filePath = `${proposal.id}/${uuidv4()}.${fileExtension}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('memory-images')
          .upload(filePath, memory.imageFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('memory-images') // Check verify bucket name
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
        console.log(`[CreateProposal] ✅ Successfully uploaded image!`);
        console.log(`👉 PUBLIC URL: ${imageUrl}`);
        console.log(`(Please click this link in the console to verify it works in your browser)`);
      }

      const { data: crystal, error: crystalError } = await supabase
        .from('memory_crystals')
        .insert({
          proposal_id: proposal.id,
          image_url: imageUrl,
          caption_text: memory.caption,
          order_index: index,
          collected: false,
        })
        .select()
        .single();

      if (crystalError) throw crystalError;
      if (crystal) uploadedMemories.push(crystal);
    }

    return { ...proposal, memories: uploadedMemories } as ProposalData;
  } catch (error: any) {
    console.error('Error creating proposal:', error.message);
    if (error.message && error.message.includes("Could not find the table 'public.proposals'")) {
      console.error(
        "--- SUPABASE DATABASE SCHEMA ERROR --- \n" +
        "The 'proposals' table was not found in your Supabase project. \n" +
        "Please ensure you have run the SQL schema provided at the bottom of `apiService.ts` " +
        "in your Supabase SQL editor to create the necessary tables."
      );
      throw new Error(
        "Database setup incomplete. Please ask the app developer to run the required SQL schema in Supabase. (Check console for details)"
      );
    }
    return null;
  }
};

export const getProposalByToken = async (token: string): Promise<ProposalData | null> => {
  try {
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('*')
      .eq('token', token)
      .single();

    if (proposalError && proposalError.code !== 'PGRST116') throw proposalError; // PGRST116 is "No rows found"
    if (!proposal) return null;

    const { data: memories, error: memoriesError } = await supabase
      .from('memory_crystals')
      .select('*')
      .eq('proposal_id', proposal.id)
      .order('order_index', { ascending: true });

    if (memoriesError) throw memoriesError;

    console.log("💎 Fetched Memories from Supabase:", memories);
    memories.forEach((mem, index) => {
      console.log(`[Memory ${index}] ID: ${mem.id}, Image URL: ${mem.image_url}`);
    });

    // Fetch Gallery Images
    const { data: galleryData, error: galleryError } = await supabase
      .from('proposal_gallery')
      .select('image_url')
      .eq('proposal_id', proposal.id);

    if (galleryError) console.error("Error fetching gallery:", galleryError);

    const galleryImages = galleryData ? galleryData.map(item => item.image_url) : [];

    return {
      ...proposal,
      memories: memories || [],
      gallery_images: galleryImages
    } as ProposalData;
  } catch (error: any) {
    console.error('Error fetching proposal by token:', error.message);
    return null;
  }
};

export const updateCrystalCollectedStatus = async (crystalId: string, collected: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('memory_crystals')
      .update({ collected: collected })
      .eq('id', crystalId);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error updating crystal collected status:', error.message);
    return false;
  }
};

export const deleteProposal = async (proposalId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('proposals')
      .delete()
      .eq('id', proposalId);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error deleting proposal:', error.message);
    return false;
  }
};

export const deleteMemory = async (memoryId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('memory_crystals')
      .delete()
      .eq('id', memoryId);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error deleting memory:', error.message);
    return false;
  }
};

export const updateMemoryCaption = async (memoryId: string, caption: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('memory_crystals')
      .update({ caption_text: caption })
      .eq('id', memoryId);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error updating memory caption:', error.message);
    return false;
  }
};

// Export the SQL schema as a string constant to prevent TypeScript parsing errors.
// This block is for reference and must be manually run in Supabase SQL Editor.
export const SUPABASE_SCHEMA_SQL = `
-- ==============================================================================
-- 🚀 GALACTIC MEMORY ODYSSEY - COMPLETE RESET SCRIPT
-- ==============================================================================
-- This script will:
-- 1. DROP all existing app tables to ensure a clean state (Data loss warning!).
-- 2. CREATE the necessary tables (profiles, proposals, memory_crystals).
-- 3. SETUP Row Level Security (RLS) policies for secure access.
-- 4. CONFIGURE Storage Buckets and policies for image uploads.
-- ==============================================================================

-- ⚠️ WARNING: This will delete existing data in these tables!
DROP TABLE IF EXISTS proposal_gallery CASCADE; -- Removed feature
DROP TABLE IF EXISTS memory_crystals CASCADE;
DROP TABLE IF EXISTS proposals CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. PROFILES (Users)
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone default now(),
  username text,
  avatar_url text,
  constraint username_length check (char_length(username) >= 3)
);

alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- 2. PROPOSALS (The Core Data)
create table proposals (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid references auth.users(id) on delete cascade not null,
  partner_name text not null,
  token text unique not null,
  nebula_color text default '#5a006c' not null,
  star_color text default '#e0e0e0' not null,
  music_url text,
  music_start_time integer default 0,
  video_url text,
  proposal_text text,
  created_at timestamp with time zone default now()
);

alter table proposals enable row level security;

-- Policy: Creators can do anything with their own proposals
create policy "Creators can manage their own proposals" 
on proposals for all 
using (auth.uid() = creator_id);

-- Policy: Anyone with the correct Token/ID can VIEW a proposal (Public Read)
-- We allow public read access generally, application logic filters by token.
create policy "Public can view proposals" 
on proposals for select 
using (true); 

-- 3. MEMORY CRYSTALS (The Memories)
create table memory_crystals (
  id uuid primary key default uuid_generate_v4(),
  proposal_id uuid references proposals(id) on delete cascade not null,
  image_url text,
  caption_text text not null,
  order_index integer not null,
  collected boolean default false,
  created_at timestamp with time zone default now()
);

alter table memory_crystals enable row level security;

-- Policy: Creators can manage memories linked to their proposals
create policy "Creators can manage memories" 
on memory_crystals for all 
using (
  exists ( 
    select 1 from proposals 
    where proposals.id = memory_crystals.proposal_id 
    and proposals.creator_id = auth.uid() 
  )
);

-- Policy: Public can view memories (Application filters by proposal_id)
create policy "Public can view memories"
on memory_crystals for select
using (true);


-- 4. STORAGE SETUP (memory-images)
-- Note: You might need to manually create the 'memory-images' bucket in the Storage UI if this fails.

-- Insert bucket if not exists (Idempotent-ish)
insert into storage.buckets (id, name, public)
values ('memory-images', 'memory-images', true)
on conflict (id) do update set public = true;

-- Storage Policy: Public Read Access
-- (Allows anyone to view images - vital for the 3D scene)
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'memory-images' );

-- Storage Policy: Authenticated Upload Access
-- (Allows logged-in users to upload images)
drop policy if exists "Auth Upload" on storage.objects;
create policy "Auth Upload"
on storage.objects for insert
with check (
  bucket_id = 'memory-images' 
  and auth.role() = 'authenticated'
);

-- Storage Policy: Owner Delete/Update
drop policy if exists "Owner Manage" on storage.objects;
create policy "Owner Manage"
on storage.objects for all
using (
  bucket_id = 'memory-images' 
  and auth.uid() = owner
);

-- ==============================================================================
-- ✅ SETUP COMPLETE
-- Run this entire script in your Supabase SQL Editor to finish.
-- ==============================================================================
`;