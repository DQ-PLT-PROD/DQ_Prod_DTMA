import React from "react";
import { Link } from "react-router-dom";

export interface ComingSoonAction {
  label: string;
  to?: string; // react-router link
  href?: string; // external or anchor link
  variant?: "primary" | "secondary";
}

export interface ComingSoonViewProps {
  title?: string;
  description?: string;
  bullets?: string[];
  primaryAction?: ComingSoonAction;
  secondaryAction?: ComingSoonAction;
  logoText?: string;
  /**
   * Use a preset to avoid Tailwind purging dynamic class names in production.
   */
  gradientPreset?: 'indigoBlueTeal' | 'purpleFuchsiaRose';
}

const ComingSoonView: React.FC<ComingSoonViewProps> = ({
  title = "Coming Soon",
  description = "We're working hard to bring you this experience. Please check back shortly.",
  bullets = [
    "Beautifully designed UI",
    "Fast, secure and reliable",
    "Built for your success",
  ],
  primaryAction = { label: "Back to Home", to: "/", variant: "secondary" },
  secondaryAction = { label: "Contact Us", href: "/#contact", variant: "primary" },
  logoText = "EJP",
  gradientPreset = 'indigoBlueTeal',
}) => {
  // Preset-based classes to ensure Tailwind includes them in production builds
  const presetClasses: Record<NonNullable<ComingSoonViewProps['gradientPreset']>, string> = {
    indigoBlueTeal: 'bg-gradient-to-br from-indigo-900 via-blue-900 to-teal-900',
    purpleFuchsiaRose: 'bg-gradient-to-br from-purple-900 via-fuchsia-900 to-rose-900',
  };
  const gradientClass = presetClasses[gradientPreset] || presetClasses.indigoBlueTeal;

  const ActionButton: React.FC<{ action: ComingSoonAction }> = ({ action }) => {
    const base = "px-5 py-3 rounded-lg font-semibold transition";
    const variantClass =
      action.variant === "primary"
        ? "bg-indigo-600 text-white hover:bg-indigo-700"
        : "bg-white text-indigo-700 hover:bg-gray-100";

    if (action.to) {
      return (
        <Link to={action.to} className={`${base} ${variantClass}`}>
          {action.label}
        </Link>
      );
    }
    if (action.href) {
      return (
        <a href={action.href} className={`${base} ${variantClass}`}>
          {action.label}
        </a>
      );
    }
    return null;
  };

  return (
    <div className={`min-h-screen ${gradientClass} flex items-center justify-center px-6`}>
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 rounded-full bg-white/10 flex items-center justify-center ring-2 ring-white/20">
            <span className="text-white text-4xl font-bold">{logoText}</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          {title}
        </h1>
        <p className="text-blue-100 text-lg md:text-xl mb-8">
          {description}
        </p>
        {bullets && bullets.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-left text-blue-50 mb-8">
            <ul className="space-y-2 list-disc list-inside">
              {bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {primaryAction && <ActionButton action={primaryAction} />}
          {secondaryAction && <ActionButton action={secondaryAction} />}
        </div>
      </div>
    </div>
  );
};

export default ComingSoonView;
