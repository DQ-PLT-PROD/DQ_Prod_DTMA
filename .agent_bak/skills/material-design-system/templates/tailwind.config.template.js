/**
 * Material Design 3 Tailwind Configuration Template
 * 
 * This template extends Tailwind CSS with Material Design 3 tokens.
 * Copy the relevant sections to your tailwind.config.js file.
 */

module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            // M3 Color System
            colors: {
                // Primary
                primary: {
                    DEFAULT: '#0030E3',
                    container: '#DDE3FF',
                    on: '#FFFFFF',
                    'on-container': '#000E44',
                },
                // Secondary
                secondary: {
                    DEFAULT: '#1839AD',
                    container: '#E0E5FF',
                    on: '#FFFFFF',
                    'on-container': '#001258',
                },
                // Tertiary
                tertiary: {
                    DEFAULT: '#6750A4',
                    container: '#E9DDFF',
                    on: '#FFFFFF',
                    'on-container': '#22005D',
                },
                // Error
                error: {
                    DEFAULT: '#BA1A1A',
                    container: '#FFDAD6',
                    on: '#FFFFFF',
                    'on-container': '#410002',
                },
                // Surface & Background
                background: '#FEFBFF',
                'on-background': '#1C1B1F',
                surface: {
                    DEFAULT: '#FEFBFF',
                    variant: '#E7E0EC',
                    'level-0': '#FEFBFF',
                    'level-1': '#F5F6FF', // 5% primary tint
                    'level-2': '#F2F4FF', // 8% primary tint
                    'level-3': '#EFF1FF', // 11% primary tint
                    'level-4': '#EEF0FF', // 12% primary tint
                    'level-5': '#ECEFFF', // 14% primary tint
                },
                'on-surface': '#1C1B1F',
                'on-surface-variant': '#49454F',
                // Outline
                outline: {
                    DEFAULT: '#79747E',
                    variant: '#CAC4D0',
                },
                // Neutral
                neutral: {
                    900: '#1C1B1F',
                    700: '#49454F',
                    500: '#79747E',
                    300: '#CAC4D0',
                    200: '#E7E0EC',
                    100: '#F3F4F6',
                    50: '#FEFBFF',
                },
            },

            // M3 Typography
            fontFamily: {
                sans: ['Roboto', 'Inter', 'system-ui', 'sans-serif'],
                mono: ['Roboto Mono', 'Consolas', 'monospace'],
            },
            fontSize: {
                // Display
                'display-lg': ['57px', { lineHeight: '64px', letterSpacing: '-0.25px', fontWeight: '400' }],
                'display-md': ['45px', { lineHeight: '52px', letterSpacing: '0px', fontWeight: '400' }],
                'display-sm': ['36px', { lineHeight: '44px', letterSpacing: '0px', fontWeight: '400' }],
                // Headline
                'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '0px', fontWeight: '400' }],
                'headline-md': ['28px', { lineHeight: '36px', letterSpacing: '0px', fontWeight: '400' }],
                'headline-sm': ['24px', { lineHeight: '32px', letterSpacing: '0px', fontWeight: '400' }],
                // Title
                'title-lg': ['22px', { lineHeight: '28px', letterSpacing: '0px', fontWeight: '400' }],
                'title-md': ['16px', { lineHeight: '24px', letterSpacing: '0.15px', fontWeight: '500' }],
                'title-sm': ['14px', { lineHeight: '20px', letterSpacing: '0.1px', fontWeight: '500' }],
                // Body
                'body-lg': ['16px', { lineHeight: '24px', letterSpacing: '0.5px', fontWeight: '400' }],
                'body-md': ['14px', { lineHeight: '20px', letterSpacing: '0.25px', fontWeight: '400' }],
                'body-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.4px', fontWeight: '400' }],
                // Label
                'label-lg': ['14px', { lineHeight: '20px', letterSpacing: '0.1px', fontWeight: '500' }],
                'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.5px', fontWeight: '500' }],
                'label-sm': ['11px', { lineHeight: '16px', letterSpacing: '0.5px', fontWeight: '500' }],
            },

            // M3 Shape (Border Radius)
            borderRadius: {
                'none': '0px',
                'xs': '4px',
                'sm': '8px',
                'md': '12px',
                'lg': '16px',
                'xl': '28px',
                'full': '9999px',
            },

            // M3 Elevation (Shadows)
            boxShadow: {
                'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
                'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            },

            // M3 Spacing (4px grid)
            spacing: {
                '1': '4px',
                '2': '8px',
                '3': '12px',
                '4': '16px',
                '5': '20px',
                '6': '24px',
                '8': '32px',
                '10': '40px',
                '12': '48px',
                '16': '64px',
                '20': '80px',
                '24': '96px',
            },

            // M3 Transitions
            transitionTimingFunction: {
                'standard': 'cubic-bezier(0.2, 0, 0, 1)',
                'emphasized': 'cubic-bezier(0.2, 0, 0, 1)',
                'emphasized-decelerate': 'cubic-bezier(0.05, 0.7, 0.1, 1)',
            },
            transitionDuration: {
                '50': '50ms',
                '100': '100ms',
                '200': '200ms',
                '300': '300ms',
                '400': '400ms',
            },
        },
    },
    plugins: [],
};
