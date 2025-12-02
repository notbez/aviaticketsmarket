/**
 * booking.controller.ts - Контроллер для управления бронированиями
 * 
 * Этот контроллер обрабатывает HTTP запросы связанные с бронированиями:
 * - POST /booking/create - создание нового бронирования
 * - GET /booking - получение списка бронирований пользователя
 * - GET /booking/:id - получение конкретного бронирования
 * - GET /booking/:id/pdf - генерация и скачивание PDF билета
 * 
 * Все маршруты защищены JWT авторизацией (кроме некоторых публичных)
 * 
 * @module BookingController
 */

import { Controller, Post, Body, Get, Param, Res, Request, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import PDFDocument from 'pdfkit';
import * as streamBuffers from 'stream-buffers';
import * as path from 'path';
import * as fs from 'fs';
import * as bwipjs from 'bwip-js';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  public async create(@Request() req, @Body() body: any) {
    const res = await this.bookingService.create(req.user.sub, body);
    return {
      ok: !!res.success,
      booking: res.booking || null,
      raw: res.raw || null,
      error: res.success === false ? (res.error || null) : null,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  public async getUserBookings(@Request() req) {
    const bookings = await this.bookingService.getUserBookings(req.user.sub);
    return { bookings: bookings.map(b => b.toObject()) };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  public async getBooking(@Request() req, @Param('id') id: string, @Res() res: Response) {
    const booking = await this.bookingService.getById(id);
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    // Check if booking belongs to user
    if (booking.user.toString() !== req.user.sub) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    return res.json(booking);
  }

  @Get(':id/pdf')
  @UseGuards(JwtAuthGuard)
  public async getPdf(@Request() req, @Param('id') id: string, @Res() res: Response) {
    const booking = await this.bookingService.getById(id);
    if (!booking) {
      res.status(404).send('Booking not found');
      return;
    }
    // Check if booking belongs to user
    if (booking.user.toString() !== req.user.sub) {
      res.status(403).send('Forbidden');
      return;
    }

    const bookingObj = booking.toObject();
    const doc = new PDFDocument({ size: 'A4', margin: 28 });
    const writable = new streamBuffers.WritableStreamBuffer();
    doc.pipe(writable);

    const fontPath = path.resolve(__dirname, '..', 'assets', 'fonts', 'NotoSans-Regular.ttf');
    try {
      if (fs.existsSync(fontPath)) {
        // @ts-ignore -- pdfkit types sometimes require .registerFont signature as any
        doc.registerFont('Noto', fontPath);
        doc.font('Noto');
      } else {
        doc.font('Helvetica');
      }
    } catch (err) {
      // если registerFont упадёт — используем дефолт
      doc.font('Helvetica');
    }

    const primary = '#0277bd';
    const black = '#111';

    const fromCode = (bookingObj.from || 'SVO').slice(0, 3).toUpperCase();
    const toCode = (bookingObj.to || 'LED').slice(0, 3).toUpperCase();

    doc
      .fillColor(primary)
      .fontSize(44)
      .text(fromCode, { continued: true })
      .fontSize(20)
      .text('  →  ', { continued: true })
      .fontSize(44)
      .text(toCode);

    doc.moveDown(0.6);
    doc
      .moveTo(doc.x, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .strokeColor('#e0e0e0')
      .stroke();
    doc.moveDown(0.8);

    doc.fontSize(10).fillColor('#666').text('Пассажир');
    doc.moveDown(0.2);
    doc.fontSize(14).fillColor(black).text(bookingObj.passengers?.[0]?.fullName || 'Иванов Иван');

    doc.moveDown(0.6);
    doc.fontSize(10).fillColor('#666').text('Рейс');
    doc.moveDown(0.2);
    doc.fontSize(14).fillColor(black).text(bookingObj.flightNumber || 'SU 5411');

    doc.moveDown(0.6);
    doc.fontSize(10).fillColor('#666').text('Дата');
    doc.moveDown(0.2);
    const departureDate = bookingObj.departureDate 
      ? new Date(bookingObj.departureDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    doc.fontSize(14).fillColor(black).text(departureDate);

    doc.moveDown(1);
    doc
      .fontSize(28)
      .fillColor(primary)
      .text(`${bookingObj.departTime || '09:00'} — ${bookingObj.arriveTime || '12:30'}`);

    doc.moveDown(1);

    // безопасные значения для seat/gate/boardingTime (booking определён выше)
    const seat = bookingObj.seat ?? '12A';
    const gate = bookingObj.gate ?? 'B5';
    const boardTime = bookingObj.boardingTime ?? '08:45';

    const startX = doc.x;
    const columnWidth =
      (doc.page.width - doc.page.margins.left - doc.page.margins.right) / 3;

    doc.fontSize(10).fillColor('#666').text('Место', startX, doc.y, { width: columnWidth });
    doc.text('Выход', startX + columnWidth, doc.y, { width: columnWidth });
    doc.text('Посадка', startX + columnWidth * 2, doc.y, { width: columnWidth });

    doc.moveDown(0.4);
    doc.fontSize(16).fillColor(black).text(seat, startX, doc.y, { width: columnWidth });
    doc.text(gate, startX + columnWidth, doc.y, { width: columnWidth });
    doc.text(boardTime, startX + columnWidth * 2, doc.y, { width: columnWidth });

    doc.moveDown(1);

    doc
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .dash(3, { space: 3 })
      .strokeColor('#bdbdbd')
      .stroke()
      .undash();

    doc.moveDown(1);

    const barcodeText = bookingObj.providerBookingId || `AT-${id}`;
    try {
      const png = await bwipjs.toBuffer({
        bcid: 'code128',
        text: barcodeText,
        scale: 2,
        height: 40,
        includetext: true,
        textxalign: 'center',
      });

      doc.image(png, doc.page.margins.left, doc.y, {
        width:
          doc.page.width - doc.page.margins.left - doc.page.margins.right,
      });
      doc.moveDown(2);
    } catch (e) {
      // если штрихкод упал — логируем, но продолжаем
      // eslint-disable-next-line no-console
      console.error('Barcode error', e);
    }

    doc.fontSize(10).fillColor('#666').text('Оплата');
    doc.fontSize(12).fillColor(black).text(`${bookingObj.payment?.amount || 0} ${bookingObj.payment?.currency || 'RUB'}`);
    doc.moveDown(1);

    doc
      .fontSize(9)
      .fillColor('#999')
      .text('Aviatickets Demo — PDF создан автоматически.', { align: 'center' });

    doc.end();

    await new Promise<void>((resolve) => doc.on('end', resolve));

    const pdfBuffer = writable.getContents();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename=boarding-${id}.pdf`,
    );
    res.send(pdfBuffer);
  }
}