import React, { useState } from 'react';
import { DatabaseIcon, BarChartIcon, ShoppingCartIcon, KeyIcon, PlusIcon, CopyIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
// Mock data for integrations
const mockIntegrations = [{
    id: 1,
    name: 'Dataverse',
    description: 'Connect to Microsoft Dataverse to sync data',
    icon: DatabaseIcon,
    status: 'Coming Soon',
    lastSync: '-'
}, {
    id: 2,
    name: 'Vendure',
    description: 'E-commerce integration for product management',
    icon: ShoppingCartIcon,
    status: 'Coming Soon',
    lastSync: '-'
}, {
    id: 3,
    name: 'Power BI',
    description: 'Business intelligence and reporting integration',
    icon: BarChartIcon,
    status: 'Coming Soon',
    lastSync: '-'
}];
// Mock data for API tokens
const mockApiTokens = [{
    id: 1,
    name: 'Development API',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    created: '2023-08-15',
    lastUsed: '2 hours ago'
}, {
    id: 2,
    name: 'Production API',
    token: 'kJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    created: '2023-07-20',
    lastUsed: '3 days ago'
}];
export default function IntegrationsBillingTab() {
    const [showTokenModal, setShowTokenModal] = useState(false);
    const [visibleTokens, setVisibleTokens] = useState<Record<number, boolean>>({});
    const toggleTokenVisibility = (tokenId: number) => {
        setVisibleTokens(prev => ({
            ...prev,
            [tokenId]: !prev[tokenId]
        }));
    };
    return <div className="space-y-6">
        {/* Coming Soon Banner */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
            <p className="text-center text-gray-600 font-medium">
                Integrations & Billing features are coming soon. The functionality
                below is for preview only.
            </p>
        </div>
        {/* Integrations Section */}
        <section className="opacity-60">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Integrations
            </h2>
            <div className="space-y-4">
                {mockIntegrations.map(integration => <div key={integration.id} className="bg-white p-4 border border-gray-200 rounded-md">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                            <integration.icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4 flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-md font-medium text-gray-900">
                                        {integration.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {integration.description}
                                    </p>
                                    <div className="mt-2 flex items-center text-sm">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {integration.status}
                                        </span>
                                    </div>
                                </div>
                                <button disabled className="px-3 py-1.5 bg-gray-300 text-gray-600 text-sm rounded-md cursor-not-allowed">
                                    Connect
                                </button>
                            </div>
                        </div>
                    </div>
                </div>)}
            </div>
        </section>
        {/* API Tokens Section */}
        <section className="opacity-60">
            <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-3 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">API Tokens</h2>
                <button disabled className="inline-flex items-center px-3 py-1.5 bg-gray-300 text-gray-600 text-sm rounded-md cursor-not-allowed">
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Generate New Token
                </button>
            </div>
            <div className="hidden lg:block bg-white border border-gray-200 rounded-md">
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Token Name
                            </th>
                            <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Token
                            </th>
                            <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                            </th>
                            <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Used
                            </th>
                            <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {mockApiTokens.map(token => <tr key={token.id}>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <KeyIcon className="h-4 w-4 text-gray-500 mr-2" />
                                    <div className="text-sm font-medium text-gray-900">
                                        {token.name}
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="text-sm text-gray-500 font-mono">
                                        {visibleTokens[token.id] ? token.token : '••••••••••••••••••••••••••••'}
                                    </div>
                                    <button disabled className="ml-2 text-gray-400 cursor-not-allowed">
                                        {visibleTokens[token.id] ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                    </button>
                                    <button disabled className="ml-1 text-gray-400 cursor-not-allowed">
                                        <CopyIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {token.created}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {token.lastUsed}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button disabled className="text-gray-400 cursor-not-allowed mr-3">
                                    Regenerate
                                </button>
                                <button disabled className="text-gray-400 cursor-not-allowed">
                                    Revoke
                                </button>
                            </td>
                        </tr>)}
                    </tbody>
                </table>
                </div>
            </div>
            {/* Mobile & tablet cards */}
            <div className="lg:hidden space-y-3">
                {mockApiTokens.map(token => (
                    <div key={token.id} className="bg-white border border-gray-200 rounded-md p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <KeyIcon className="h-4 w-4 text-gray-500" />
                                    <div className="text-sm font-medium text-gray-900">{token.name}</div>
                                </div>
                                <div className="mt-2 text-xs text-gray-500 font-mono break-all">••••••••••••••••••••••••••••••••</div>
                                <div className="mt-2 text-xs text-gray-500">Created: {token.created}</div>
                                <div className="text-xs text-gray-500">Last used: {token.lastUsed}</div>
                            </div>
                            <div className="text-xs text-gray-400">Preview</div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
        {/* Billing & Subscription Section (Coming Soon) */}
        <section className="opacity-60 cursor-not-allowed">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Billing & Subscription
            </h2>
            <div className="bg-white p-4 border border-gray-200 rounded-md">
                <p className="text-gray-500">
                    Manage your subscription plan, billing information, and payment
                    history.
                </p>
            </div>
        </section>
    </div>;
}
