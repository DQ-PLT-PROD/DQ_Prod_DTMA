/**
 * Course Management Constants for Instructor Portal
 */

export const DEPARTMENTS = [
    'HRA (People)',
    'Finance',
    'Deals',
    'Stories',
    'Intelligence',
    'Solutions',
    'SecDevOps',
    'Products',
    'Delivery — Deploys',
    'Delivery — Designs',
    'DCO Operations',
    'DBP Platform',
    'DBP Delivery',
] as const;

export const COURSE_CATEGORIES = [
    'GHC',
    '6x Digital',
    'DWS',
    'DXP',
    'Key Tools',
] as const;

export const LMS_ITEM_PROVIDERS = [
    'DQ HRA',
    'DQ DTMB',
    'DQ DTMA',
    'Tech (Microsoft)',
    'Tech (Ardoq)',
] as const;

export const COURSE_TYPES = [
    'Course (Single Lesson)',
    'Course (Multi-Lessons)',
] as const;

export const SFIA_LEVEL_CODES = [
    'L0. Starting (Learning)',
    'L1. Follow (Self Aware)',
    'L2. Assist (Self Lead)',
    'L3. Apply (Drive Squad)',
    'L4. Enable (Drive Team)',
    'L5. Ensure (Steer Org)',
    'L6. Influence (Steer Cross)',
    'L7. Inspire (Inspire Market)',
] as const;

export const AUDIENCE_OPTIONS = [
    'Associate',
    'Lead',
] as const;

export const COURSE_STATUS = [
    'draft',
    'published',
    'archived',
] as const;

export type Department = typeof DEPARTMENTS[number];
export type CourseCategory = typeof COURSE_CATEGORIES[number];
export type LmsItemProvider = typeof LMS_ITEM_PROVIDERS[number];
export type CourseType = typeof COURSE_TYPES[number];
export type SfiaLevelCode = typeof SFIA_LEVEL_CODES[number];
export type AudienceOption = typeof AUDIENCE_OPTIONS[number];
export type CourseStatus = typeof COURSE_STATUS[number];
