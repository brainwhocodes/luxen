import type { CSSProperties, Dispatch, KeyboardEvent, MouseEvent, RefObject, SetStateAction, TouchEvent } from 'react';

import type { EditorParameter, GradientPalette, PreviewSettings, ShaderPattern } from '../../types';
import { Header, PreviewStage, ParametersPanel, ExportModal, SettingsModal, CodeModal } from '../organisms';
import { ExportProgressOverlay, NotificationToast, SetGeneratorModal } from '../organismsExtra';

type ExportType = 'code' | 'image' | 'react' | 'css-export';
type ExportModalKind = 'png' | 'video' | 'gif' | null;

interface ShaderEditorTemplateProps {
  docName: string;
  isDirty: boolean;
  aspectRatio: string;
  dropdownOpen: boolean;
  patterns: ShaderPattern[];
  selectedPattern: ShaderPattern;
  handleSelectPattern: (pattern: ShaderPattern) => void;
  setDropdownOpen: (open: boolean) => void;
  setAspectRatio: (aspect: string) => void;
  handleSave: () => void;
  handleExportPNG: () => void;
  handleExportWebM: () => void;
  handleExportGIF: () => void;
  setExportModalOpen: (open: boolean) => void;
  setExportType: (type: ExportType) => void;
  setSettingsModalOpen: (open: boolean) => void;
  handleRandomizeAll: () => void;
  setSetModalOpen: (open: boolean) => void;
  aspectMap: Record<string, number>;
  setPreview: Dispatch<SetStateAction<PreviewSettings>>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  comparePercent: number;
  setComparePercent: (percent: number) => void;
  cssVariablesStyle: CSSProperties;
  parameters: EditorParameter[];
  compileError: string | null;
  preview: PreviewSettings;
  palette: GradientPalette;
  activeStopId: string | null;
  setActiveStopId: (id: string | null) => void;
  regularParams: EditorParameter[];
  lightingParams: EditorParameter[];
  textureParams: EditorParameter[];
  handleParameterChange: (key: string, value: number | boolean) => void;
  handleRandomizePalette: () => void;
  handleAddStop: () => void;
  handleRemoveStop: (id: string) => void;
  handleUpdateStopColor: (id: string, color: string) => void;
  handleStopMouseDown: (event: MouseEvent<HTMLDivElement>, id: string) => void;
  handleStopTouchStart: (event: TouchEvent<HTMLDivElement>, id: string) => void;
  handleStopKeyDown: (event: KeyboardEvent<HTMLDivElement>, id: string) => void;
  palettePresets: GradientPalette[];
  handleApplyPalettePreset: (preset: GradientPalette) => void;
  exportModalOpen: boolean;
  exportType: ExportType;
  generatedGLSL: string;
  generatedCSS: string;
  generatedReactComponent: string;
  settingsModalOpen: boolean;
  exportModalKind: ExportModalKind;
  setExportModalKind: (kind: ExportModalKind) => void;
  modalCanvasRef: RefObject<HTMLCanvasElement | null>;
  imgRes: string;
  setImgRes: (value: string) => void;
  vidRes: string;
  setVidRes: (value: string) => void;
  vidFps: string;
  setVidFps: (value: string) => void;
  vidLen: string;
  setVidLen: (value: string) => void;
  gifW: string;
  setGifW: (value: string) => void;
  gifFps: string;
  setGifFps: (value: string) => void;
  gifDither: boolean;
  setGifDither: (value: boolean) => void;
  gifLoop: boolean;
  setGifLoop: (value: boolean) => void;
  executeExportPNG: () => void;
  executeExportWebM: () => void;
  executeExportGIF: () => void;
  setModalOpen: boolean;
  setCount: number;
  setSetCount: (value: number) => void;
  setRes: string;
  setSetRes: (value: string) => void;
  seeds: number[];
  handleDownloadSet: () => void;
  recordingVideo: boolean;
  recordingGIF: boolean;
  exportingTitle: string;
  exportingDetail: string;
  recordProgress: number;
  setRecordingVideo: (recording: boolean) => void;
  setRecordingGIF: (recording: boolean) => void;
  showToast: (message: string) => void;
  notification: string | null;
}

