// tickets-backend/src/booking/booking.controller.ts
import { Controller, Post, Body, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { BookingService } from './booking.service';
import PDFDocument from 'pdfkit';
import * as streamBuffers from 'stream-buffers';
import * as path from 'path';
import * as fs from 'fs';
import bwipjs from 'bwip-js';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('create')
  create(@Body() body: any) {
    return this.bookingService.create(body);
  }

  @Get(':id/pdf')
  async getPdf(@Param('id') id: string, @Res() res: Response) {
    const booking = this.bookingService.getById(id);
    if (!booking) {
      res.status(404).send('Booking not found');
      return;
    }

    const doc = new PDFDocument({ size: 'A4', margin: 28 });
    const writable = new streamBuffers.WritableStreamBuffer();
    doc.pipe(writable);

    // Шрифт (попробуйте NotoSans или Roboto)
    const fontPath = path.resolve(__dirname, '..', 'assets', 'fonts', 'NotoSans-Regular.ttf');
    if (fs.existsSync(fontPath)) {
      doc.registerFont('Noto', fontPath);
      doc.font('Noto');
    } else {
      doc.font('Helvetica');
    }

    // Цвета
    const primary = '#0277bd';
    const black = '#111';

    // Верх: маршрут (большие коды городов)
    const fromCode = (booking.from || 'SVO').split(',')[0].slice(0,3).toUpperCase();
    const toCode = (booking.to || 'LED').split(',')[0].slice(0,3).toUpperCase();

    doc
      .fillColor(primary)
      .fontSize(44)
      .text(fromCode, { continued: true, align: 'left' });

    // airplane icon - маленькая точка вместо иконки
    doc.fontSize(20).fillColor(primary).text('  →  ', { continued: true });

    doc.fontSize(44).fillColor(primary).text(toCode, { align: 'left' });

    doc.moveDown(0.6);
    doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).strokeColor('#e0e0e0').stroke();
    doc.moveDown(0.8);

    // Инфо: имя, рейс, дата
    doc.fontSize(10).fillColor('#666').text('Пассажир', { continued: true });
    doc.moveDown(0.2);
    doc.fontSize(14).fillColor(black).text(booking.contact?.name || 'Иванов Иван Иванович');

    doc.moveDown(0.6);
    doc.fontSize(10).fillColor('#666').text('Рейс', { continued: true });
    doc.moveDown(0.2);
    doc.fontSize(14).fillColor(black).text(booking.flightNumber || 'SU 5411');

    doc.moveUp(1);
    doc.fontSize(10).fillColor('#666').text('Дата', { align: 'right', continued: false });
    doc.moveDown(0.2);
    doc.fontSize(14).fillColor(black).text(booking.date || new Date().toISOString().split('T')[0], { align: 'right' });

    doc.moveDown(0.8);

    // Время вылета/прилёта крупно
    doc.fontSize(28).fillColor(primary).text(`${booking.departTime || '09:00'}  —  ${booking.arriveTime || '12:30'}`);
    doc.moveDown(1);

    // Доп детали: место, выход, посадка
    const seat = booking.seat || '12A';
    const gate = booking.gate || 'B5';
    const boardTime = booking.boardingTime || '08:45';

    const startX = doc.x;
    const columnWidth = (doc.page.width - doc.page.margins.left - doc.page.margins.right) / 3;

    doc.fontSize(10).fillColor('#666').text('Место', startX, doc.y, { width: columnWidth });
    doc.text('Выход', startX + columnWidth, doc.y, { width: columnWidth });
    doc.text('Посадка', startX + columnWidth*2, doc.y, { width: columnWidth });

    doc.moveDown(0.2);
    doc.fontSize(16).fillColor(black).text(seat, startX, doc.y, { width: columnWidth });
    doc.text(gate, startX + columnWidth, doc.y, { width: columnWidth });
    doc.text(boardTime, startX + columnWidth*2, doc.y, { width: columnWidth });

    doc.moveDown(1.2);

    // Разделительная линия (имитация отрывного края)
    doc.moveTo(doc.page.margins.left, doc.y)
       .lineTo(doc.page.width - doc.page.margins.right, doc.y)
       .dash(3, { space: 3 })
       .strokeColor('#bdbdbd')
       .stroke()
       .undash();

    doc.moveDown(1);

    // Генерируем barcode (code128) с идентификатором брони
    const barcodeText = booking.providerBookingId || `AT${booking.id}`;
    try {
      const png = await bwipjs.toBuffer({
        bcid: 'code128',
        text: barcodeText,
        scale: 2,
        height: 40,
        includetext: true,
        textxalign: 'center',
      });

      // вставляем картинку штрихкода
      const imgX = doc.page.margins.left;
      doc.image(png, imgX, doc.y, { width: doc.page.width - doc.page.margins.left - doc.page.margins.right });
      doc.moveDown(2);
    } catch (e) {
      console.error('Barcode error', e);
    }

    // Низ: оплата/контакты
    doc.fontSize(10).fillColor('#666').text('Оплата', { continued: true });
    doc.fontSize(12).fillColor(black).text(`  ${booking.price || 0} RUB`, { align: 'left' });

    doc.moveDown(1);
    doc.fontSize(9).fillColor('#999').text('Aviatickets Demo — билет сгенерирован провайдером Onelya (тест).', { align: 'center' });

    doc.end();

    await new Promise<void>((resolve) => doc.on('end', () => resolve()));

    const pdfBuffer = writable.getContents();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=boarding-${id}.pdf`);
    res.send(pdfBuffer);
  }
}