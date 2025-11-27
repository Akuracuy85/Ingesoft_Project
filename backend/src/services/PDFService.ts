import path from 'path';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions, TableCell } from 'pdfmake/interfaces';

const fonts = {
  Roboto: {
    normal: path.join(__dirname, "../fonts/Roboto-Regular.ttf"),
    bold: path.join(__dirname, "../fonts/Roboto-Medium.ttf"),
    italics: path.join(__dirname, "../fonts/Roboto-Italic.ttf"),
    bolditalics: path.join(__dirname, "../fonts/Roboto-MediumItalic.ttf"),
  },
};
export class PDFService {

  private static instance: PDFService;
  private printer: PdfPrinter;

  private constructor() {
    this.printer = new PdfPrinter(fonts);
  }

  public static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  public generateTableReport(
    title: string,
    headers: string[],
    body: any[][],
    footerText: string,
    options: { 
        widths?: (string | number)[], 
        orientation?: 'portrait' | 'landscape'
    } = {} 
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const tableBody: TableCell[][] = [
          headers.map(header => ({ text: header, style: 'tableHeader' })),
          ...body.map(row => row.map(cell => ({
            text: cell,
            margin: [0, 5, 0, 5] 
          } as TableCell))) 
        ];
        
        const content: any[] = [];
        content.push({
            image: path.join(__dirname, "../assets/Logo_Unite.png"),
            width: 100,
            margin: [0, -10, 0, 20] 
        });
        

        content.push({ text: title, style: 'header', margin: [0, 0, 0, 20] });
        content.push({
            style: 'tableExample',
            table: {
                headerRows: 1,
                widths: options.widths || Array(headers.length).fill('*'),
                body: tableBody
            },
            layout: 'lightHorizontalLines'
        });

        content.push({ 
            text: footerText, 
            style: 'footerText', 
            margin: [0, 20, 0, 0], 
            alignment: 'center' 
        });

        const docDefinition: TDocumentDefinitions = {
          pageOrientation: options.orientation || 'portrait',
          content: content,
          styles: {
            header: {
              fontSize: 18,
              bold: true,
              margin: [0, 0, 0, 10],
              alignment: 'center'
            },
            tableExample: {
              margin: [0, 5, 0, 15]
            },
            tableHeader: {
              bold: true,
              fontSize: 11, 
              color: 'black',
              fillColor: '#eeeeee',
              alignment: 'center'
            },
            footerText: {
              fontSize: 10,
              italics: true
            }
          },
          defaultStyle: {
            fontSize: 10 
          }
        };

        const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
        const chunks: Buffer[] = [];

        pdfDoc.on('data', (chunk) => chunks.push(chunk));
        pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
        pdfDoc.on('error', (err) => reject(err));

        pdfDoc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}