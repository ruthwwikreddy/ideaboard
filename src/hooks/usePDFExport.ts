import { useState } from "react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

interface BuildPhase {
  phase: number;
  title: string;
  features: string[];
  prompt: string;
}

interface BuildPlan {
  summary: string;
  features: string[];
  phases: BuildPhase[];
}

interface Research {
  problem: string;
  audience: string | any;
  competitors: Array<string | any>;
  marketGaps: string[];
  monetization: Array<string | any>;
  demandProbability: number;
}

interface ExportData {
  idea: string;
  research?: Research | null;
  buildPlan?: BuildPlan | null;
  platform?: string;
}

export const usePDFExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async (data: ExportData) => {
    setIsExporting(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let yPos = margin;

      // Helper function to add text with word wrap
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 7) => {
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + lines.length * lineHeight;
      };

      // Helper to check and add new page
      const checkNewPage = (requiredSpace: number) => {
        if (yPos + requiredSpace > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          yPos = margin;
        }
      };

      // Title
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text("IdeaBoard Build Plan", margin, yPos);
      yPos += 15;

      // Subtitle - Idea
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      yPos = addWrappedText(data.idea, margin, yPos, contentWidth);
      yPos += 10;

      // Platform badge
      if (data.platform) {
        doc.setFillColor(230, 230, 250);
        doc.roundedRect(margin, yPos - 5, 60, 10, 2, 2, "F");
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 120);
        doc.text(`Platform: ${data.platform}`, margin + 5, yPos + 2);
        yPos += 15;
      }

      // Divider
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 15;

      // Research Section
      if (data.research) {
        checkNewPage(60);
        
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        doc.text("Market Research", margin, yPos);
        yPos += 10;

        // Problem
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(60, 60, 60);
        doc.text("Problem Statement:", margin, yPos);
        yPos += 6;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        yPos = addWrappedText(data.research.problem || "N/A", margin, yPos, contentWidth);
        yPos += 8;

        // Audience
        checkNewPage(30);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(60, 60, 60);
        doc.text("Target Audience:", margin, yPos);
        yPos += 6;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        const audience = typeof data.research.audience === 'string' 
          ? data.research.audience 
          : JSON.stringify(data.research.audience);
        yPos = addWrappedText(audience || "N/A", margin, yPos, contentWidth);
        yPos += 8;

        // Demand Probability
        checkNewPage(20);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(60, 60, 60);
        doc.text(`Demand Probability: ${data.research.demandProbability || 0}%`, margin, yPos);
        yPos += 15;

        // Market Gaps
        if (data.research.marketGaps && data.research.marketGaps.length > 0) {
          checkNewPage(40);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(60, 60, 60);
          doc.text("Market Gaps:", margin, yPos);
          yPos += 6;
          doc.setFont("helvetica", "normal");
          doc.setTextColor(80, 80, 80);
          data.research.marketGaps.forEach((gap) => {
            checkNewPage(10);
            yPos = addWrappedText(`• ${gap}`, margin + 5, yPos, contentWidth - 5);
          });
          yPos += 8;
        }

        // Divider
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 15;
      }

      // Build Plan Section
      if (data.buildPlan) {
        checkNewPage(60);
        
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        doc.text("Build Plan", margin, yPos);
        yPos += 10;

        // Summary
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        yPos = addWrappedText(data.buildPlan.summary, margin, yPos, contentWidth);
        yPos += 10;

        // Core Features
        if (data.buildPlan.features && data.buildPlan.features.length > 0) {
          checkNewPage(30);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(60, 60, 60);
          doc.text("Core Features:", margin, yPos);
          yPos += 6;
          doc.setFont("helvetica", "normal");
          doc.setTextColor(80, 80, 80);
          data.buildPlan.features.forEach((feature) => {
            checkNewPage(10);
            yPos = addWrappedText(`✓ ${feature}`, margin + 5, yPos, contentWidth - 5);
          });
          yPos += 10;
        }

        // Phases
        data.buildPlan.phases.forEach((phase, index) => {
          checkNewPage(80);
          
          // Phase header
          doc.setFillColor(245, 245, 250);
          doc.roundedRect(margin, yPos - 3, contentWidth, 12, 2, 2, "F");
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(50, 50, 80);
          doc.text(`Phase ${phase.phase + 1}: ${phase.title}`, margin + 5, yPos + 5);
          yPos += 15;

          // Phase features
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(80, 80, 80);
          phase.features.forEach((feature) => {
            checkNewPage(8);
            yPos = addWrappedText(`• ${feature}`, margin + 5, yPos, contentWidth - 10, 6);
          });
          yPos += 5;

          // Phase prompt
          checkNewPage(40);
          doc.setFillColor(250, 250, 252);
          const promptLines = doc.splitTextToSize(phase.prompt, contentWidth - 20);
          const promptHeight = promptLines.length * 5 + 10;
          doc.roundedRect(margin, yPos, contentWidth, promptHeight, 2, 2, "F");
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text(promptLines, margin + 10, yPos + 8);
          yPos += promptHeight + 10;
        });
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Generated by IdeaBoard • Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      // Save
      const fileName = `ideaboard-${data.platform || "build-plan"}-${Date.now()}.pdf`;
      doc.save(fileName);
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return { exportToPDF, isExporting };
};
