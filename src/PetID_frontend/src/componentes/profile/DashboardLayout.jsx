
const DashboardLayout = ({ sidebar, header, children }) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex gap-4 md:gap-5 lg:gap-6 py-4 md:py-6">
      <aside className="w-60 hidden lg:flex flex-col flex-shrink-0 rounded-2xl border border-gray-200 dark:border-surface-100 bg-white/70 dark:bg-surface-75/80 backdrop-blur-xl shadow-sm overflow-hidden">
        {sidebar}
      </aside>
      <div className="flex-1 flex flex-col gap-4 md:gap-6">
        {header}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
