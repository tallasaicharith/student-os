import { Sidebar, MobileSidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { CommandPalette } from "@/components/command/command-palette";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <MobileSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
