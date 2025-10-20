export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo: string | null;
          npsn: string;
          education_level: 'tk' | 'sd' | 'smp' | 'sma' | 'smk';
          email: string;
          phone: string;
          website: string | null;
          address: string;
          village: string;
          district: string;
          city: string;
          province: string;
          postal_code: string | null;
          principal_name: string;
          principal_phone: string;
          is_active: boolean;
          subscription_tier: 'free' | 'basic' | 'premium' | 'enterprise';
          subscription_starts_at: string | null;
          subscription_ends_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo?: string | null;
          npsn: string;
          education_level: 'tk' | 'sd' | 'smp' | 'sma' | 'smk';
          email: string;
          phone: string;
          website?: string | null;
          address: string;
          village: string;
          district: string;
          city: string;
          province: string;
          postal_code?: string | null;
          principal_name: string;
          principal_phone: string;
          is_active?: boolean;
          subscription_tier?: 'free' | 'basic' | 'premium' | 'enterprise';
          subscription_starts_at?: string | null;
          subscription_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo?: string | null;
          npsn?: string;
          education_level?: 'tk' | 'sd' | 'smp' | 'sma' | 'smk';
          email?: string;
          phone?: string;
          website?: string | null;
          address?: string;
          village?: string;
          district?: string;
          city?: string;
          province?: string;
          postal_code?: string | null;
          principal_name?: string;
          principal_phone?: string;
          is_active?: boolean;
          subscription_tier?: 'free' | 'basic' | 'premium' | 'enterprise';
          subscription_starts_at?: string | null;
          subscription_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          school_id: string | null;
          email: string;
          email_verified: boolean;
          email_verified_at: string | null;
          password_hash: string | null;
          name: string;
          given_name: string | null;
          family_name: string | null;
          avatar: string | null;
          phone: string | null;
          phone_verified: boolean;
          role:
            | 'super_admin'
            | 'school_admin'
            | 'teacher'
            | 'student'
            | 'parent'
            | 'finance_staff'
            | 'staff';
          is_active: boolean;
          is_banned: boolean;
          banned_reason: string | null;
          banned_at: string | null;
          banned_by: string | null;
          last_login_at: string | null;
          last_login_ip: string | null;
          login_count: number;
          locale: string;
          timezone: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          school_id?: string | null;
          email: string;
          email_verified?: boolean;
          email_verified_at?: string | null;
          password_hash?: string | null;
          name: string;
          given_name?: string | null;
          family_name?: string | null;
          avatar?: string | null;
          phone?: string | null;
          phone_verified?: boolean;
          role:
            | 'super_admin'
            | 'school_admin'
            | 'teacher'
            | 'student'
            | 'parent'
            | 'finance_staff'
            | 'staff';
          is_active?: boolean;
          is_banned?: boolean;
          banned_reason?: string | null;
          banned_at?: string | null;
          banned_by?: string | null;
          last_login_at?: string | null;
          last_login_ip?: string | null;
          login_count?: number;
          locale?: string;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          school_id?: string | null;
          email?: string;
          email_verified?: boolean;
          email_verified_at?: string | null;
          password_hash?: string | null;
          name?: string;
          given_name?: string | null;
          family_name?: string | null;
          avatar?: string | null;
          phone?: string | null;
          phone_verified?: boolean;
          role?:
            | 'super_admin'
            | 'school_admin'
            | 'teacher'
            | 'student'
            | 'parent'
            | 'finance_staff'
            | 'staff';
          is_active?: boolean;
          is_banned?: boolean;
          banned_reason?: string | null;
          banned_at?: string | null;
          banned_by?: string | null;
          last_login_at?: string | null;
          last_login_ip?: string | null;
          login_count?: number;
          locale?: string;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'users_school_id_fkey';
            columns: ['school_id'];
            isOneToOne: false;
            referencedRelation: 'schools';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'users_banned_by_fkey';
            columns: ['banned_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      roles: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          is_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      permissions: {
        Row: {
          id: string;
          name: string;
          slug: string;
          resource: string;
          action: 'create' | 'read' | 'update' | 'delete' | 'manage';
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          resource: string;
          action: 'create' | 'read' | 'update' | 'delete' | 'manage';
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          resource?: string;
          action?: 'create' | 'read' | 'update' | 'delete' | 'manage';
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          id: string;
          role_id: string;
          permission_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          role_id: string;
          permission_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          role_id?: string;
          permission_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'role_permissions_role_id_fkey';
            columns: ['role_id'];
            isOneToOne: false;
            referencedRelation: 'roles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'role_permissions_permission_id_fkey';
            columns: ['permission_id'];
            isOneToOne: false;
            referencedRelation: 'permissions';
            referencedColumns: ['id'];
          },
        ];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_roles_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_roles_role_id_fkey';
            columns: ['role_id'];
            isOneToOne: false;
            referencedRelation: 'roles';
            referencedColumns: ['id'];
          },
        ];
      };
      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          refresh_token: string | null;
          ip_address: string | null;
          user_agent: string | null;
          expires_at: string;
          created_at: string;
          last_activity_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          refresh_token?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          expires_at: string;
          created_at?: string;
          last_activity_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token?: string;
          refresh_token?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          expires_at?: string;
          created_at?: string;
          last_activity_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_sessions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      oauth_accounts: {
        Row: {
          id: string;
          user_id: string;
          provider: 'google' | 'microsoft' | 'github' | 'facebook';
          provider_account_id: string;
          access_token: string | null;
          refresh_token: string | null;
          expires_at: string | null;
          token_type: string | null;
          scope: string | null;
          provider_profile: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: 'google' | 'microsoft' | 'github' | 'facebook';
          provider_account_id: string;
          access_token?: string | null;
          refresh_token?: string | null;
          expires_at?: string | null;
          token_type?: string | null;
          scope?: string | null;
          provider_profile?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: 'google' | 'microsoft' | 'github' | 'facebook';
          provider_account_id?: string;
          access_token?: string | null;
          refresh_token?: string | null;
          expires_at?: string | null;
          token_type?: string | null;
          scope?: string | null;
          provider_profile?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'oauth_accounts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          school_id: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          school_id?: string | null;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          school_id?: string | null;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'audit_logs_school_id_fkey';
            columns: ['school_id'];
            isOneToOne: false;
            referencedRelation: 'schools';
            referencedColumns: ['id'];
          },
        ];
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          theme: 'light' | 'dark' | 'auto';
          language: string;
          timezone: string;
          email_notifications: boolean;
          push_notifications: boolean;
          sms_notifications: boolean;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: 'light' | 'dark' | 'auto';
          language?: string;
          timezone?: string;
          email_notifications?: boolean;
          push_notifications?: boolean;
          sms_notifications?: boolean;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          theme?: 'light' | 'dark' | 'auto';
          language?: string;
          timezone?: string;
          email_notifications?: boolean;
          push_notifications?: boolean;
          sms_notifications?: boolean;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_preferences_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      system_settings: {
        Row: {
          id: string;
          school_id: string | null;
          key: string;
          value: Json;
          description: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          school_id?: string | null;
          key: string;
          value: Json;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string | null;
          key?: string;
          value?: Json;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'system_settings_school_id_fkey';
            columns: ['school_id'];
            isOneToOne: false;
            referencedRelation: 'schools';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      log_audit: {
        Args: {
          p_action: string;
          p_resource_type?: string;
          p_resource_id?: string;
          p_description?: string;
          p_old_values?: Json;
          p_new_values?: Json;
          p_metadata?: Json;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
        Database['public']['Views'])
    ? (Database['public']['Tables'] &
        Database['public']['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database['public']['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
    ? Database['public']['Enums'][PublicEnumNameOrOptions]
    : never;
