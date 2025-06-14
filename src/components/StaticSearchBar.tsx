
import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

interface StaticSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
}

const StaticSearchBar = React.memo(({ searchTerm, onSearchChange, placeholder }: StaticSearchBarProps) => {
  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  return (
    <div className="container mx-auto px-6 mb-8 relative z-10">
      <div className="max-w-md mx-auto relative">
        <div className="relative bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-white/60">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-12 pr-4 py-3 rounded-full border-0 bg-transparent focus:ring-2 focus:ring-unigreen/20 text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>
    </div>
  );
});

StaticSearchBar.displayName = 'StaticSearchBar';

export default StaticSearchBar;
