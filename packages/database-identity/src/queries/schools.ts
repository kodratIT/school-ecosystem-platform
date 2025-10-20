import { getSupabaseClient } from '../client/supabase';
import { handleDatabaseError } from '../utils/errors';
import type { Database } from '../types/database';

type School = Database['public']['Tables']['schools']['Row'];
type SchoolInsert = Database['public']['Tables']['schools']['Insert'];
type SchoolUpdate = Database['public']['Tables']['schools']['Update'];

/**
 * Get all active schools
 */
export async function getActiveSchools(): Promise<School[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) handleDatabaseError(error);
  return data || [];
}

/**
 * Get all schools (including inactive)
 */
export async function getAllSchools(): Promise<School[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) handleDatabaseError(error);
  return data || [];
}

/**
 * Get school by ID
 */
export async function getSchoolById(id: string): Promise<School | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    handleDatabaseError(error);
  }

  return data;
}

/**
 * Get school by slug
 */
export async function getSchoolBySlug(slug: string): Promise<School | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    handleDatabaseError(error);
  }

  return data;
}

/**
 * Get school by NPSN (Nomor Pokok Sekolah Nasional)
 */
export async function getSchoolByNpsn(npsn: string): Promise<School | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('npsn', npsn)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    handleDatabaseError(error);
  }

  return data;
}

/**
 * Create new school
 */
export async function createSchool(school: SchoolInsert): Promise<School> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('schools')
    .insert(school)
    .select()
    .single();

  if (error) handleDatabaseError(error);
  return data;
}

/**
 * Update school
 */
export async function updateSchool(
  id: string,
  updates: SchoolUpdate
): Promise<School> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('schools')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) handleDatabaseError(error);
  return data;
}

/**
 * Soft delete school
 */
export async function deleteSchool(id: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('schools')
    .update({
      deleted_at: new Date().toISOString(),
      is_active: false,
    })
    .eq('id', id);

  if (error) handleDatabaseError(error);
}

/**
 * Activate school
 */
export async function activateSchool(id: string): Promise<School> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('schools')
    .update({
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) handleDatabaseError(error);
  return data;
}

/**
 * Deactivate school
 */
export async function deactivateSchool(id: string): Promise<School> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('schools')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) handleDatabaseError(error);
  return data;
}

/**
 * Update school subscription
 */
export async function updateSchoolSubscription(
  id: string,
  tier: 'free' | 'basic' | 'premium' | 'enterprise',
  startsAt: string,
  endsAt: string
): Promise<School> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('schools')
    .update({
      subscription_tier: tier,
      subscription_starts_at: startsAt,
      subscription_ends_at: endsAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) handleDatabaseError(error);
  return data;
}

/**
 * Count schools by subscription tier
 */
export async function countSchoolsByTier(): Promise<Record<string, number>> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('schools')
    .select('subscription_tier')
    .is('deleted_at', null);

  if (error) handleDatabaseError(error);

  // Count by tier
  const counts: Record<string, number> = {
    free: 0,
    basic: 0,
    premium: 0,
    enterprise: 0,
  };

  data?.forEach((school) => {
    counts[school.subscription_tier] =
      (counts[school.subscription_tier] || 0) + 1;
  });

  return counts;
}
