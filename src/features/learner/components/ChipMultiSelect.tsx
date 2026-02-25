import React from "react";

interface ChipMultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  maxSelections?: number;
}

const ChipMultiSelect: React.FC<ChipMultiSelectProps> = ({
  options,
  selected,
  onChange,
  maxSelections,
}) => {
  const handleToggle = (value: string) => {
    const exists = selected.includes(value);
    if (exists) {
      onChange(selected.filter((item) => item !== value));
      return;
    }

    if (maxSelections && selected.length >= maxSelections) {
      return;
    }

    onChange([...selected, value]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => handleToggle(option)}
            className={`rounded-full border px-3 py-2 text-sm transition ${
              isSelected
                ? "border-[#1839AD] bg-[#1839AD]/10 text-[#1839AD]"
                : "border-gray-200 text-gray-600 hover:border-[#1839AD]/40"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
};

export default ChipMultiSelect;
