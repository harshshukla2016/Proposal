
import React, { useState, useEffect } from 'react';
import { MemoryUploadData } from '../types';

interface MemoryUploadProps {
  index: number;
  memory: MemoryUploadData;
  onChange: (index: number, updatedMemory: MemoryUploadData) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

const MemoryUpload: React.FC<MemoryUploadProps> = ({ index, memory, onChange, onRemove, canRemove }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(memory.imageUrl || null);

  useEffect(() => {
    if (memory.imageFile) {
      const url = URL.createObjectURL(memory.imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (memory.imageUrl) {
      setPreviewUrl(memory.imageUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [memory.imageFile, memory.imageUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log(`[MemoryUpload] Selected file for index ${index}:`, file.name);
      onChange(index, { ...memory, imageFile: file });
    }
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(index, { ...memory, caption: e.target.value });
  };

  return (
    <div className="bg-purple-800 p-4 rounded-lg shadow-inner border border-purple-700 relative">
      <h3 className="text-xl font-semibold text-pink-300 mb-3">Memory Crystal {index + 1}</h3>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-purple-200 mb-1">Image (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-purple-50
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-pink-500 file:text-white
                      hover:file:bg-pink-600 transition-colors duration-200"
          />
          {previewUrl && (
            <img src={previewUrl} alt="Memory Preview" className="mt-3 max-h-48 w-auto object-cover rounded-md shadow-md border border-purple-600" />
          )}
        </div>
        <div className="flex-1">
          <label htmlFor={`caption-${index}`} className="block text-sm font-medium text-purple-200 mb-1">
            Caption <span className="text-red-400">*</span>
          </label>
          <textarea
            id={`caption-${index}`}
            value={memory.caption}
            onChange={handleCaptionChange}
            placeholder="Describe this cherished memory..."
            rows={4}
            className="w-full p-2 bg-purple-700 border border-purple-600 rounded-md text-purple-50 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
          ></textarea>
        </div>
      </div>
      {canRemove && (
        <button
          onClick={() => onRemove(index)}
          className="absolute top-2 right-2 text-red-400 hover:text-red-500 p-1 rounded-full bg-purple-900 transition-colors duration-200"
          title="Remove memory"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default MemoryUpload;
