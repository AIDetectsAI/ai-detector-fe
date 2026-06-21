import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type DragEvent,
} from 'react';
import { analyzeImage, type AnalysisResult } from '../lib/api';
import { useTranslation } from 'react-i18next';
import '../locales/config';

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export default function ModelUpload() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [result]);

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const data = await analyzeImage(file);
      setResult({
        ...data,
        certainty: data.certainty * 100,
      });
    } catch (err: any) {
      setError(err.message || t('analysis-failed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      file &&
      !result &&
      !loading &&
      !error &&
      localStorage.getItem('autoAnalyze') === 'true'
    ) {
      handleAnalyze();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const handleFile = useCallback((f: File) => {
    if (!f.type || !f.type.startsWith('image/')) {
      setError(t('please-select-an-image-file'));
      return;
    }

    if (f.size > MAX_FILE_SIZE_BYTES) {
      setError(t('file-too-large-maximum-allowed-size-is-50mb'));
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError('');
  }, []);

  const handleDrag = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files?.[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile],
  );

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const getResultColor = (chance: number) => {
    if (chance >= 70) return '#ef4444';
    if (chance >= 40) return '#f59e0b';
    return '#22c55e';
  };

  const getResultLabel = (chance: number) => {
    if (chance >= 70) return t('likely-ai-generated');
    if (chance >= 40) return t('uncertain');
    return t('likely-real');
  };

  return (
    <div className='model-upload'>
      <div className='upload-header'>
        <h1>{t('ai-image-detection')}</h1>
        <p>{t('upload-an-image-to-analyze-whether-it-was-generated-by-ai')}</p>
      </div>

      <div className='upload-content'>
        {!preview ? (
          <div
            className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type='file'
              onChange={(e) =>
                e.target.files?.[0] && handleFile(e.target.files[0])
              }
              style={{ display: 'none' }}
            />
            <svg
              width='48'
              height='48'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='upload-icon'
            >
              <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
              <polyline points='17 8 12 3 7 8' />
              <line x1='12' y1='3' x2='12' y2='15' />
            </svg>
            <p className="upload-text">{t('drag-and-drop-an-image-here')}</p>
            <p className="upload-subtext">{t('or-click-to-browse-files')}</p>
            <p className="upload-formats">{t('supports-any-image-file')}</p>
          </div>
        ) : (
          <div className='preview-container'>
            <img src={preview} alt={t('preview')} className='preview-image' />
            <div className='preview-actions'>
              <button onClick={handleReset} className='btn-secondary'>
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <line x1='18' y1='6' x2='6' y2='18' />
                  <line x1='6' y1='6' x2='18' y2='18' />
                </svg>
                {t('remove')} </button>
              <button
                onClick={handleAnalyze}
                className='btn-primary'
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className='spinner' />
                    {t('analyzing')}
                  </>
                ) : (
                  <>
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <circle cx='11' cy='11' r='8' />
                      <path d='m21 21-4.3-4.3' />
                    </svg>
                    {t('analyze-image')} </>
                )}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className='upload-error'>
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <circle cx='12' cy='12' r='10' />
              <line x1='15' y1='9' x2='9' y2='15' />
              <line x1='9' y1='9' x2='15' y2='15' />
            </svg>
            {error}
          </div>
        )}

        {result && (
          <div className='result-card' ref={resultRef}>
            <div className='result-header'>
              <h2>{t('analysis-result')}</h2>
              <span
                className='result-badge'
                style={{ backgroundColor: getResultColor(result.certainty) }}
              >
                {getResultLabel(result.certainty)}
              </span>
            </div>

            <div className='result-gauge'>
              <div className='gauge-circle'>
                <svg viewBox='0 0 120 120' className='gauge-svg'>
                  <circle
                    cx='60'
                    cy='60'
                    r='50'
                    fill='none'
                    stroke='#e5e7eb'
                    strokeWidth='10'
                  />
                  <circle
                    cx='60'
                    cy='60'
                    r='50'
                    fill='none'
                    stroke={getResultColor(result.certainty)}
                    strokeWidth='10'
                    strokeDasharray={`${result.certainty * 3.14} ${314 - result.certainty * 3.14}`}
                    strokeDashoffset='78.5'
                    strokeLinecap='round'
                    className='gauge-fill'
                  />
                </svg>
                <div className='gauge-value'>
                  <span className='gauge-number'>
                    {result.certainty.toFixed(1)}
                  </span>
                  <span className='gauge-percent'>%</span>
                </div>
              </div>
              <p className='gauge-label'>{t('ai-probability')}</p>
            </div>

            <div className='result-details'>
              <div className='result-detail'>
                <span className='detail-label'>{t('model')}</span>
                <span className='detail-value'>{result.modelUsed}</span>
              </div>
              <div className='result-detail'>
                <span className='detail-label'>{t('processing-time')}</span>
                <span className='detail-value'>
                  {result.processingTimeMs}ms
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
