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
            },
            lessons: {
                Row: {
                    id: string
                    course_slug: string
                    title: string
                    type: string
                    order_index: number
                    estimated_duration_minutes: number | null
                    video_url: string | null
                    resource_url: string | null
                    content: string | null
                    is_preview: boolean | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    course_slug: string
                    title: string
                    type: string
                    order_index: number
                    estimated_duration_minutes?: number | null
                    video_url?: string | null
                    resource_url?: string | null
                    content?: string | null
                    is_preview?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    course_slug?: string
                    title?: string
                    type?: string
                    order_index?: number
                    estimated_duration_minutes?: number | null
                    video_url?: string | null
                    resource_url?: string | null
                    content?: string | null
                    is_preview?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            },
            quizzes: {
                Row: {
                    id: string
                    course_slug: string
                    title: string
                    order_index: number
                    question: string
                    options: Json
                    correct_answer: Json
                    distractor_feedback: Json | null
                    explanation: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    course_slug: string
                    title: string
                    order_index: number
                    question: string
                    options: Json
                    correct_answer: Json
                    distractor_feedback?: Json | null
                    explanation?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    course_slug?: string
                    title?: string
                    order_index?: number
                    question?: string
                    options?: Json
                    correct_answer?: Json
                    distractor_feedback?: Json | null
                    explanation?: string | null
                    created_at?: string | null
                }
                Relationships: []
            },
            course_resources: {
                Row: {
                    id: string
                    course_slug: string
                    title: string
                    type: string
                    description: string | null
                    resource_url: string
                    file_size_bytes: number | null
                    order_index: number | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    course_slug: string
                    title: string
                    type: string
                    description?: string | null
                    resource_url: string
                    file_size_bytes?: number | null
                    order_index?: number | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    course_slug?: string
                    title?: string
                    type?: string
                    description?: string | null
                    resource_url?: string
                    file_size_bytes?: number | null
                    order_index?: number | null
                    created_at?: string | null
                }
                Relationships: []
            },
            course_categories: {
                Row: {
                    id: string
                    slug: string
                    name: string
                    description: string | null
                    display_order: number | null
                    is_active: boolean | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    slug: string
                    name: string
                    description?: string | null
                    display_order?: number | null
                    is_active?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    slug?: string
                    name?: string
                    description?: string | null
                    display_order?: number | null
                    is_active?: boolean | null
                    updated_at?: string | null
                }
                Relationships: []
            },
            industries: {
                Row: {
                    id: string
                    slug: string
                    parent_slug: string | null
                    name: string
                    description: string | null
                    icon: string | null
                    display_order: number | null
                    is_active: boolean | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    slug: string
                    parent_slug?: string | null
                    name: string
                    description?: string | null
                    icon?: string | null
                    display_order?: number | null
                    is_active?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    slug?: string
                    parent_slug?: string | null
                    name?: string
                    description?: string | null
                    icon?: string | null
                    display_order?: number | null
                    is_active?: boolean | null
                    updated_at?: string | null
                }
                Relationships: []
            },
            audience_levels: {
                Row: {
                    id: string
                    slug: string
                    name: string
                    description: string | null
                    display_order: number | null
                    is_active: boolean | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    slug: string
                    name: string
                    description?: string | null
                    display_order?: number | null
                    is_active?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    slug?: string
                    name?: string
                    description?: string | null
                    display_order?: number | null
                    is_active?: boolean | null
                    updated_at?: string | null
                }
                Relationships: []
            },
            difficulty_levels: {
                Row: {
                    id: string
                    slug: string
                    name: string
                    description: string | null
                    display_order: number | null
                    is_active: boolean | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    slug: string
                    name: string
                    description?: string | null
                    display_order?: number | null
                    is_active?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    slug?: string
                    name?: string
                    description?: string | null
                    display_order?: number | null
                    is_active?: boolean | null
                    updated_at?: string | null
                }
                Relationships: []
            },
            related_courses: {
                Row: {
                    id: string
                    course_slug: string
                    related_course_slug: string
                    display_order: number | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    course_slug: string
                    related_course_slug: string
                    display_order?: number | null
                    created_at?: string | null
                }
                Update: {
                    course_slug?: string
                    related_course_slug?: string
                    display_order?: number | null
                }
                Relationships: []
            },
            newsletter_subscriptions: {
                Row: {
                    id: string
                    email: string
                    source: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    email: string
                    source?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    email?: string
                    source?: string | null
                    created_at?: string | null
                }
                Relationships: []
            },
            users: {
                Row: {
                    id: string
                    azure_user_id: string
                    customer_id: string
                    email: string
                    name: string
                    given_name: string | null
                    surname: string | null
                    job_title: string | null
                    department: string | null
                    office_location: string | null
                    profile_data: Json | null
                    last_login: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    azure_user_id: string
                    customer_id: string
                    email: string
                    name: string
                    given_name?: string | null
                    surname?: string | null
                    job_title?: string | null
                    department?: string | null
                    office_location?: string | null
                    profile_data?: Json | null
                    last_login?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    azure_user_id?: string
                    customer_id?: string
                    email?: string
                    name?: string
                    given_name?: string | null
                    surname?: string | null
                    job_title?: string | null
                    department?: string | null
                    office_location?: string | null
                    profile_data?: Json | null
                    last_login?: string
                    updated_at?: string
                }
                Relationships: []
            },
            user_enrollments: {
                Row: {
                    id: string
                    user_id: string
                    course_slug: string
                    started_at: string
                    completed_at: string | null
                    last_accessed_at: string
                    progress_pct: number | null
                    status: string | null
                    enrollment_method: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    course_slug: string
                    started_at?: string
                    completed_at?: string | null
                    last_accessed_at?: string
                    progress_pct?: number | null
                    status?: string | null
                    enrollment_method?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    user_id?: string
                    course_slug?: string
                    started_at?: string
                    completed_at?: string | null
                    last_accessed_at?: string
                    progress_pct?: number | null
                    status?: string | null
                    enrollment_method?: string | null
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_enrollments_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "user_enrollments_course_slug_fkey"
                        columns: ["course_slug"]
                        referencedRelation: "courses"
                        referencedColumns: ["slug"]
                    }
                ]
            },
            lesson_progress: {
                Row: {
                    id: string
                    enrollment_id: string
                    lesson_id: string
                    completed: boolean
                    watch_time_seconds: number | null
                    completed_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    enrollment_id: string
                    lesson_id: string
                    completed?: boolean
                    watch_time_seconds?: number | null
                    completed_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    enrollment_id?: string
                    lesson_id?: string
                    completed?: boolean
                    watch_time_seconds?: number | null
                    completed_at?: string | null
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "lesson_progress_enrollment_id_fkey"
                        columns: ["enrollment_id"]
                        referencedRelation: "user_enrollments"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "lesson_progress_lesson_id_fkey"
                        columns: ["lesson_id"]
                        referencedRelation: "lessons"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {}
        Functions: {}
        Enums: {}
        CompositeTypes: {}
    }
}
