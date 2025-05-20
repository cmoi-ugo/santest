import React, { useState } from 'react';
import { ErrorMessage } from '@/components/ui/ErrorMessage/ErrorMessage';
import { MdFileUpload, MdDescription } from 'react-icons/md';
import styles from './FileDropZone.module.css';

interface FileDropZoneProps {
  onFileSelected: (file: File) => void;
  file: File | null;
  accept?: string;
  error?: string | null;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFileSelected,
  file,
  accept = '.json',
  error
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className={`${styles.dropZone} ${dragActive ? styles.active : ''} ${file ? styles.hasFile : ''} ${error ? styles.error : ''}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <input 
        type="file"
        id="fileInput"
        className={styles.fileInput}
        onChange={handleFileChange}
        accept={accept}
      />
      
      {file ? (
        <div className={styles.selectedFile}>
          {!error && (
            <>
              <MdDescription className={styles.fileIcon} />
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className={styles.dropContent}>
          <MdFileUpload className={styles.uploadIcon} />
          <div className={styles.dropInstructions}>
            <p className={styles.dropText}>
              Glissez-déposez votre fichier JSON ici
            </p>
            <span className={styles.dropOr}>ou</span>
            <label htmlFor="fileInput" className={styles.browseButton}>
              Sélectionner un fichier
            </label>
          </div>
        </div>
      )}
      
      {error && <ErrorMessage message={error} />}
    </div>
  );
};