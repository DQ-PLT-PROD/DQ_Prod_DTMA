# DTMA Academy - Entity Relationship Diagram

This document provides the Entity Relationship Diagram (ERD) for the DTMA Academy platform database schema.

## Overview

The database is organized into the following domains:
- **Course Management**: Courses, Lessons, Quizzes, Resources
- **Content & Media**: Media Items, Media Assets
- **Classification**: Categories, Industries, Audience Levels, Difficulty Levels
- **User Management**: Users, Business Profiles, Sessions

---

## Complete ERD

```mermaid
erDiagram
    %% ===========================
    %% COURSE MANAGEMENT DOMAIN
    %% ===========================
    
    courses {
        UUID id PK
        TEXT slug UK
        TEXT title
        TEXT short_description
        TEXT long_description
        TEXT category_id FK
        TEXT audience_level
        TEXT[] topic_tags
        TEXT level_tag
        NUMERIC estimated_duration_minutes
        NUMERIC lesson_count
        TEXT hero_image_url
        TEXT intro_video_url
        TEXT intro_video_poster_url
        TEXT thumbnail_url
        BOOLEAN is_featured
        TEXT status
        NUMERIC rating
        NUMERIC review_count
        TEXT delivery_mode
        TEXT enrollment_url
        TEXT[] learning_outcomes
        TEXT[] skills_gained
        TEXT upon_completion
        TEXT start_date
        BOOLEAN is_coming_soon
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }
    
    lessons {
        UUID id PK
        TEXT course_slug FK
        TEXT title
        TEXT type "intro|standard|outro|quiz"
        NUMERIC order_index
        NUMERIC estimated_duration_minutes
        TEXT video_url
        TEXT resource_url
        TEXT content
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }
    
    quizzes {
        UUID id PK
        TEXT course_slug FK
        TEXT title
        NUMERIC order_index
        TEXT question
        JSONB options "Array of id-text objects"
        TEXT correct_answer
        TEXT explanation
        TIMESTAMPTZ created_at
    }
    
    course_resources {
        UUID id PK
        TEXT course_slug FK
        TEXT title
        TEXT type "whitepaper|pdf|template|tool|worksheet|other"
        TEXT description
        TEXT resource_url
        NUMERIC file_size_bytes
        NUMERIC order_index
        TIMESTAMPTZ created_at
    }
    
    related_courses {
        UUID id PK
        TEXT course_slug FK
        TEXT related_course_slug FK
        NUMERIC display_order
        TIMESTAMPTZ created_at
    }
    
    %% ===========================
    %% CLASSIFICATION DOMAIN
    %% ===========================
    
    course_categories {
        UUID id PK
        TEXT slug UK
        TEXT name
        TEXT description
        NUMERIC display_order
        BOOLEAN is_active
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }
    
    industries {
        UUID id PK
        TEXT slug UK
        TEXT parent_slug FK "Self-referencing hierarchy"
        TEXT name
        TEXT description
        TEXT icon
        NUMERIC display_order
        BOOLEAN is_active
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }
    
    audience_levels {
        UUID id PK
        TEXT slug UK
        TEXT name
        TEXT description
        NUMERIC display_order
        BOOLEAN is_active
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }
    
    difficulty_levels {
        UUID id PK
        TEXT slug UK
        TEXT name
        TEXT description
        NUMERIC display_order
        BOOLEAN is_active
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }
    
    %% ===========================
    %% MEDIA DOMAIN
    %% ===========================
    
    media_items {
        UUID id PK
        TEXT title
        TEXT slug UK
        TEXT summary
        TEXT body
        TEXT body_html
        JSONB body_json
        TEXT type
        TEXT category
        TEXT status
        TEXT visibility
        TEXT language
        TIMESTAMPTZ published_at
        TIMESTAMPTZ updated_at
        TIMESTAMPTZ created_at
        TEXT seo_title
        TEXT seo_description
        TEXT canonical_url
        TEXT[] tags
        TEXT thumbnail_url
        TEXT video_url
        TEXT podcast_url
        TEXT document_url
        NUMERIC duration_sec
        NUMERIC file_size_bytes
        TEXT event_date
        TEXT event_time
        TEXT event_location
        TEXT event_location_details
        TEXT event_registration_info
        JSONB event_agenda
    }
    
    media_assets {
        UUID id PK
        UUID media_id FK
        TEXT kind "Image|Video|Audio|Doc"
        TEXT public_url
        TEXT storage_path
        TEXT mime
        NUMERIC size_bytes
        NUMERIC duration_sec
        TEXT checksum
        TIMESTAMPTZ created_at
    }
    
    %% ===========================
    %% USER DOMAIN
    %% ===========================
    
    users {
        UUID id PK
        TEXT azure_user_id UK
        TEXT customer_id UK
        TEXT email
        TEXT name
        TEXT given_name
        TEXT surname
        TEXT job_title
        TEXT department
        TEXT office_location
        JSONB profile_data
        TIMESTAMPTZ last_login
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }
    
    user_business_profiles {
        UUID id PK
        UUID user_id FK
        TEXT profile_name
        JSONB profile_data
        BOOLEAN is_primary
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }
    
    user_sessions {
        UUID id PK
        UUID user_id FK
        TEXT session_token
        TIMESTAMPTZ login_time
        TIMESTAMPTZ logout_time
        TEXT ip_address
        TEXT user_agent
        BOOLEAN is_active
    }
    
    %% ===========================
    %% RELATIONSHIPS
    %% ===========================
    
    %% Course Management Relationships
    courses ||--o{ lessons : "has many"
    courses ||--o{ quizzes : "has many"
    courses ||--o{ course_resources : "has many"
    courses ||--o{ related_courses : "source course"
    courses ||--o{ related_courses : "target course"
    
    %% Classification Relationships
    course_categories ||--o{ courses : "categorizes"
    industries ||--o| industries : "parent-child hierarchy"
    
    %% Media Relationships
    media_items ||--o{ media_assets : "has many"
    
    %% User Relationships
    users ||--o{ user_business_profiles : "has many"
    users ||--o{ user_sessions : "has many"
```

