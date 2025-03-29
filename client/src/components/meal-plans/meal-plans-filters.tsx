import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useState } from "react";

interface MealPlansFiltersProps {
  dietTypes: string[];
  onFilterChange: (filter: string) => void;
  activeFilter: string;
}

export function MealPlansFilters({ dietTypes, onFilterChange, activeFilter }: MealPlansFiltersProps) {
  return (
    <ScrollArea className="whitespace-nowrap pb-4">
      <div className="flex items-center gap-3">
        <Button
          variant={activeFilter === "all" ? "default" : "outline"}
          className="rounded-full"
          onClick={() => onFilterChange("all")}
        >
          All Plans
        </Button>
        
        {dietTypes.map((dietType) => (
          <Button
            key={dietType}
            variant={activeFilter === dietType ? "default" : "outline"}
            className="rounded-full whitespace-nowrap"
            onClick={() => onFilterChange(dietType)}
          >
            {dietType.charAt(0).toUpperCase() + dietType.slice(1)}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
