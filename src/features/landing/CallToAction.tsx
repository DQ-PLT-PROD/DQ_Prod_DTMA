import React, { useEffect, useState, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { FadeInUpOnScroll, useInView } from "../../components/AnimationUtils";
import {
  Users,
  ChevronRight,
  Phone,
  CheckCircle,
  X,
  Briefcase,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { PageContainer } from "../../components/layouts/PageContainer";

// Animated shape component
const FloatingShape = ({ size, color, delay, duration, className = "" }) => {
  return (
    <div
      className={`absolute rounded-full opacity-30 animate-float ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: color,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    ></div>
  );
};

// Form input component
const FormInput = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
}) => {
  return (
    <div className="mb-4">
      <label className="block text-label-md font-medium text-on-surface mb-1">
        {label}
      </label>
      <input
        type={type}
        className="w-full px-3 py-2 border border-outline rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-surface text-on-surface placeholder:text-on-surface-variant/60"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
};

// Form select component
const FormSelect = ({ label, options, value, onChange, required = false }) => {
  return (
    <div className="mb-4">
      <label className="block text-label-md font-medium text-on-surface mb-1">
        {label}
      </label>
      <select
        className="w-full px-3 py-2 border border-outline rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-surface text-on-surface"
        value={value}
        onChange={onChange}
        required={required}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// Form textarea component
const FormTextarea = ({
  label,
  placeholder,
  value,
  onChange,
  required = false,
}) => {
  return (
    <div className="mb-4">
      <label className="block text-label-md font-medium text-on-surface mb-1">
        {label}
      </label>
      <textarea
        className="w-full px-3 py-2 border border-outline rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-surface text-on-surface placeholder:text-on-surface-variant/60"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        rows={4}
      ></textarea>
    </div>
  );
};

// Toast notification component
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div
        className={`rounded-lg shadow-lg p-4 flex items-start ${type === "success"
          ? "bg-primary-container/20 border-l-4 border-primary"
          : "bg-error-container/20 border-l-4 border-error"
          }`}
      >
        <div
          className={`flex-shrink-0 mr-3 ${type === "success" ? "text-primary" : "text-error"
            }`}
        >
          {type === "success" ? <CheckCircle size={20} /> : <X size={20} />}
        </div>
        <div className="flex-1">
          <p
            className={`text-body-sm font-medium ${type === "success" ? "text-on-surface" : "text-on-surface"
              }`}
          >
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-on-surface-variant/60 hover:text-on-surface-variant focus:outline-none"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Interactive CTA Card component
interface CTACardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  buttonColor: string;
  onClick?: () => void;
  delay?: number;
  isExpanded?: boolean;
  onExpand?: () => void;
  children?: React.ReactNode;
  isSuccess?: boolean;
}

const CTACard: React.FC<CTACardProps> = ({
  icon,
  title,
  description,
  buttonText,
  buttonColor,
  onClick = () => { },
  delay = 0,
  isExpanded = false,
  onExpand = undefined,
  children = null,
  isSuccess = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [ref, isInView] = useInView({
    threshold: 0.2,
  });
  const rippleRef = useRef<HTMLSpanElement>(null);

  const handleRippleEffect = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (rippleRef.current) {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      rippleRef.current.style.left = `${x}px`;
      rippleRef.current.style.top = `${y}px`;
      rippleRef.current.style.transform = "translate(-50%, -50%) scale(0)";
      rippleRef.current.style.opacity = "1";

      setTimeout(() => {
        if (rippleRef.current) {
          rippleRef.current.style.transform = "translate(-50%, -50%) scale(15)";
          rippleRef.current.style.opacity = "0";
        }
      }, 10);
    }
  };

  return (
    <div
      ref={ref}
      className={`bg-white rounded-xl shadow-lg transition-all duration-500 relative overflow-hidden 
        ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"} 
        ${isHovered ? "shadow-xl scale-[1.02]" : ""} 
        ${isExpanded ? "p-8 md:col-span-2 lg:col-span-1" : "p-8"}`}
      style={{
        transitionDelay: `${delay}s`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card content */}
      <div className="relative z-10">
        {!isExpanded ? (
          <div className="flex flex-col items-center text-center">
            <p className="text-on-surface-variant mb-6">{description}</p>
            <div className="flex justify-center w-full">
              <button
                onClick={(e) => {
                  handleRippleEffect(e);
                  if (onExpand) {
                    onExpand();
                  } else {
                    onClick();
                  }
                }}
                className={`relative overflow-hidden font-medium transition-all duration-300 flex items-center ${buttonColor === "blue"
                  ? "gap-2 px-5 py-2.5 h-11 rounded-full bg-[#1839AD] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
                  : buttonColor === "green"
                    ? "px-6 py-3 rounded-lg shadow-md bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
                    : "px-6 py-3 rounded-lg shadow-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                  } ${isHovered ? "shadow-lg" : ""}`}
              >
                {buttonColor === "blue" ? "Get Started" : buttonText}
                <ArrowRight
                  size={16}
                  className={`ml-1 transition-transform duration-300 ${isHovered ? "translate-x-1" : ""
                    }`}
                />
                <span
                  ref={rippleRef}
                  className="absolute rounded-full bg-white/20 pointer-events-none transition-all duration-700"
                  style={{
                    width: "10px",
                    height: "10px",
                    opacity: 0,
                  }}
                ></span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-on-surface">{title}</h3>
              <button
                onClick={onExpand}
                className="text-on-surface-variant/60 hover:text-on-surface-variant transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            {isSuccess ? (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-container rounded-full mb-4">
                  <CheckCircle size={32} className="text-primary" />
                </div>
                <h4 className="text-lg font-medium text-on-surface mb-2">
                  Thank you!
                </h4>
                <p className="text-on-surface-variant">We'll be in touch soon!</p>
              </div>
            ) : (
              children
            )}
          </>
        )}
      </div>
      {/* Background glow effect */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${isHovered ? "opacity-100" : "opacity-0"
          }`}
      >
        <div
          className={`absolute -inset-1 rounded-xl blur-xl ${buttonColor === "blue"
            ? "bg-[#f8f9fb]"
            : buttonColor === "green"
              ? "bg-emerald-600/20"
              : "bg-purple-600/20"
            }`}
        ></div>
      </div>
    </div>
  );
};

interface ToastData {
  message: string;
  type: "success" | "error" | "info";
}

const CallToAction: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [ref, isInView] = useInView({
    threshold: 0.2,
  });

  const handleSignIn = () => {
    login(); // Direct Microsoft auth
  };

  // State for expandable cards
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  // Form states
  const [partnerFormData, setPartnerFormData] = useState({
    name: "",
    email: "",
    serviceCategory: "",
    message: "",
  });
  const [contactFormData, setContactFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [partnerFormSuccess, setPartnerFormSuccess] = useState(false);
  const [contactFormSuccess, setContactFormSuccess] = useState(false);

  // Form submission states
  const [isSubmittingPartner, setIsSubmittingPartner] = useState(false);
  const [partnerSubmitError, setPartnerSubmitError] = useState<string | null>(
    null
  );
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSubmitError, setContactSubmitError] = useState<string | null>(
    null
  );

  // Service categories
  const serviceCategories = [
    {
      value: "Loans & Credit Facilities",
      label: "Loans & Credit Facilities",
    },
    {
      value: "Guarantees & Risk Sharing",
      label: "Guarantees & Risk Sharing",
    },
    {
      value: "Invoice & Receivables Financing",
      label: "Invoice & Receivables Financing",
    },
    {
      value: "Government & Procurement Finance",
      label: "Government & Procurement Finance",
    },
    {
      value: "Specialized Sector Funds",
      label: "Specialized Sector Funds",
    },
    {
      value: "Business Registration & Licensing",
      label: "Business Registration & Licensing",
    },
    {
      value: "Compliance, Legal & Regulatory Support",
      label: "Compliance, Legal & Regulatory Support",
    },
    {
      value: "Business Development, Incentives & Incubation",
      label: "Business Development, Incentives & Incubation",
    },
    {
      value: "Advisory & Transformation Services",
      label: "Advisory & Transformation Services",
    },
    {
      value: "Support Services",
      label: "Support Services",
    },
    {
      value: "Loan Management & Adjustment",
      label: "Loan Management & Adjustment",
    },
  ];

  // Handle form submissions
  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingPartner(true);
    setPartnerSubmitError(null);

    try {
      const response = await fetch(
        "https://kfrealexpressserver.vercel.app/api/v1/partner/create-partnership",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer enquiry1234",
          },
          body: JSON.stringify({
            Name: partnerFormData.name,
            Email: partnerFormData.email,
            ServiceCategory: partnerFormData.serviceCategory,
            Message: partnerFormData.message,
          }),
        }
      );

      if (response.ok) {
        setPartnerFormSuccess(true);
        setToast({
          message: "Thanks! We'll be in touch about your services soon.",
          type: "success",
        });
        // Reset form after 3 seconds
        setTimeout(() => {
          setExpandedCard(null);
          setPartnerFormSuccess(false);
          setPartnerFormData({
            name: "",
            email: "",
            serviceCategory: "",
            message: "",
          });
        }, 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Submission failed (${response.status})`
        );
      }
    } catch (error) {
      setPartnerSubmitError(
        error instanceof Error
          ? error.message
          : "Network error. Please try again."
      );
      setToast({
        message: "Failed to submit. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmittingPartner(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    setContactSubmitError(null);

    try {
      const response = await fetch(
        "https://kfrealexpressserver.vercel.app/api/v1/contact/contact-us",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer enquiry1234",
          },
          body: JSON.stringify({
            name: contactFormData.name,
            email: contactFormData.email,
            message: contactFormData.message,
          }),
        }
      );

      if (response.ok) {
        setContactFormSuccess(true);
        setToast({
          message: "Message received! We'll respond shortly.",
          type: "success",
        });
        // Reset form after 3 seconds
        setTimeout(() => {
          setExpandedCard(null);
          setContactFormSuccess(false);
          setContactFormData({
            name: "",
            email: "",
            message: "",
          });
        }, 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Submission failed (${response.status})`
        );
      }
    } catch (error) {
      setContactSubmitError(
        error instanceof Error
          ? error.message
          : "Network error. Please try again."
      );
      setToast({
        message: "Failed to send message. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmittingContact(false);
    }
  };

  // Handle card expansion
  const handleExpandCard = (cardId: string) => {
    if (expandedCard === cardId) {
      setExpandedCard(null);
    } else {
      setExpandedCard(cardId);
    }
  };

  // When URL hash points to a card, expand/scroll to it
  useEffect(() => {
    const hash = location.hash || window.location.hash;
    const scrollTo = (id: string) => {
      const el = document.getElementById(id);
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    if (hash === "#partner") {
      setExpandedCard("partner");
      scrollTo("cta-partner");
    } else if (hash === "#contact") {
      setExpandedCard("contact");
      scrollTo("cta-contact");
    } else if (hash === "#register") {
      scrollTo("cta-register");
    }
  }, [location.hash]);

  return (
    <div
      id="final-cta"
      className="w-full h-full flex flex-col justify-center py-16 relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -top-10 -left-24 h-40 w-40 rounded-full border-4 border-white/60" />
        <div className="absolute -top-16 -right-24 h-48 w-48 rounded-full border-4 border-white/60" />
      </div>
      <PageContainer className="relative">
        <div className="text-center mb-8">
          <FadeInUpOnScroll className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight text-[#030C2B]">
              Ready to Grow in the AI Working Era?
            </h2>
          </FadeInUpOnScroll>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-8 items-start">
          {/* Card 1: Register Now */}
          <div id="cta-register">
            <CTACard
              icon={<Users size={28} className="text-blue-600" />}
              title="Register Now"
              description="Create your account and start your learning journey."
              buttonText="Sign Up"
              buttonColor="blue"
              onClick={handleSignIn}
              delay={0.1}
            />
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default CallToAction;