export function ShaderEditorTemplate({
  docName,
  isDirty,
  aspectRatio,
  dropdownOpen,
  patterns,
  selectedPattern,
  handleSelectPattern,
  setDropdownOpen,
  setAspectRatio,
  handleSave,
  handleExportPNG,
  handleExportWebM,
  handleExportGIF,
  setExportModalOpen,
  setExportType,
  setSettingsModalOpen,
  handleRandomizeAll,
  setSetModalOpen,
  aspectMap,
  setPreview,
  canvasRef,
  comparePercent,
  setComparePercent,
  cssVariablesStyle,
  parameters,
  compileError,
  preview,
  palette,
  activeStopId,
  setActiveStopId,
  regularParams,
  lightingParams,
  textureParams,
  handleParameterChange,
  handleRandomizePalette,
  handleAddStop,
  handleRemoveStop,
  handleUpdateStopColor,
  handleStopMouseDown,
  handleStopTouchStart,
  handleStopKeyDown,
  palettePresets,
  handleApplyPalettePreset,
  exportModalOpen,
  exportType,
  generatedGLSL,
  generatedCSS,
  generatedReactComponent,
  settingsModalOpen,
  exportModalKind,
  setExportModalKind,
  modalCanvasRef,
  imgRes,
  setImgRes,
  vidRes,
  setVidRes,
  vidFps,
  setVidFps,
  vidLen,
  setVidLen,
  gifW,
  setGifW,
  gifFps,
  setGifFps,
  gifDither,
  setGifDither,
  gifLoop,
  setGifLoop,
  executeExportPNG,
  executeExportWebM,
  executeExportGIF,
  setModalOpen,
  setCount,
  setSetCount,
  setRes,
  setSetRes,
  seeds,
  handleDownloadSet,
  recordingVideo,
  recordingGIF,
  exportingTitle,
  exportingDetail,
  recordProgress,
  setRecordingVideo,
  setRecordingGIF,
  showToast,
  notification
}: ShaderEditorTemplateProps) {
  return (
    <div className="editor-layout">
      {/* Top Bar Organism */}
      <Header 
        docName={docName}
        isDirty={isDirty}
        aspectRatio={aspectRatio}
        dropdownOpen={dropdownOpen}
        patterns={patterns}
        selectedPattern={selectedPattern}
        handleSelectPattern={handleSelectPattern}
        setDropdownOpen={setDropdownOpen}
        setAspectRatio={setAspectRatio}
        handleSave={handleSave}
        handleExportPNG={handleExportPNG}
        handleExportWebM={handleExportWebM}
        handleExportGIF={handleExportGIF}
        setExportModalOpen={setExportModalOpen}
        setExportType={setExportType}
        setSettingsModalOpen={setSettingsModalOpen}
        handleRandomizeAll={handleRandomizeAll}
        setSetModalOpen={setSetModalOpen}
        aspectMap={aspectMap}
        setPreview={setPreview}
      />

      {/* Main Workspace (2 Columns) */}
      <main className="workspace">
        {/* Center Panel: Live Preview Stage Organism */}
        <PreviewStage 
          selectedPattern={selectedPattern}
          canvasRef={canvasRef}
          comparePercent={comparePercent}
          setComparePercent={setComparePercent}
          aspectRatio={aspectRatio}
          cssVariablesStyle={cssVariablesStyle}
          parameters={parameters}
          compileError={compileError}
          preview={preview}
        />

        {/* Right Panel: Parameters Panel Organism */}
        <ParametersPanel 
          selectedPattern={selectedPattern}
          patterns={patterns}
          handleSelectPattern={handleSelectPattern}
          palette={palette}
          activeStopId={activeStopId}
          setActiveStopId={setActiveStopId}
          regularParams={regularParams}
          lightingParams={lightingParams}
          textureParams={textureParams}
          handleParameterChange={handleParameterChange}
          handleRandomizePalette={handleRandomizePalette}
          handleAddStop={handleAddStop}
          handleRemoveStop={handleRemoveStop}
          handleUpdateStopColor={handleUpdateStopColor}
          handleStopMouseDown={handleStopMouseDown}
          handleStopTouchStart={handleStopTouchStart}
          handleStopKeyDown={handleStopKeyDown}
          palettePresets={palettePresets}
          handleApplyPalettePreset={handleApplyPalettePreset}
        />
      </main>

      {/* MODALS */}
      {/* 1. Code Export Modal */}
      <CodeModal 
        exportModalOpen={exportModalOpen}
        setExportModalOpen={setExportModalOpen}
        exportType={exportType}
        setExportType={setExportType}
        generatedGLSL={generatedGLSL}
        generatedCSS={generatedCSS}
        generatedReactComponent={generatedReactComponent}
      />

      {/* 2. Settings Modal */}
      <SettingsModal 
        settingsModalOpen={settingsModalOpen}
        setSettingsModalOpen={setSettingsModalOpen}
        preview={preview}
        setPreview={setPreview}
      />

      {/* 3. Export Settings Modal (PNG, Video, GIF) */}
      <ExportModal 
        exportModalKind={exportModalKind}
        setExportModalKind={setExportModalKind}
        selectedPattern={selectedPattern}
        parameters={parameters}
        modalCanvasRef={modalCanvasRef}
        aspectRatio={aspectRatio}
        aspectMap={aspectMap}
        imgRes={imgRes}
        setImgRes={setImgRes}
        vidRes={vidRes}
        setVidRes={setVidRes}
        vidFps={vidFps}
        setVidFps={setVidFps}
        vidLen={vidLen}
        setVidLen={setVidLen}
        gifW={gifW}
        setGifW={setGifW}
        gifFps={gifFps}
        setGifFps={setGifFps}
        gifDither={gifDither}
        setGifDither={setGifDither}
        gifLoop={gifLoop}
        setGifLoop={setGifLoop}
        executeExportPNG={executeExportPNG}
        executeExportWebM={executeExportWebM}
        executeExportGIF={executeExportGIF}
      />

      <SetGeneratorModal
        open={setModalOpen}
        setCount={setCount}
        setSetCount={setSetCount}
        setRes={setRes}
        setSetRes={setSetRes}
        aspectRatio={aspectRatio}
        aspectMap={aspectMap}
        seeds={seeds}
        onApplySeed={(seed) => {
          handleParameterChange('seed', seed);
          setSetModalOpen(false);
          showToast(`Applied seed ${seed}`);
        }}
        onClose={() => setSetModalOpen(false)}
        onDownload={handleDownloadSet}
      />

      <ExportProgressOverlay
        visible={recordingVideo || recordingGIF}
        title={exportingTitle}
        detail={exportingDetail}
        progress={recordProgress}
        onCancel={() => {
          setRecordingVideo(false);
          setRecordingGIF(false);
          showToast("Export cancelled");
        }}
      />

      <NotificationToast message={notification} />
    </div>
  );
}
