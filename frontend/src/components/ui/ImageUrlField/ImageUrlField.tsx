import { useTranslation } from '@/hooks/useTranslation';
import { useState, useEffect } from 'react';
import { FormField } from '@/components/ui/FormField/FormField';
import styles from './ImageUrlField.module.css';

interface ImageUrlFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  maxLength?: number;
  previewMaxHeight?: number;
  showPreview?: boolean;
  onValidationChange?: (isValid: boolean, error?: string) => void;
}

const isValidUrl = (urlString: string): boolean => {
  if (!urlString.trim()) return true;
  
  try {
    const url = new URL(urlString.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const cleanUrl = (urlString: string): string | undefined => {
  const trimmed = urlString.trim();
  if (!trimmed) return '';
  
  try {
    const url = new URL(trimmed);
    return url.toString();
  } catch {
    return trimmed;
  }
};

export const ImageUrlField: React.FC<ImageUrlFieldProps> = ({
  value,
  onChange,
  placeholder,
  label,
  maxLength = 2000,
  previewMaxHeight = 200,
  showPreview = true,
  onValidationChange
}) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const defaultPlaceholder = placeholder || t('ui.imageUrl.placeholder');

  const validateUrl = (url: string) => {
    let validationError = '';
    let isValid = true;

    if (url.length > maxLength) {
      validationError = t('ui.imageUrl.urlTooLong', { maxLength });
    } else if (url.trim() && !isValidUrl(url)) {
      validationError = t('ui.imageUrl.invalidUrl');
    }

    setError(validationError);
    onValidationChange?.(isValid, validationError);
    return isValid;
  };

  useEffect(() => {
    validateUrl(value);
  }, [value, maxLength]);

  const handleChange = (newValue: string) => {
    onChange(newValue);
    setImageLoaded(false);
    validateUrl(newValue);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setError('');
  };

  const handleImageError = () => {
    setImageLoaded(false);
    const errorMsg = t('ui.imageUrl.imageLoadError');
    setError(errorMsg);
    onValidationChange?.(false, errorMsg);
  };

  const shouldShowPreview = showPreview && 
                           value.trim() && 
                           !error && 
                           isValidUrl(value);

  return (
    <div className={styles.imageUrlField}>
      {label && <label className={styles.label}>{label}</label>}
      
      <FormField>
        <input
          type="url"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={defaultPlaceholder}
          maxLength={maxLength}
          className={error ? styles.inputError : ''}
        />
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
      </FormField>

      {shouldShowPreview && (
        <div className={styles.imagePreview}>
          <img 
            src={value} 
            alt={t('ui.imageUrl.imagePreview')}
            className={styles.previewImage}
            style={{ maxHeight: `${previewMaxHeight}px` }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          {!imageLoaded && (
            <div className={styles.loadingPlaceholder}>
              {t('ui.fileDropZone.loadingImage')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const useImageUrlField = (initialValue: string = '') => {
  const [value, setValue] = useState(initialValue);
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string>('');

  const handleValidationChange = (valid: boolean, validationError?: string) => {
    setIsValid(valid);
    setError(validationError || '');
  };

  const getCleanUrl = () => cleanUrl(value);

  return {
    value,
    setValue,
    isValid,
    error,
    getCleanUrl,
    handleValidationChange
  };
};

export { isValidUrl, cleanUrl };