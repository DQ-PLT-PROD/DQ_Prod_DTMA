import React from 'react';

/**
 * Material Design 3 Card Examples
 * 
 * This file demonstrates all 3 M3 card variants with proper implementation.
 */

// 1. Elevated Card (Default)
export const ElevatedCard = ({ title, content, actions }) => {
    return (
        <div className="
      bg-surface-level-1
      rounded-md
      shadow-sm hover:shadow-md
      p-4
      transition-all duration-200
    ">
            {title && (
                <h3 className="text-headline-sm text-on-surface mb-2">
                    {title}
                </h3>
            )}
            {content && (
                <p className="text-body-md text-on-surface-variant">
                    {content}
                </p>
            )}
            {actions && (
                <div className="mt-4 flex gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
};

// 2. Filled Card (Subtle)
export const FilledCard = ({ title, content, actions }) => {
    return (
        <div className="
      bg-surface-variant
      rounded-md
      p-4
    ">
            {title && (
                <h3 className="text-headline-sm text-on-surface mb-2">
                    {title}
                </h3>
            )}
            {content && (
                <p className="text-body-md text-on-surface-variant">
                    {content}
                </p>
            )}
            {actions && (
                <div className="mt-4 flex gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
};

// 3. Outlined Card
export const OutlinedCard = ({ title, content, actions, selected = false }) => {
    return (
        <div className={`
      bg-surface
      border
      ${selected ? 'border-primary' : 'border-outline-variant hover:border-outline'}
      rounded-md
      p-4
      transition-colors duration-200
    `}>
            {title && (
                <h3 className="text-headline-sm text-on-surface mb-2">
                    {title}
                </h3>
            )}
            {content && (
                <p className="text-body-md text-on-surface-variant">
                    {content}
                </p>
            )}
            {actions && (
                <div className="mt-4 flex gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
};

// Example: Course Card (Elevated)
export const CourseCard = ({ title, description, duration, lessons, thumbnail }) => {
    return (
        <ElevatedCard
            title={
                <div className="space-y-2">
                    {thumbnail && (
                        <img
                            src={thumbnail}
                            alt={title}
                            className="w-full h-40 object-cover rounded-sm -mx-4 -mt-4 mb-4"
                        />
                    )}
                    <h3 className="text-headline-sm">{title}</h3>
                </div>
            }
            content={
                <div className="space-y-3">
                    <p className="text-body-md text-on-surface-variant">
                        {description}
                    </p>
                    <div className="flex gap-4 text-body-sm text-on-surface-variant">
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {duration}
                        </span>
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {lessons} lessons
                        </span>
                    </div>
                </div>
            }
            actions={
                <>
                    <button className="h-10 px-4 text-primary rounded-full hover:bg-primary/5 transition-all duration-200 text-label-lg">
                        Preview
                    </button>
                    <button className="h-10 px-6 bg-primary text-on-primary rounded-full shadow-sm hover:shadow-md transition-all duration-200 text-label-lg">
                        Enroll
                    </button>
                </>
            }
        />
    );
};

// Example Usage Component
export const CardExamples = () => {
    return (
        <div className="space-y-8 p-8">
            <div className="space-y-4">
                <h2 className="text-headline-md">M3 Card Variants</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ElevatedCard
                        title="Elevated Card"
                        content="This is the default card style with shadow elevation. Best for most content."
                        actions={
                            <button className="h-10 px-6 bg-primary text-on-primary rounded-full shadow-sm hover:shadow-md transition-all duration-200 text-label-lg">
                                Action
                            </button>
                        }
                    />

                    <FilledCard
                        title="Filled Card"
                        content="This card has a subtle tinted background with no shadow. Best for secondary content."
                        actions={
                            <button className="h-10 px-6 bg-primary-container text-on-primary-container rounded-full hover:shadow-sm transition-all duration-200 text-label-lg">
                                Action
                            </button>
                        }
                    />

                    <OutlinedCard
                        title="Outlined Card"
                        content="This card has a border with no fill. Best for selectable items or clear boundaries."
                        actions={
                            <button className="h-10 px-6 border border-outline text-primary rounded-full hover:bg-primary/5 transition-all duration-200 text-label-lg">
                                Action
                            </button>
                        }
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-title-lg">Course Card Example</h3>

                <div className="max-w-sm">
                    <CourseCard
                        title="Introduction to Material Design 3"
                        description="Learn the fundamentals of Material Design 3 and how to implement it in your applications."
                        duration="2h 30m"
                        lessons={12}
                        thumbnail="https://via.placeholder.com/400x200"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-title-lg">Selectable Cards</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <OutlinedCard
                        title="Option 1"
                        content="This option is selected"
                        selected={true}
                    />
                    <OutlinedCard
                        title="Option 2"
                        content="This option is not selected"
                        selected={false}
                    />
                    <OutlinedCard
                        title="Option 3"
                        content="This option is not selected"
                        selected={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default CardExamples;
