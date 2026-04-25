import PDFDocument from 'pdfkit';
import { Response } from 'express';
import db from '../models';

export const generateInvoice = async (orderId: number, res: Response) => {
    const order = await db.Order.findByPk(orderId, {
        include: [
            { model: db.Product, as: 'product' },
            { model: db.User, as: 'user' }
        ]
    });

    if (!order) {
        throw new Error('Order not found');
    }

    const doc = new PDFDocument({ margin: 50 });

    // Stream the PDF directly to the response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${orderId}.pdf`);

    doc.pipe(res);

    // Header
    doc
        .fillColor('#444444')
        .fontSize(20)
        .text('QUALITY CRICKET', 50, 57)
        .fontSize(10)
        .text('123 Cricket Lane', 200, 50, { align: 'right' })
        .text('Dubai, UAE', 200, 65, { align: 'right' })
        .text('Phone: +971 50 123 4567', 200, 80, { align: 'right' })
        .moveDown();

    // Line
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, 100).lineTo(550, 100).stroke();

    // Invoice Info
    doc
        .fillColor('#444444')
        .fontSize(20)
        .text('INVOICE', 50, 120);

    doc
        .fontSize(10)
        .text(`Invoice Number: INV-${order.id}`, 50, 150)
        .text(`Invoice Date: ${new Date(order.createdAt as any).toLocaleDateString()}`, 50, 165)
        .text(`Payment Status: ${order.paymentStatus}`, 50, 180)
        .moveDown();

    // Customer Info
    doc
        .fontSize(10)
        .text('Bill To:', 300, 150)
        .font('Helvetica-Bold')
        .text(`${order.user?.firstName} ${order.user?.lastName}`, 300, 165)
        .font('Helvetica')
        .text(order.user?.email || '', 300, 180)
        .text(order.shippingAddress || '', 300, 195, { width: 250 })
        .moveDown();

    // Table Header
    const tableTop = 280;
    doc
        .font('Helvetica-Bold')
        .text('Item', 50, tableTop)
        .text('Quantity', 280, tableTop, { width: 90, align: 'right' })
        .text('Unit Price', 370, tableTop, { width: 90, align: 'right' })
        .text('Total', 470, tableTop, { width: 80, align: 'right' });

    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Table Content
    const itemTop = tableTop + 30;
    const unitPrice = Number(order.totalAmount) / order.quantity;

    doc
        .font('Helvetica')
        .text(order.product?.name || 'Product', 50, itemTop)
        .text(order.quantity.toString(), 280, itemTop, { width: 90, align: 'right' })
        .text(`$${unitPrice.toFixed(2)}`, 370, itemTop, { width: 90, align: 'right' })
        .text(`$${order.totalAmount}`, 470, itemTop, { width: 80, align: 'right' });

    // Summary
    const summaryTop = itemTop + 50;
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(350, summaryTop).lineTo(550, summaryTop).stroke();

    doc
        .font('Helvetica-Bold')
        .text('Total Amount:', 350, summaryTop + 10)
        .text(`$${order.totalAmount}`, 470, summaryTop + 10, { width: 80, align: 'right' });

    // Footer
    doc
        .fontSize(10)
        .fillColor('#888888')
        .text('Thank you for shopping with Quality Cricket!', 50, 700, { align: 'center', width: 500 });

    doc.end();
};
