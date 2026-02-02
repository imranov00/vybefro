import { useState } from 'react';

export const usePhotoIndex = () => {
  const [photoIndexes, setPhotoIndexes] = useState<Record<number, number>>({});

  const setPhotoIndex = (userId: number, index: number) => {
    setPhotoIndexes(prev => ({
      ...prev,
      [userId]: index
    }));
  };

  return {
    photoIndexes,
    setPhotoIndex
  };
};

// Default export
export default usePhotoIndex; 