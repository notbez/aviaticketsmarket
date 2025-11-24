// src/booking/booking.controller.ts
import { Controller, Post, Body, Get, Param, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { BookingService } from './booking.service';
import * as streamBuffers from 'stream-buffers';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';

dotenv.config();

@Controller('booking')
export class BookingController {
  private readonly logger = new Logger(BookingController.name);

  constructor(private readonly bookingService: BookingService) {}

  // create booking: will try Onelya then fallback
  @Post('create')
  async create(@Body() body: any) {
    // Expect body: { from, to, date, price, contact:{email,name}, flightNumber, departTime, arriveTime, segments }
    const result = await this.bookingService.createOnelya(body);
    // result: { success, booking, raw, error }
    if (result.booking) return { ok: true, booking: result.booking, raw: result.raw, onelya_ok: result.success };
    return { ok: false, error: result.error };
  }

  // confirm booking (by providerBookingId)
  @Post('confirm')
  async confirm(@Body() body: { providerBookingId: string }) {
    if (!body?.providerBookingId) return { ok: false, message: 'providerBookingId required' };
    const result = await this.bookingService.confirmOnelya(body.providerBookingId);
    return result;
  }

  // get ticket / blank by our internal id or provider id (try both)
  @Get(':id/pdf')
  async getPdf(@Param('id') id: string, @Res() res: Response) {
    // id can be our internal id or providerBookingId. Try to find booking
    const byInternal = this.bookingService.getById(id);
    const booking = byInternal || this.bookingService.findByProviderId(id);

    if (!booking) {
      return res.status(HttpStatus.NOT_FOUND).json({ ok: false, message: 'Booking not found' });
    }

    // Attempt to get blank from Onelya using providerBookingId
    const providerId = booking.providerBookingId;
    const blank = await this.bookingService.getBlank(providerId);

    if (blank?.error) {
      // fallback: create simple PDF locally (very small)
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const stream = new streamBuffers.WritableStreamBuffer();
      doc.pipe(stream);

      doc.fontSize(16).text('Booking (fallback)', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`ID: ${booking.id}`);
      doc.text(`Route: ${booking.from} → ${booking.to}`);
      doc.text(`Date: ${booking.date}`);
      doc.text(`Price: ${booking.price} RUB`);
      doc.end();

      await new Promise((r) => doc.on('end', r));
      const buff = stream.getContents();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=booking-${booking.id}.pdf`);
      return res.send(buff);
    }

    if (blank.type === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=booking-${booking.id}.pdf`);
      return res.send(blank.buffer);
    } else {
      // JSON response with blank content
      return res.json({ ok: true, blank: blank.data, booking });
    }
  }
}