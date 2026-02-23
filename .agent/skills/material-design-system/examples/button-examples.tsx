import React from 'react';

/**
 * Material Design 3 Button Examples
 * 
 * This file demonstrates all 5 M3 button variants with proper implementation.
 */

// 1. Filled Button (High Emphasis)
export const FilledButton = ({ children, onClick, disabled = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="
        h-10 px-6
        bg-primary text-on-primary
        rounded-full
        shadow-sm hover:shadow-md
        disabled:bg-neutral-200 disabled:text-neutral-500 disabled:shadow-none
        transition-all duration-200
        text-label-lg font-medium
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
      "
        >
            {children}
        </button>
    );
};

// 2. Filled Tonal Button (Medium Emphasis)
export const FilledTonalButton = ({ children, onClick, disabled = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="
        h-10 px-6
        bg-primary-container text-on-primary-container
        rounded-full
        hover:shadow-sm
        disabled:bg-neutral-200 disabled:text-neutral-500
        transition-all duration-200
        text-label-lg font-medium
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
      "
        >
            {children}
        </button>
    );
};

// 3. Outlined Button (Medium Emphasis)
export const OutlinedButton = ({ children, onClick, disabled = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="
        h-10 px-6
        border border-outline
        text-primary
        rounded-full
        hover:bg-primary/5
        disabled:border-neutral-300 disabled:text-neutral-500
        transition-all duration-200
        text-label-lg font-medium
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
      "
        >
            {children}
        </button>
    );
};

// 4. Text Button (Low Emphasis)
export const TextButton = ({ children, onClick, disabled = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="
        h-10 px-4
        text-primary
        rounded-full
        hover:bg-primary/5
        disabled:text-neutral-500
        transition-all duration-200
        text-label-lg font-medium
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
      "
        >
            {children}
        </button>
    );
};

// 5. Elevated Button (Special Emphasis)
export const ElevatedButton = ({ children, onClick, disabled = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="
        h-10 px-6
        bg-surface-level-1 text-primary
        rounded-full
        shadow-sm hover:shadow-md
        disabled:bg-neutral-200 disabled:text-neutral-500 disabled:shadow-none
        transition-all duration-200
        text-label-lg font-medium
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
      "
        >
            {children}
        </button>
    );
};

// Example Usage Component
export const ButtonExamples = () => {
    return (
        <div className="space-y-8 p-8">
            <div className="space-y-4">
                <h2 className="text-headline-md">M3 Button Variants</h2>

                <div className="flex flex-wrap gap-4">
                    <FilledButton onClick={() => console.log('Filled clicked')}>
                        Filled Button
                    </FilledButton>

                    <FilledTonalButton onClick={() => console.log('Tonal clicked')}>
                        Tonal Button
                    </FilledTonalButton>

                    <OutlinedButton onClick={() => console.log('Outlined clicked')}>
                        Outlined Button
                    </OutlinedButton>

                    <TextButton onClick={() => console.log('Text clicked')}>
                        Text Button
                    </TextButton>

                    <ElevatedButton onClick={() => console.log('Elevated clicked')}>
                        Elevated Button
                    </ElevatedButton>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-title-lg">Disabled States</h3>

                <div className="flex flex-wrap gap-4">
                    <FilledButton disabled>Filled Disabled</FilledButton>
                    <FilledTonalButton disabled>Tonal Disabled</FilledTonalButton>
                    <OutlinedButton disabled>Outlined Disabled</OutlinedButton>
                    <TextButton disabled>Text Disabled</TextButton>
                    <ElevatedButton disabled>Elevated Disabled</ElevatedButton>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-title-lg">With Icons</h3>

                <div className="flex flex-wrap gap-4">
                    <FilledButton>
                        <span className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Item
                        </span>
                    </FilledButton>

                    <OutlinedButton>
                        <span className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Settings
                        </span>
                    </OutlinedButton>
                </div>
            </div>
        </div>
    );
};

export default ButtonExamples;
