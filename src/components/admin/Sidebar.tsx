import { useState } from "react";
import {
  LayoutDashboard,
  Lock,
  Globe,
  Smartphone,
  Monitor,
  CreditCard,
  Users,
  LogOut,
  Figma as FigmaIcon,
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

export default function Sidebar({
  activeSection,
  onSectionChange,
  onLogout,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sections = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    // { id: "pin", label: "PIN Settings", icon: Lock },  
    { id: "websites", label: "Websites", icon: Globe },
    { id: "mobileApps", label: "Mobile Apps", icon: Smartphone },
    { id: "software", label: "Software", icon: Monitor },
    { id: "digitalCards", label: "Digital Cards", icon: CreditCard },
    { id: "marketingClients", label: "Marketing Clients", icon: Users },
    { id: "figmaDesigns", label: "Figma", icon: FigmaIcon },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 shadow-2xl`}
      >
        <div className="flex flex-col h-full p-6">
          
          {/* Top */}
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <p className="text-white/60 text-sm mt-1">
                Portfolio Management
              </p>
            </div>

            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      onSectionChange(section.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                      isActive
                        ? "bg-white text-gray-900 shadow-lg font-semibold"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <Icon size={20} />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Logout */}
          <div className="mt-auto pt-6 border-t border-white/10">
            <button
              onClick={onLogout}
              className="w-full px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition flex items-center gap-3 text-red-400 font-medium"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
