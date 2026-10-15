import React, { useState } from 'react';
import { TelemetryHeader } from './components/TelemetryHeader';
import { SplitEditor } from './components/Editor/SplitEditor';
import { AIPilotSidebar } from './components/Sidebar/AIPilotSidebar';
import { StudentCampusHub } from './components/Social/StudentCampusHub';
import { PreviewPane } from './components/Editor/PreviewPane';
import { CommandPalette } from './components/CommandPalette';
import { PublishModal } from './components/Modals/PublishModal';
import { IeeeExportModal } from './components/Modals/IeeeExportModal';
import { PipelineModal } from './components/Modals/PipelineModal';
import { CiteModal } from './components/Modals/CiteModal';
import { 
  mockArticles, 
  mockStudentIdeas, 
  mockCurrentUser, 
  mockCollaborators 
} from './data/mockData';
import { Article, BranchType, ViewMode, StudentIdeaPost } from './types';

export const App: React.FC = () => {
  // State
  const [currentArticle, setCurrentArticle] = useState<Article>(mockArticles[0]);
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [studentIdeas, setStudentIdeas] = useState<StudentIdeaPost[]>(mockStudentIdeas);

  // Markdown content state for the authoring pane
  const [markdownContent, setMarkdownContent] = useState<string>(`# High-Efficiency Gallium Nitride (GaN) Inverters for 400V Grid-Tied Solar Microgrids

**Author:** Evelyn Chen (@echen_power) • MIT Power Electronics Lab
**Standards:** IEEE 1547-2018 §6.4.1 | IEC 61508 SIL-3
**Target:** 2.5 kW Nominal • 400V DC Bus • 100 kHz - 250 kHz Carrier Frequency

---

## 1. Introduction: Escaping the Silicon Barrier
Power conversion density in solar microgrids has historically been choked by the reverse recovery charge (Q_rr) and output capacitance (C_oss) of Silicon Superjunction MOSFETs. When switching at frequencies above 40 kHz, dynamic switching losses dominate over conduction losses, demanding bulky toroidal inductors and forced-air cooling heatsinks.

GaN high-electron-mobility transistors (HEMTs) on Silicon substrates exhibit zero reverse recovery (Q_rr = 0) and low gate charge (Q_g < 6 nC). This permits stepping up the pulse-width modulation (PWM) carrier frequency from traditional 20 kHz to **100 kHz - 250 kHz**, drastically slashing magnetic core volume by **68%**.

---

## 2. Interactive Power Stage Schematic
<CircuitSchematicWidget title="H-Bridge GaN Power Stage with LC Filter Topology" />

Click the active probe nodes on the hardware schematic above to inspect operating voltages, RMS currents, and thermal junction temperatures measured on our 400V test bench.

---

## 3. Real-Time Oscilloscope & Signal Telemetry
<OscilloscopeWidget frequency={100} voltage={400} />

- **CH1 (Cyan):** Switch-node PWM voltage (100 kHz, 400V pk-to-pk)
- **CH2 (Amber):** Filtered 60Hz Sinusoidal Grid Output (120V RMS, THD < 1.5%)
- **CH3 (Emerald):** Triangular inductor ripple current (12.5A peak)

---

## 4. Switching Loss Mathematical Formulation
<LatexStandardsBlock equation="eq-p-sw" standard="std-ieee1547" />

The dynamic switching loss is governed by:
P_sw = f_sw * V_dc * I_pk * ((t_r + t_f)/2) + f_sw * C_oss * V_dc^2

Dimensional analysis proves LHS [W] is dimensionally homogeneous with RHS [Hz]·[V]·[A]·[s] = [W].

---

## 5. DSP Firmware Control Loop & FPGA Bitstream
<HardwareSandbox />

Execute the embedded proportional-resonant controller or synthesize the Space-Vector PWM RTL bitstream directly inside the sandbox.`);

  // Modals & Drawers
  const [isAIPilotOpen, setIsAIPilotOpen] = useState<boolean>(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const [isIeeeModalOpen, setIsIeeeModalOpen] = useState<boolean>(false);
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState<boolean>(false);
  const [isCiteModalOpen, setIsCiteModalOpen] = useState<boolean>(false);
  const [citeParams, setCiteParams] = useState<{ title?: string; author?: string }>({});

  // Handlers
  const handleUpdateTitle = (newTitle: string) => {
    setCurrentArticle((prev) => ({
      ...prev,
      title: newTitle,
    }));
  };

  const handleUpdateContent = (newContent: string) => {
    setMarkdownContent(newContent);
  };

  const handleInsertWidget = (type: 'oscilloscope' | 'hardware-sandbox' | 'circuit-schematic' | 'latex-callout' | 'standards-callout') => {
    let tag = '';
    if (type === 'oscilloscope') {
      tag = '\n\n<OscilloscopeWidget frequency={100} voltage={400} />\n';
    } else if (type === 'hardware-sandbox') {
      tag = '\n\n<HardwareSandbox />\n';
    } else if (type === 'circuit-schematic') {
      tag = '\n\n<CircuitSchematicWidget title="H-Bridge GaN Power Stage with LC Filter Topology" />\n';
    } else if (type === 'latex-callout') {
      tag = '\n\n<LatexStandardsBlock equation="eq-p-sw" />\n';
    } else if (type === 'standards-callout') {
      tag = '\n\n<StandardsCallout code="IEEE 1547-2018" />\n';
    }

    setMarkdownContent((prev) => prev + tag);
  };

  const handleSwitchBranch = (branch: BranchType) => {
    setCurrentArticle((prev) => ({
      ...prev,
      branch,
    }));
  };

  const handleSelectArticle = (articleId: string) => {
    const found = mockArticles.find((a) => a.id === articleId);
    if (found) {
      setCurrentArticle(found);
    }
  };

  const handleAddStudentIdea = (newIdea: StudentIdeaPost) => {
    setStudentIdeas((prev) => [newIdea, ...prev]);
  };

  const handleOpenCiteModal = (title?: string, author?: string) => {
    setCiteParams({ title, author });
    setIsCiteModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Telemetry Header */}
      <TelemetryHeader
        currentArticle={currentArticle}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenPipelineModal={() => setIsPipelineModalOpen(true)}
        onOpenPublishModal={() => setIsPublishModalOpen(true)}
        onSwitchBranch={handleSwitchBranch}
        currentUser={mockCurrentUser}
        collaborators={mockCollaborators}
      />

      {/* Main View Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* VIEW 1: Split-Pane Technical IDE & MDX Editor */}
        {viewMode === 'editor' && (
          <SplitEditor
            article={currentArticle}
            onUpdateTitle={handleUpdateTitle}
            onUpdateContent={handleUpdateContent}
            markdownContent={markdownContent}
            onInsertWidget={handleInsertWidget}
            onOpenCiteModal={() => handleOpenCiteModal()}
            onOpenIeeeModal={() => setIsIeeeModalOpen(true)}
          />
        )}

        {/* VIEW 2: Student Campus Social Idea Network */}
        {viewMode === 'campus' && (
          <StudentCampusHub
            currentUser={mockCurrentUser}
            ideas={studentIdeas}
            onAddIdea={handleAddStudentIdea}
            onOpenCiteModal={handleOpenCiteModal}
            onOpenStudioWithTopic={(topic) => {
              handleUpdateTitle(topic);
              setViewMode('editor');
            }}
          />
        )}

        {/* VIEW 3: Dedicated Reader Mode */}
        {viewMode === 'preview' && (
          <div className="flex-1 h-[calc(100vh-56px)] overflow-hidden">
            <PreviewPane
              article={currentArticle}
              onOpenCiteModal={() => handleOpenCiteModal()}
              onOpenIeeeModal={() => setIsIeeeModalOpen(true)}
            />
          </div>
        )}

        {/* AI Co-Pilot & Automated Production Sidebar */}
        <AIPilotSidebar
          isOpen={isAIPilotOpen}
          onToggle={() => setIsAIPilotOpen(!isAIPilotOpen)}
          article={currentArticle}
          onOpenIeeeModal={() => setIsIeeeModalOpen(true)}
        />
      </div>

      {/* Global Modals */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectViewMode={setViewMode}
        onSwitchBranch={handleSwitchBranch}
        onInsertWidget={handleInsertWidget}
        onOpenIeeeModal={() => setIsIeeeModalOpen(true)}
        onOpenCiteModal={() => handleOpenCiteModal()}
        onSelectArticle={handleSelectArticle}
      />

      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        article={currentArticle}
      />

      <IeeeExportModal
        isOpen={isIeeeModalOpen}
        onClose={() => setIsIeeeModalOpen(false)}
        article={currentArticle}
      />

      <PipelineModal
        isOpen={isPipelineModalOpen}
        onClose={() => setIsPipelineModalOpen(false)}
        pipeline={currentArticle.pipelineStatus}
      />

      <CiteModal
        isOpen={isCiteModalOpen}
        onClose={() => setIsCiteModalOpen(false)}
        article={currentArticle}
        customTitle={citeParams.title}
        customAuthor={citeParams.author}
      />
    </div>
  );
};

export default App;
