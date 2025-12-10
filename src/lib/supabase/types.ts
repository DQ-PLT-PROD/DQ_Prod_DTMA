export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            media_items: {
                Row: {
                    id: string
                    title: string
                    slug: string
                    summary: string
                    body: string
                    body_html: string | null
                    body_json: Json | null
                    type: string
                    category: string | null
                    status: string
                    visibility: string
                    language: string
                    published_at: string | null
                    updated_at: string
                    created_at: string
                    seo_title: string | null
                    seo_description: string | null
                    canonical_url: string | null
                    tags: string[] | null
                    thumbnail_url: string | null
                    video_url: string | null
                    podcast_url: string | null
                    document_url: string | null
                    duration_sec: number | null
                    file_size_bytes: number | null
                    event_date: string | null
                    event_time: string | null
                    event_location: string | null
                    event_location_details: string | null
                    event_registration_info: string | null
                    event_agenda: Json | null
                }
                Insert: {
                    id?: string
                    title: string
                    slug: string
                    summary: string
                    body?: string
                    body_html?: string | null
                    body_json?: Json | null
                    type: string
                    category?: string | null
                    status: string
                    visibility: string
                    language: string
                    published_at?: string | null
                    updated_at?: string
                    created_at?: string
                    seo_title?: string | null
                    seo_description?: string | null
                    canonical_url?: string | null
                    tags?: string[] | null
                    thumbnail_url?: string | null
                    video_url?: string | null
                    podcast_url?: string | null
                    document_url?: string | null
                    duration_sec?: number | null
                    file_size_bytes?: number | null
                    event_date?: string | null
                    event_time?: string | null
                    event_location?: string | null
                    event_location_details?: string | null
                    event_registration_info?: string | null
                    event_agenda?: Json | null
                }
                Update: {
                    id?: string
                    title?: string
                    slug?: string
                    summary?: string
                    body?: string
                    body_html?: string | null
                    body_json?: Json | null
                    type?: string
                    category?: string | null
                    status?: string
                    visibility?: string
                    language?: string
                    published_at?: string | null
                    updated_at?: string
                    created_at?: string
                    seo_title?: string | null
                    seo_description?: string | null
                    canonical_url?: string | null
                    tags?: string[] | null
                    thumbnail_url?: string | null
                    video_url?: string | null
                    podcast_url?: string | null
                    document_url?: string | null
                    duration_sec?: number | null
                    file_size_bytes?: number | null
                    event_date?: string | null
                    event_time?: string | null
                    event_location?: string | null
                    event_location_details?: string | null
                    event_registration_info?: string | null
                    event_agenda?: Json | null
                }
                Relationships: []
            },
            courses: {
                Row: {
                    id: string
                    slug: string
                    title: string
                    short_description: string | null
                    long_description: string | null
                    category_id: string | null
                    audience_level: string | null
                    topic_tags: string[] | null
                    level_tag: string | null
                    estimated_duration_minutes: number | null
                    lesson_count: number | null
                    hero_image_url: string | null
                    intro_video_url: string | null
                    intro_video_poster_url: string | null
                    is_featured: boolean | null
                    status: string | null
                    provider_name: string | null
                    provider_logo_url: string | null
                    provider_description: string | null
                    rating: number | null
                    review_count: number | null
                    delivery_mode: string | null
                    enrollment_url: string | null
                    learning_outcomes: string[] | null
                    skills_gained: string[] | null
                    upon_completion: string | null
                    start_date: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    slug: string
                    title: string
                    short_description?: string | null
                    long_description?: string | null
                    category_id?: string | null
                    audience_level?: string | null
                    topic_tags?: string[] | null
                    level_tag?: string | null
                    estimated_duration_minutes?: number | null
                    lesson_count?: number | null
                    hero_image_url?: string | null
                    intro_video_url?: string | null
                    intro_video_poster_url?: string | null
                    is_featured?: boolean | null
                    status?: string | null
                    provider_name?: string | null
                    provider_logo_url?: string | null
                    provider_description?: string | null
                    rating?: number | null
                    review_count?: number | null
                    delivery_mode?: string | null
                    enrollment_url?: string | null
                    learning_outcomes?: string[] | null
                    skills_gained?: string[] | null
                    upon_completion?: string | null
                    start_date?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    slug?: string
                    title?: string
                    short_description?: string | null
                    long_description?: string | null
                    category_id?: string | null
                    audience_level?: string | null
                    topic_tags?: string[] | null
                    level_tag?: string | null
                    estimated_duration_minutes?: number | null
                    lesson_count?: number | null
                    hero_image_url?: string | null
                    intro_video_url?: string | null
                    intro_video_poster_url?: string | null
                    is_featured?: boolean | null
                    status?: string | null
                    provider_name?: string | null
                    provider_logo_url?: string | null
                    provider_description?: string | null
                    rating?: number | null
                    review_count?: number | null
                    delivery_mode?: string | null
                    enrollment_url?: string | null
                    learning_outcomes?: string[] | null
                    skills_gained?: string[] | null
                    upon_completion?: string | null
                    start_date?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            ,
            media_assets: {
                Row: {
                    id: string
                    media_id: string
                    kind: 'Image' | 'Video' | 'Audio' | 'Doc' | string | null
                    public_url: string
                    storage_path: string
                    mime: string | null
                    size_bytes: number | null
                    duration_sec: number | null
                    checksum: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    media_id: string
                    kind?: 'Image' | 'Video' | 'Audio' | 'Doc' | string | null
                    public_url: string
                    storage_path: string
                    mime?: string | null
                    size_bytes?: number | null
                    duration_sec?: number | null
                    checksum?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    media_id?: string
                    kind?: 'Image' | 'Video' | 'Audio' | 'Doc' | string | null
                    public_url?: string
                    storage_path?: string
                    mime?: string | null
                    size_bytes?: number | null
                    duration_sec?: number | null
                    checksum?: string | null
                    created_at?: string
                }
                Relationships: []
            }
        }
        Views: {}
        Functions: {}
        Enums: {}
        CompositeTypes: {}
    }
}
