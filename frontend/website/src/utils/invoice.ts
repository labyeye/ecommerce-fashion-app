import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function downloadRefAsPDF(ref: HTMLElement | null, filename = 'invoice.pdf') {
  if (!ref) return;
  // Use html2canvas to render
  const canvas = await html2canvas(ref, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Calculate image dimensions to fit A4 while preserving aspect
  const img = new Image();
  img.src = imgData;

  return new Promise<void>((resolve) => {
    img.onload = () => {
      const imgWidth = img.width;
      const imgHeight = img.height;

      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
      const w = imgWidth * ratio;
      const h = imgHeight * ratio;

      pdf.addImage(imgData, 'PNG', (pageWidth - w) / 2, 20, w, h);
      pdf.save(filename);
      resolve();
    };
  });
}

export function printRef(ref: HTMLElement | null) {
  if (!ref) return;
  const newWin = window.open('', '_blank', 'width=900,height=700');
  if (!newWin) {
    alert('Please allow popups to print the invoice');
    return;
  }
  const css = `
    <style>
      body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 20px; }
      .invoice-root { width: 100%; }
    </style>`;

  newWin.document.write(`<!doctype html><html><head><meta charset="utf-8"/>${css}</head><body>`);
  newWin.document.write(ref.outerHTML);
  newWin.document.write('</body></html>');
  newWin.document.close();
  newWin.focus();
  setTimeout(() => {
    newWin.print();
    // newWin.close(); // keep window open to allow user to save if they want
  }, 500);
}
