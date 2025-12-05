import React from "react";
import { ArrowRight } from "lucide-react";
import { FadeInUpOnScroll } from "./AnimationUtils";
import {
<<<<<<< HEAD
  BRAND_GRADIENT,
  BRAND_PRIMARY,
  BRAND_BACKDROP_BLUR,
} from "../constants/branding";

const CallToAction: React.FC = () => {
=======
  Users,
  ChevronRight,
  Phone,
  CheckCircle,
  X,
  Briefcase,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { FadeInUpOnScroll, useInView } from "./AnimationUtils";

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
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
          ? "bg-green-50 border-l-4 border-green-500"
          : "bg-red-50 border-l-4 border-red-500"
          }`}
      >
        <div
          className={`flex-shrink-0 mr-3 ${type === "success" ? "text-green-500" : "text-red-500"
            }`}
        >
          {type === "success" ? <CheckCircle size={20} /> : <X size={20} />}
        </div>
        <div className="flex-1">
          <p
            className={`text-sm font-medium ${type === "success" ? "text-green-800" : "text-red-800"
              }`}
          >
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-500 focus:outline-none"
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
          <>
            <div
              className={`${buttonColor === "blue"
                ? "bg-blue-100"
                : buttonColor === "green"
                  ? "bg-emerald-100"
                  : "bg-purple-100"
                } p-4 rounded-full inline-block mb-6 transition-transform duration-500 ${isHovered ? "scale-110" : ""
                }`}
            >
              {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 mb-6">{description}</p>
            <div className="flex justify-center">
              <button
                onClick={(e) => {
                  handleRippleEffect(e);
                  if (onExpand) {
                    onExpand();
                  } else {
                    onClick();
                  }
                }}
                className={`relative overflow-hidden px-6 py-3 font-medium rounded-lg shadow-md transition-all duration-300 flex items-center ${buttonColor === "blue"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                  : buttonColor === "green"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                  } ${isHovered ? "shadow-lg" : ""}`}
              >
                {buttonText}
                <ChevronRight
                  size={16}
                  className={`ml-2 transition-transform duration-300 ${isHovered ? "translate-x-1" : ""
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
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <button
                onClick={onExpand}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            {isSuccess ? (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Thank you!
                </h4>
                <p className="text-gray-600">We'll be in touch soon!</p>
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
            ? "bg-blue-600/20"
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
  const [ref, isInView] = useInView({
    threshold: 0.2,
  });

  const handleSignIn = () => {
    navigate("/coming-soon");
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

>>>>>>> develop
  return (
    <section
      id="final-cta"
      className="relative overflow-hidden py-16 md:py-20 bg-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -top-10 -left-24 h-40 w-40 rounded-full border-4 border-white/60" />
        <div className="absolute -top-16 -right-24 h-48 w-48 rounded-full border-4 border-white/60" />
      </div>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 text-[#030C2B] flex flex-col items-center">
        <FadeInUpOnScroll className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            Ready to Grow in the AI Working Era?
          </h2>
          <p className="text-base md:text-lg text-[#030C2B]/80">
            Join DTMA to learn practical, future-ready skills.
          </p>
        </FadeInUpOnScroll>

        <FadeInUpOnScroll delay={0.2}>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl hover:opacity-90"
              style={{ backgroundColor: BRAND_PRIMARY }}
            >
<<<<<<< HEAD
              Get Started
              <ArrowRight size={16} className="ml-2" />
            </a>
          </div>
        </FadeInUpOnScroll>
=======
              <form onSubmit={handlePartnerSubmit} className="mt-2">
                {partnerSubmitError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{partnerSubmitError}</p>
                  </div>
                )}
                <FormInput
                  label="Name"
                  placeholder="Your full name"
                  value={partnerFormData.name}
                  onChange={(e) =>
                    setPartnerFormData({
                      ...partnerFormData,
                      name: e.target.value,
                    })
                  }
                  required
                />
                <FormInput
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  value={partnerFormData.email}
                  onChange={(e) =>
                    setPartnerFormData({
                      ...partnerFormData,
                      email: e.target.value,
                    })
                  }
                  required
                />
                <FormSelect
                  label="Service Category"
                  options={serviceCategories}
                  value={partnerFormData.serviceCategory}
                  onChange={(e) =>
                    setPartnerFormData({
                      ...partnerFormData,
                      serviceCategory: e.target.value,
                    })
                  }
                  required
                />
                <FormTextarea
                  label="Message"
                  placeholder="Tell us about your services..."
                  value={partnerFormData.message}
                  onChange={(e) =>
                    setPartnerFormData({
                      ...partnerFormData,
                      message: e.target.value,
                    })
                  }
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmittingPartner}
                  className={`w-full px-6 py-3 mt-2 font-medium rounded-lg shadow-md bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center relative overflow-hidden ${isSubmittingPartner ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                >
                  {isSubmittingPartner ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <ChevronRight size={16} className="ml-2" />
                    </>
                  )}
                </button>
              </form>
            </CTACard>
          </div>

          {/* Card 3: Contact Us */}
          <div id="cta-contact" className="scroll-mt-20">
            <CTACard
              icon={<Phone size={28} className="text-purple-600" />}
              title="Contact Us"
              description="Have questions or need assistance? Our team is ready to help you navigate your business journey."
              buttonText="Get in Touch"
              buttonColor="purple"
              isExpanded={expandedCard === "contact"}
              onExpand={() => handleExpandCard("contact")}
              delay={0.7}
              isSuccess={contactFormSuccess}
            >
              <form onSubmit={handleContactSubmit} className="mt-2">
                {contactSubmitError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{contactSubmitError}</p>
                  </div>
                )}
                <FormInput
                  label="Name"
                  placeholder="Your full name"
                  value={contactFormData.name}
                  onChange={(e) =>
                    setContactFormData({
                      ...contactFormData,
                      name: e.target.value,
                    })
                  }
                  required
                />
                <FormInput
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  value={contactFormData.email}
                  onChange={(e) =>
                    setContactFormData({
                      ...contactFormData,
                      email: e.target.value,
                    })
                  }
                  required
                />
                <FormTextarea
                  label="Message"
                  placeholder="How can we help you?"
                  value={contactFormData.message}
                  onChange={(e) =>
                    setContactFormData({
                      ...contactFormData,
                      message: e.target.value,
                    })
                  }
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  className={`w-full px-6 py-3 mt-2 font-medium rounded-lg shadow-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center ${isSubmittingContact ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                >
                  {isSubmittingContact ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <ChevronRight size={16} className="ml-2" />
                    </>
                  )}
                </button>
              </form>
            </CTACard>
          </div>
        </div>
>>>>>>> develop
      </div>
    </section>
  );
};

export default CallToAction;
