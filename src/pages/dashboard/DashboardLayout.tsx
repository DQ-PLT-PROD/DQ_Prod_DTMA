import {
  Grid3X3,
  CheckCircle,
  Users,
  FileText,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronDown,
  Lock,
} from "lucide-react";
import { useState } from "react";
import { redirect, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";

const DashboardLayout = ({
  children,
  onboardingComplete,
  setOnboardingComplete,
  isOpen,
  setIsOpen,
  isLoggedIn,
  setIsLoggedIn,
}: {
  children: React.ReactNode;
  onboardingComplete: boolean;
  setOnboardingComplete: (onboardingComplete: boolean) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}) => {
  const navigate = useNavigate();
  const [sidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [activeCompany, setActiveCompany] = useState("1");

  const companies = [
    {
      id: "1",
      name: "FutureTech LLC",
      role: "Owner",
      isActive: activeCompany === "1",
      badge: "Primary",
    },
    {
      id: "2",
      name: "StartupCo Inc",
      role: "Admin",
      isActive: activeCompany === "2",
      badge: "Secondary",
    },
    {
      id: "3",
      name: "Enterprise Solutions",
      role: "Member",
      isActive: activeCompany === "3",
    },
  ];
  const handleCompanyChange = (companyId: string) => {
    setActiveCompany(companyId);
    console.log("Company changed to:", companyId);
  };
  const handleAddNewEnterprise = () => {
    console.log("Add new enterprise clicked - trigger onboarding flow");
    setOnboardingComplete(false);
    navigate("/dashboard/onboarding");
    setActiveSection("onboarding");
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header toggleSidebar={() => setIsOpen(true)} sidebarOpen={isOpen} />
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <Sidebar
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onboardingComplete={onboardingComplete}
          companies={companies}
          onCompanyChange={handleCompanyChange}
          onAddNewEnterprise={handleAddNewEnterprise}
          isLoggedIn={isLoggedIn}
        />

        <div className="flex-1 flex flex-col">
          <div className={`transition-all duration-300`}>
            <div className="min-h-screen">{children}</div>
          </div>
          <Footer isLoggedIn={isLoggedIn} />
        </div>
      </div>
    </div>
  );
};
export default DashboardLayout;
