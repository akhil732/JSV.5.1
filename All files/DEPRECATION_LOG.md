# Deprecation Log — V4.1 Consolidation

## Removed Files (Date: Aug 4, 2026)
- src/pages/MarriageMatchPage.tsx — Duplicate of MarriageMatch.tsx
- src/pages/AdvancedAIPage.tsx — Superseded by AIConsultationPage
- src/lib/engines/QueryConsultationEngine.ts — Experimental KP query system
- src/components/KP/KPAnalysisPage.tsx — KP analysis system
- src/components/KP/KPQueryView.tsx — KP query view
- src/components/KP/QueryVerdictPanel.tsx — Query verdict panel
- src/components/KP/QueryIntentDebugger.tsx — Query intent debugger
- src/components/KP/RulingPlanetsWidget.tsx — Ruling planets widget
- src/components/KP/CuspTable.tsx — Cusp table
- src/components/KP/BhavasReferenceTable.tsx — Bhavas reference table
- src/components/KP/VimshottariDashaTab.tsx — Vimshottari dasha tab

## Reason
Production consolidation. Experimental features deferred to V4.2+.

## Archive Location
See `/archive/kp-experimental/` for archived code.