---

## Domain-Specific Diagrams

### Course Management Domain

```mermaid
erDiagram
    courses ||--o{ lessons : "has curriculum"
    courses ||--o{ quizzes : "has assessments"
    courses ||--o{ course_resources : "has downloadables"
    courses ||--o{ related_courses : "recommends"
    
    courses {
        UUID id PK
        TEXT slug UK
        TEXT title
        TEXT category_id FK
        TEXT status
        BOOLEAN is_featured
        BOOLEAN is_coming_soon
    }
    
    lessons {
        UUID id PK
        TEXT course_slug FK
        TEXT title
        TEXT type
        NUMERIC order_index
        TEXT video_url
    }
    
    quizzes {
        UUID id PK
        TEXT course_slug FK
        TEXT question
        JSONB options
        TEXT correct_answer
    }
    
    course_resources {
        UUID id PK
        TEXT course_slug FK
        TEXT title
        TEXT type
        TEXT resource_url
    }
    
    related_courses {
        UUID id PK
        TEXT course_slug FK
        TEXT related_course_slug FK
    }
```

### Industry Hierarchy

```mermaid
erDiagram
    industries ||--o| industries : "parent"
    
    industries {
        UUID id PK
        TEXT slug UK
        TEXT parent_slug FK
        TEXT name
        TEXT description
        NUMERIC display_order
        BOOLEAN is_active
    }
```

### User Management Domain

```mermaid
erDiagram
    users ||--o{ user_business_profiles : "owns"
    users ||--o{ user_sessions : "has"
    
    users {
        UUID id PK
        TEXT azure_user_id UK
        TEXT customer_id UK
        TEXT email
        TEXT name
        TEXT department
    }
    
    user_business_profiles {
        UUID id PK
        UUID user_id FK
        TEXT profile_name
        JSONB profile_data
        BOOLEAN is_primary
    }
    
    user_sessions {
        UUID id PK
        UUID user_id FK
        TEXT session_token
        TIMESTAMPTZ login_time
        BOOLEAN is_active
    }
```

---

## Key Relationships Summary

| Relationship | Cardinality | Description |
|:------------|:------------|:------------|
| `courses` → `lessons` | One-to-Many | A course contains multiple ordered lessons |
| `courses` → `quizzes` | One-to-Many | A course has multiple quiz questions |
| `courses` → `course_resources` | One-to-Many | A course has downloadable resources |
| `courses` → `related_courses` | Many-to-Many | Courses can recommend other courses |
| `course_categories` → `courses` | One-to-Many | Categories group courses |
| `industries` → `industries` | Self-referencing | Industries form a hierarchical tree |
| `media_items` → `media_assets` | One-to-Many | Media items have multiple asset files |
| `users` → `user_business_profiles` | One-to-Many | Users can have multiple business profiles |
| `users` → `user_sessions` | One-to-Many | Users have login session history |

---

## Foreign Key Constraints

| Table | Column | References | On Delete |
|:------|:-------|:-----------|:----------|
| `lessons` | `course_slug` | `courses(slug)` | CASCADE |
| `quizzes` | `course_slug` | `courses(slug)` | CASCADE |
| `course_resources` | `course_slug` | `courses(slug)` | CASCADE |
| `related_courses` | `course_slug` | `courses(slug)` | CASCADE |
| `related_courses` | `related_course_slug` | `courses(slug)` | CASCADE |
| `media_assets` | `media_id` | `media_items(id)` | CASCADE |
| `industries` | `parent_slug` | `industries(slug)` | SET NULL |
| `user_business_profiles` | `user_id` | `users(id)` | CASCADE |
| `user_sessions` | `user_id` | `users(id)` | CASCADE |
