import { useEffect, useState } from 'react';

const ICPImage = ({ assetId, altText, className, actor }) => {
  const [imageSrc, setImageSrc] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadImage = async () => {
      try {
        if (!actor || !assetId) return;
        
        const result = await actor.getAssetData(assetId);
        if ('ok' in result) {
          // Converter Blob para URL
          const blob = new Blob([result.ok]);
          const url = URL.createObjectURL(blob);
          setImageSrc(url);
        }
      } catch (e) {
        console.error('Error loading ICP image:', e);
      } finally {
        setLoading(false);
      }
    };
    
    loadImage();
  }, [assetId, actor]);
  
  if (loading) {
    return <div className={`${className} loading-placeholder`}>Loading image...</div>;
  }
  
  if (!imageSrc) {
    return <div className={`${className} error-placeholder`}>Image not found</div>;
  }
  
  return <img src={imageSrc} alt={altText} className={className} />;
};

export default ICPImage;