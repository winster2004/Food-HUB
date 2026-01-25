import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CuisinesInputProps {
  value: string[];
  onChange: (cuisines: string[]) => void;
  error?: string;
}

const CuisinesInput: React.FC<CuisinesInputProps> = ({
  value,
  onChange,
  error,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleAddCuisine = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (!value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
        setInputValue("");
      }
    }
  };

  const handleAddCuisineClick = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleRemoveCuisine = (cuisine: string) => {
    onChange(value.filter((c) => c !== cuisine));
  };

  return (
    <div>
      <Label htmlFor="cuisines">Cuisines</Label>
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            id="cuisines"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleAddCuisine}
            placeholder="e.g., Italian, Pizza, Pasta"
          />
          <Button
            type="button"
            onClick={handleAddCuisineClick}
            className="bg-orange hover:bg-hoverOrange"
            disabled={!inputValue.trim()}
          >
            Add
          </Button>
        </div>

        {/* Cuisine Tags */}
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {value.map((cuisine) => (
              <div
                key={cuisine}
                className="bg-orange text-white px-3 py-1 rounded-full flex items-center gap-2"
              >
                <span className="text-sm">{cuisine}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCuisine(cuisine)}
                  className="hover:opacity-70"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && (
          <span className="text-xs text-red-600 font-medium">{error}</span>
        )}
      </div>
    </div>
  );
};

export default CuisinesInput;
