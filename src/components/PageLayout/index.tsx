import React, { Fragment, ComponentType } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { BurgerMenuButton } from '../Sidebar';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ComponentType<{ className?: string; }>;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  'data-id'?: string;
}

// export function Breadcrumbs({ items, 'data-id': dataId }: BreadcrumbsProps) {
//   return (
//     <nav
//       className="flex items-center gap-2 text-sm max-w-full overflow-hidden"
//       style={{ whiteSpace: 'nowrap' }}
//       aria-label="Breadcrumb"
//       data-id={dataId}
//     >
//       {items.map((item, index) => (
//         <Fragment key={index}>
//           {index > 0 && <ChevronRight className="w-3 h-3 shrink-0 text-gray-400" />}
//           {item.current ? (
//             <span className="text-gray-900 font-medium flex items-center min-w-0 truncate">
//               {index === 0 && <Home className="w-4 h-4 shrink-0 text-gray-400 mr-1" />}
//               <span className="truncate">{item.label}</span>
//             </span>
//           ) : (
//             <a
//               href={item.href || '#'}
//               className="text-gray-600 hover:text-gray-800 flex items-center min-w-0 truncate"
//             >
//               {index === 0 && <Home className="w-4 h-4 shrink-0 text-gray-400 mr-1" />}
//               <span className="truncate">{item.label}</span>
//             </a>
//           )}
//         </Fragment>
//       ))}
//     </nav>
//   );
// }


interface PageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  'data-id'?: string;
  headerClassName?: string;
  titleClassName?: string;
}

// export function PageHeader({
//   title,
//   breadcrumbs,
//   'data-id': dataId,
//   headerClassName = 'pb-4',
//   titleClassName = 'text-3xl font-bold text-gray-900 mb-2',
// }: PageHeaderProps) {
//   return (
//     <div className={headerClassName} data-id={dataId}>
//       <h1 className={titleClassName}>{title}</h1>
//       {breadcrumbs && breadcrumbs.length > 0 && (
//         <Breadcrumbs items={breadcrumbs} />
//       )}
//     </div>
//   );
// }

interface PageLayoutProps {
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
  'data-id'?: string;
  headerClassName?: string;
  titleClassName?: string;
  setIsOpen?: (isOpen: boolean) => void;
  isLoggedIn?: boolean;
}

export function PageLayout({
  title,
  breadcrumbs,
  children,
  'data-id': dataId,
  headerClassName,
  titleClassName,
  isLoggedIn,
  setIsOpen
}: PageLayoutProps) {
  return (
    <main
      className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50"
      style={{ width: '100%', maxWidth: '100dvw', overscrollBehaviorX: 'contain' }}
      data-id={dataId}
    >
      <div className='flex  '>
        <BurgerMenuButton
          isLoggedIn={isLoggedIn}
          onClick={() => setIsOpen?.(true)}
          className='lg:hidden'
        />
        {/* Hard containment + responsive padding */}
        <div className="w-full max-w-screen-2xl mx-auto px-4 lg:px-6 app-clamp ">
          {title && (
            <PageHeader
              title={title}
              breadcrumbs={breadcrumbs}
              headerClassName={headerClassName}
              titleClassName={titleClassName}
            />
          )}
        </div>
      </div>
      {/* min-w-0 prevents flex children from forcing horizontal overflow */}
      <div className="space-y-6 min-w-0">{children}</div>

    </main>
  );
}


interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  'data-id'?: string;
}

export function PageSection({ children, className = '', 'data-id': dataId }: PageSectionProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 w-full min-w-0 max-w-full overflow-x-hidden overscroll-x-contain ${className}`}
      data-id={dataId}
    >
      {children}
    </div>
  );
}


interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  'data-id'?: string;
  children: React.ReactNode;
}

export function SectionHeader({
  title,
  description,
  actions,
  'data-id': dataId,
  children,
}: SectionHeaderProps) {
  return <>{children}</>;
}

interface SectionContentProps {
  children: React.ReactNode;
  className?: string;
  'data-id'?: string;
}

export function SectionContent({ children, className = '', 'data-id': dataId }: SectionContentProps) {
  return (
    <div className={`p-4 sm:p-6 min-w-0 max-w-full overflow-x-hidden overscroll-x-contain ${className}`} data-id={dataId}>
      {children}
    </div>
  );
}


interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  'data-id'?: string;
}

export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  'data-id': dataId,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
                inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md
                text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                ${className}
            `}
      data-id={dataId}
    >
      {children}
    </button>
  );
}

interface SecondaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  'data-id'?: string;
}

// export function SecondaryButton({
//   children,
//   onClick,
//   disabled = false,
//   type = 'button',
//   className = '',
//   'data-id': dataId,
// }: SecondaryButtonProps) {
//   return (
//     <button
//       type={type}
//       onClick={onClick}
//       disabled={disabled}
//       className={`
//                 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md
//                 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
//                 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors
//                 ${className}
//             `}
//       data-id={dataId}
//     >
//       {children}
//     </button>
//   );
// }
