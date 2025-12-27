import jsPDF from 'jspdf';

export const generateValuationPDF = (watchData, valuation, currency, currencies) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Currency formatting helper
  const formatCurrency = (value) => {
    if (!value) return '-';
    const rate = currencies[currency]?.rate || 1;
    const symbol = currencies[currency]?.symbol || '$';
    const convertedValue = Math.round(value * rate);
    return `${symbol}${convertedValue.toLocaleString()}`;
  };

  // Colors
  const racingGreen = [0, 38, 26];
  const gold = [212, 175, 55];
  const darkGreen = [0, 26, 13];
  
  // Header background
  doc.setFillColor(...racingGreen);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Logo/Title
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('CROWNTIME AI', pageWidth / 2, 25, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text('WATCH MARKET INTELLIGENCE REPORT', pageWidth / 2, 35, { align: 'center' });
  
  // Date
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, pageWidth / 2, 45, { align: 'center' });

  // Watch Details Section
  let yPos = 65;
  
  doc.setFillColor(245, 245, 245);
  doc.rect(15, yPos - 5, pageWidth - 30, 60, 'F');
  
  doc.setTextColor(...racingGreen);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('WATCH DETAILS', 20, yPos + 5);
  
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.5);
  doc.line(20, yPos + 8, 80, yPos + 8);
  
  yPos += 18;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  
  const details = [
    ['Brand', watchData.brand || 'Not specified'],
    ['Model', watchData.model_family || 'Not specified'],
    ['Dial Color', watchData.dial_color || 'Not specified'],
    ['Bezel Type', watchData.bezel_type || 'Not specified'],
    ['Bracelet', watchData.bracelet_type || 'Not specified'],
    ['Condition', watchData.condition || 'Very Good'],
    ['Box & Papers', watchData.box_papers ? 'Yes' : 'No']
  ];
  
  details.forEach(([label, value], index) => {
    const col = index < 4 ? 0 : 1;
    const row = index < 4 ? index : index - 4;
    const xPos = col === 0 ? 25 : 110;
    const rowY = yPos + (row * 10);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text(`${label}:`, xPos, rowY);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text(value, xPos + 35, rowY);
  });

  // Valuation Section
  yPos = 140;
  
  doc.setFillColor(...racingGreen);
  doc.rect(15, yPos - 5, pageWidth - 30, 70, 'F');
  
  doc.setTextColor(...gold);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('MARKET VALUATION', 20, yPos + 5);
  
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text(`${valuation.calibration_mode} Mode | ${currencies[currency]?.name || 'US Dollars'}`, 20, yPos + 12);
  
  // Price boxes
  yPos += 25;
  const boxWidth = 55;
  const boxHeight = 35;
  const startX = 20;
  
  // Low Estimate
  doc.setFillColor(0, 50, 40);
  doc.roundedRect(startX, yPos, boxWidth, boxHeight, 3, 3, 'F');
  doc.setTextColor(100, 200, 180);
  doc.setFontSize(8);
  doc.text('LOW ESTIMATE', startX + boxWidth/2, yPos + 10, { align: 'center' });
  doc.setTextColor(150, 230, 210);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(valuation.low_estimate), startX + boxWidth/2, yPos + 25, { align: 'center' });
  
  // Fair Value (highlighted)
  doc.setFillColor(...gold);
  doc.roundedRect(startX + boxWidth + 10, yPos - 5, boxWidth + 10, boxHeight + 10, 3, 3, 'F');
  doc.setTextColor(...darkGreen);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('FAIR MARKET VALUE', startX + boxWidth + 10 + (boxWidth + 10)/2, yPos + 8, { align: 'center' });
  doc.setFontSize(20);
  doc.text(formatCurrency(valuation.fair_estimate), startX + boxWidth + 10 + (boxWidth + 10)/2, yPos + 28, { align: 'center' });
  
  // High Estimate
  doc.setFillColor(0, 50, 40);
  doc.roundedRect(startX + (boxWidth * 2) + 30, yPos, boxWidth, boxHeight, 3, 3, 'F');
  doc.setTextColor(100, 180, 100);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('HIGH ESTIMATE', startX + (boxWidth * 2) + 30 + boxWidth/2, yPos + 10, { align: 'center' });
  doc.setTextColor(150, 220, 150);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(valuation.high_estimate), startX + (boxWidth * 2) + 30 + boxWidth/2, yPos + 25, { align: 'center' });

  // Confidence indicator
  yPos = 220;
  doc.setFillColor(245, 245, 245);
  doc.rect(15, yPos, pageWidth - 30, 25, 'F');
  
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Confidence Level:', 25, yPos + 10);
  
  const confidenceColor = valuation.confidence_level === 'high' ? [0, 150, 136] : 
                          valuation.confidence_level === 'medium' ? [212, 175, 55] : [237, 137, 54];
  doc.setTextColor(...confidenceColor);
  doc.setFont('helvetica', 'bold');
  doc.text(`${valuation.confidence_level.toUpperCase()} (${valuation.confidence_percentage}%)`, 75, yPos + 10);
  
  // Progress bar
  doc.setFillColor(220, 220, 220);
  doc.roundedRect(25, yPos + 15, 160, 5, 2, 2, 'F');
  doc.setFillColor(...confidenceColor);
  doc.roundedRect(25, yPos + 15, (160 * valuation.confidence_percentage / 100), 5, 2, 2, 'F');

  // Notes Section
  if (valuation.notes && valuation.notes.length > 0) {
    yPos = 255;
    doc.setTextColor(...racingGreen);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES', 20, yPos);
    
    doc.setDrawColor(...gold);
    doc.line(20, yPos + 3, 50, yPos + 3);
    
    yPos += 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    valuation.notes.forEach((note, index) => {
      if (yPos < 270) {
        doc.text(`• ${note}`, 25, yPos + (index * 6));
      }
    });
  }

  // Footer
  const footerY = 285;
  doc.setDrawColor(200, 200, 200);
  doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);
  
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('DISCLAIMER: This is market intelligence only, not an appraisal. Values are estimates based on trade-level data.', pageWidth / 2, footerY, { align: 'center' });
  doc.text('Crowntime AI does not verify authenticity. Actual values may vary based on condition, provenance, and market dynamics.', pageWidth / 2, footerY + 4, { align: 'center' });
  
  doc.setTextColor(...gold);
  doc.text('www.crowntime.ai', pageWidth / 2, footerY + 10, { align: 'center' });

  // Save the PDF
  const filename = `Crowntime_${watchData.brand || 'Watch'}_${watchData.model_family || 'Valuation'}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename.replace(/\s+/g, '_'));
  
  return filename;
};

export default generateValuationPDF;
