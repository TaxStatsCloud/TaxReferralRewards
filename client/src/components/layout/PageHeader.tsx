import React from "react";

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, children }) => {
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 bg-white border-b">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-800">{title}</h1>
        
        {children && (
          <div className="flex space-x-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
