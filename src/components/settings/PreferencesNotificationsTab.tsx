import React, { useEffect, useState } from 'react';
import { GlobeIcon, ClockIcon, MoonIcon, BellIcon } from 'lucide-react';

type Preferences = {
    language: string;
    timezone: string;
    darkMode: boolean;
    notifications: {
        complianceAlerts: boolean;
        submissionDeadlines: boolean;
        partnerMessages: boolean;
    };
};

const STORAGE_KEY = 'settings.preferences.v1';

export default function PreferencesNotificationsTab() {
    const [prefs, setPrefs] = useState<Preferences>(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {
            console.error(e);
        }
        return {
            language: 'en',
            timezone: 'gmt+4',
            darkMode: false,
            notifications: {
                complianceAlerts: true,
                submissionDeadlines: true,
                partnerMessages: false
            }
        };
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
        } catch (e) {
            console.error(e);
        }
    }, [prefs]);

    useEffect(() => {
        const root = document.documentElement;
        if (prefs.darkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [prefs.darkMode]);

    const handleSelect = (field: 'language' | 'timezone') => (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPrefs(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleToggle = (
        path: 'darkMode' | 'notifications.complianceAlerts' | 'notifications.submissionDeadlines' | 'notifications.partnerMessages'
    ) => () => {
        setPrefs(prev => {
            if (path === 'darkMode') return { ...prev, darkMode: !prev.darkMode };
            const next = { ...prev, notifications: { ...prev.notifications } };
            if (path.endsWith('complianceAlerts')) next.notifications.complianceAlerts = !prev.notifications.complianceAlerts;
            if (path.endsWith('submissionDeadlines')) next.notifications.submissionDeadlines = !prev.notifications.submissionDeadlines;
            if (path.endsWith('partnerMessages')) next.notifications.partnerMessages = !prev.notifications.partnerMessages;
            return next;
        });
    };

    // Placeholder for future server sync
    // const isDirty = useMemo(() => false, []);

    return (
        <div className="space-y-6">
            {/* Preferences Section */}
            <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Preferences
                </h2>
                <div className="bg-white p-4 border border-gray-200 rounded-md space-y-4">
                    {/* Language Preference */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <GlobeIcon className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-3 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                                    Language
                                </label>
                                <select
                                    id="language"
                                    value={prefs.language}
                                    onChange={handleSelect('language')}
                                    className="mt-2 sm:mt-0 block w-full sm:max-w-xs border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                    <option value="en">English</option>
                                    <option value="ar">Arabic</option>
                                    <option value="fr">French</option>
                                    <option value="es">Spanish</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    {/* Time Zone Preference */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <ClockIcon className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-3 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                                    Time Zone
                                </label>
                                <select
                                    id="timezone"
                                    value={prefs.timezone}
                                    onChange={handleSelect('timezone')}
                                    className="mt-2 sm:mt-0 block w-full sm:max-w-xs border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                    <option value="gmt+4">(GMT+4) Gulf Standard Time</option>
                                    <option value="gmt+3">(GMT+3) Eastern European Time</option>
                                    <option value="gmt+0">(GMT+0) Greenwich Mean Time</option>
                                    <option value="gmt-5">(GMT-5) Eastern Standard Time</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    {/* Dark Mode Toggle */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <MoonIcon className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-3 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                    <span className="block text-sm font-medium text-gray-700">Dark Mode</span>
                                    <span className="text-sm text-gray-500">Switch between light and dark theme</span>
                                </div>
                                <div className="flex items-center">
                                    <label className="inline-flex relative items-center cursor-pointer" aria-label="Toggle dark mode">
                                        <input type="checkbox" className="sr-only peer" checked={prefs.darkMode} onChange={handleToggle('darkMode')} />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Notifications Section */}
            <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
                <div className="bg-white p-4 border border-gray-200 rounded-md">
                    <p className="text-sm text-gray-500 mb-4">
                        Configure which notifications you want to receive. These settings
                        apply organization-wide.
                    </p>
                    <div className="space-y-4">
                        {/* Compliance Alerts */}
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <BellIcon className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="ml-3 flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">Compliance Alerts</h3>
                                        <p className="text-sm text-gray-500 mt-1">Get notified about important compliance deadlines and requirements</p>
                                    </div>
                                    <div className="flex items-center">
                                        <label className="inline-flex relative items-center cursor-pointer" aria-label="Toggle compliance alerts">
                                            <input type="checkbox" className="sr-only peer" checked={prefs.notifications.complianceAlerts} onChange={handleToggle('notifications.complianceAlerts')} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Submission Deadlines */}
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <BellIcon className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="ml-3 flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">Submission Deadlines</h3>
                                        <p className="text-sm text-gray-500 mt-1">Receive reminders about upcoming submission deadlines</p>
                                    </div>
                                    <div className="flex items-center">
                                        <label className="inline-flex relative items-center cursor-pointer" aria-label="Toggle submission deadline notifications">
                                            <input type="checkbox" className="sr-only peer" checked={prefs.notifications.submissionDeadlines} onChange={handleToggle('notifications.submissionDeadlines')} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Partner Messages */}
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <BellIcon className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="ml-3 flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">Partner Messages</h3>
                                        <p className="text-sm text-gray-500 mt-1">Get notified when partners send you messages or updates</p>
                                    </div>
                                    <div className="flex items-center">
                                        <label className="inline-flex relative items-center cursor-pointer" aria-label="Toggle partner messages">
                                            <input type="checkbox" className="sr-only peer" checked={prefs.notifications.partnerMessages} onChange={handleToggle('notifications.partnerMessages')} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <div className="flex justify-end">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full sm:w-auto" onClick={() => {
                    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch (e) { console.error(e); }
                }}>Save preferences</button>
            </div>
        </div>
    );
}
