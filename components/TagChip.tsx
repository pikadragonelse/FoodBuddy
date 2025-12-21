import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

// ========================
// Tag Chip Component
// ========================
interface TagChipProps {
  tag: string;
  isSelected: boolean;
  onPress: () => void;
}

export default function TagChip({ tag, isSelected, onPress }: TagChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`px-4 py-2.5 rounded-full mr-2 mb-2 ${
        isSelected ? 'bg-[#FF6B00] shadow-lg' : 'bg-gray-100'
      }`}
      style={
        isSelected
          ? {
              shadowColor: '#FF6B00',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 8,
            }
          : undefined
      }
    >
      <Text
        className={`text-sm ${
          isSelected ? 'text-white font-bold' : 'text-gray-600 font-medium'
        }`}
      >
        {tag}
      </Text>
    </TouchableOpacity>
  );
}
