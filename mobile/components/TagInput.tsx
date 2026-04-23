import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
}

export default function TagInput({ tags, setTags, placeholder = "Add tag...", label }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      setTags([...tags, trimmedValue]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <View className="bg-white/5 rounded-xl border border-white/10 px-4 py-3 mb-4">
      {label && <Text className="text-slate-400 text-xs uppercase mb-1 font-semibold">{label}</Text>}
      
      <View className="flex-row flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <View key={index} className="bg-[#3B82F6]/20 px-3 py-1.5 rounded-full border border-[#3B82F6]/30 flex-row items-center">
            <Text className="text-[#3B82F6] font-medium mr-2">{tag}</Text>
            <TouchableOpacity onPress={() => removeTag(tag)}>
              <Text className="text-[#3B82F6] font-bold">×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View className="flex-row items-center">
        <TextInput
          className="text-white text-base flex-1"
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={addTag}
          blurOnSubmit={false}
        />
        <TouchableOpacity 
          onPress={addTag}
          className="ml-2 bg-[#3B82F6]/20 px-3 py-1 rounded-lg"
        >
          <Text className="text-[#3B82F6] font-bold">Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
