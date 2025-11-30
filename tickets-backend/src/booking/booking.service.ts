// tickets-backend/src/booking/booking.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface Booking {
  id: string;
  from?: string;
  to?: string;
  date?: string;
  price?: number;
  contact?: { email?: string; name?: string };
  status: string;
  providerBookingId: string;
  provider?: string;
  flightNumber?: string;
  departTime?: string;
  arriveTime?: string;
  seat?: string;
  gate?: string;
  boardingTime?: string;
}

export type CreateResult =
  | { success: true; booking: Booking; raw?: any }
  | { success: false; booking: Booking; error?: any; raw?: any };

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);
  private bookings: Booking[] = [];

  // Onelya config from env
  private readonly baseUrl =
    process.env.ONELYA_BASE_URL || 'https://test.onelya.ru/api';
  private readonly login = process.env.ONELYA_LOGIN || 'trevel_test';
  private readonly password = process.env.ONELYA_PASSWORD || 'hldKMo@9';
  private readonly pos = process.env.ONELYA_POS || 'trevel_test';

  constructor(private readonly http: HttpService) {
    // Проверка и предупреждения о пустых переменных
    if (!this.login) {
      this.logger.warn('ONELYA_LOGIN is not set, using empty string');
    }
    if (!this.password) {
      this.logger.warn('ONELYA_PASSWORD is not set, using empty string');
    }
    if (!this.pos || this.pos === 'trevel_test') {
      this.logger.warn('ONELYA_POS is not set or using default value');
    }
    this.logger.log(`Onelya baseUrl: ${this.baseUrl}`);
  }

  // --- Local create (fallback) ---
  public createLocal(body: any): Booking {
    const id = randomUUID();
    const booking: Booking = {
      id,
      from: body.from || 'Санкт-Петербург',
      to: body.to || 'Москва',
      date: body.date || new Date().toISOString().split('T')[0],
      price: body.price || 5600,
      contact: body.contact || {},
      providerBookingId: `onelya-${id}`,
      status: 'PENDING',
      provider: 'onelya-mock',
      flightNumber: body.flightNumber || 'SU 5411',
      departTime: body.departTime || '23:15',
      arriveTime: body.arriveTime || '23:55',
      seat: body.seat || '12A',
      gate: body.gate || 'B5',
      boardingTime: body.boardingTime || '08:45',
    };
    this.bookings.push(booking);
    this.logger.log(`Created local booking ${booking.id}`);
    return booking;
  }

  // --- Public create (used by controller) ---
  // Возвращает { success: boolean, booking, raw?, error? }
  public async create(body: any): Promise<CreateResult> {
    // Основной путь — попытаться создать в Onelya, в случае ошибки — fallback на локальный
    return this.createOnelya(body);
  }

  // --- Create reservation in Onelya (best-effort) ---
  public async createOnelya(body: any): Promise<CreateResult> {
    const url = `${this.baseUrl}/Order/V1/Reservation/Create`;
    const auth =
      'Basic ' + Buffer.from(`${this.login}:${this.password}`).toString('base64');

    const payload = {
      Pos: this.pos,
      Reservation: {
        Pricing: {
          Prices: [
            {
              PassengerType: 'Adult',
              Quantity: 1,
              Amount: body.price || 0,
            },
          ],
        },
        Segments:
          body.segments || [
            {
              OriginCode: body.from,
              DestinationCode: body.to,
              DepartureDate: `${body.date}T00:00:00`,
            },
          ],
        Contact: body.contact || {},
      },
    };

    this.logger.log(`[Onelya] POST ${url}`);
    this.logger.debug(`[Onelya] Request payload: ${JSON.stringify({ ...payload, Reservation: { ...payload.Reservation, Contact: body.contact ? '[REDACTED]' : undefined } })}`);

    try {
      this.logger.log(`[Onelya] Sending reservation create request to ${url}`);
      const res = await firstValueFrom(
        this.http.post<any>(url, payload, {
          headers: {
            Authorization: auth,
            Pos: this.pos,
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip',
          },
          timeout: 60000,
        }),
      );

      const data = res.data;
      this.logger.log(`[Onelya] Reservation create response status: ${res.status}`);
      this.logger.debug(`[Onelya] Response data keys: ${Object.keys(data || {}).join(', ')}`);

      // Попытка извлечь ID брони из различных мест в ответе
      const providerBookingId =
        data?.ReservationId ||
        data?.Reservation?.Id ||
        data?.Result?.ReservationId ||
        data?.Id ||
        randomUUID();

      // Сохраняем в локальном сторе (с заполненными seat/gate/boardingTime при наличии)
      const id = randomUUID();
      const booking: Booking = {
        id,
        from: body.from,
        to: body.to,
        date: body.date,
        price: body.price,
        contact: body.contact,
        providerBookingId,
        status: 'CREATED',
        provider: 'onelya',
        flightNumber: body.flightNumber,
        departTime: body.departTime,
        arriveTime: body.arriveTime,
        seat: body.seat || '12A',
        gate: body.gate || 'B5',
        boardingTime: body.boardingTime || '08:45',
      };

      this.bookings.push(booking);
      this.logger.log(
        `Created onelya booking ${providerBookingId} (local ${id})`,
      );

      return { success: true, booking, raw: data };
    } catch (err: any) {
      const errorMessage = err?.response?.data || err?.message || String(err);
      const errorStatus = err?.response?.status;
      this.logger.error(
        `[Onelya] Reservation create failed: ${errorMessage}`,
        errorStatus ? `Status: ${errorStatus}` : '',
      );
      // fallback to local
      const booking = this.createLocal(body);
      return {
        success: false,
        booking,
        error: errorMessage,
        raw: err?.response?.data || null,
      };
    }
  }

  // --- Confirm reservation in Onelya ---
  public async confirmOnelya(providerBookingId: string) {
    const url = `${this.baseUrl}/Order/V1/Reservation/Confirm`;
    const auth =
      'Basic ' + Buffer.from(`${this.login}:${this.password}`).toString('base64');

    const payload = { ReservationId: providerBookingId, Pos: this.pos };

    this.logger.log(`[Onelya] POST ${url} for reservation ${providerBookingId}`);

    try {
      const res = await firstValueFrom(
        this.http.post<any>(url, payload, {
          headers: {
            Authorization: auth,
            Pos: this.pos,
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip',
          },
          timeout: 60000,
        }),
      );
      const data = res.data;
      this.logger.log(`[Onelya] Reservation confirm response status: ${res.status}`);

      const booking = this.bookings.find(
        (b) => b.providerBookingId === providerBookingId,
      );
      if (booking) booking.status = 'CONFIRMED';

      return { success: true, raw: data };
    } catch (err: any) {
      const errorMessage = err?.response?.data || err?.message || String(err);
      this.logger.error(
        `[Onelya] Reservation confirm failed: ${errorMessage}`,
        err?.response?.status ? `Status: ${err.response.status}` : '',
      );
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // --- Get blank / ticket PDF or JSON ---
  public async getBlank(providerBookingId: string) {
    const url1 = `${this.baseUrl}/Avia/V1/Reservation/Blank`;
    const url2 = `${this.baseUrl}/Order/V1/Reservation/Blank`;
    const auth =
      'Basic ' + Buffer.from(`${this.login}:${this.password}`).toString('base64');

    const payload = { ReservationId: providerBookingId, Pos: this.pos };

    this.logger.log(`[Onelya] GET blank for reservation ${providerBookingId}`);

    try {
      this.logger.log(`[Onelya] Trying ${url1}`);
      let res = await firstValueFrom(
        this.http.post<any>(url1, payload, {
          headers: {
            Authorization: auth,
            Pos: this.pos,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
          timeout: 60000,
        }),
      );

      if (
        res.headers &&
        res.headers['content-type'] &&
        res.headers['content-type'].includes('application/pdf')
      ) {
        return { type: 'pdf', buffer: Buffer.from(res.data) };
      } else {
        return { type: 'json', data: res.data };
      }
    } catch (err1: any) {
      this.logger.warn(`[Onelya] Blank via Avia failed: ${err1?.message || String(err1)}, trying Order API`);
      try {
        this.logger.log(`[Onelya] Trying ${url2}`);
        let res2 = await firstValueFrom(
          this.http.post<any>(url2, payload, {
            headers: {
              Authorization: auth,
              Pos: this.pos,
              'Content-Type': 'application/json',
            },
            responseType: 'arraybuffer',
            timeout: 60000,
          }),
        );

        if (
          res2.headers &&
          res2.headers['content-type'] &&
          res2.headers['content-type'].includes('application/pdf')
        ) {
          return { type: 'pdf', buffer: Buffer.from(res2.data) };
        } else {
          return { type: 'json', data: res2.data };
        }
      } catch (err2: any) {
        const errorMessage = err2?.response?.data || err2?.message || 'Blank failed';
        this.logger.error(
          `[Onelya] Both blank endpoints failed: ${errorMessage}`,
        );
        return {
          error: true,
          message: errorMessage,
        };
      }
    }
  }

  // get booking by our internal id
  public getById(id: string): Booking | undefined {
    return this.bookings.find((b) => b.id === id);
  }

  // find booking by provider id
  public findByProviderId(providerId: string) {
    return this.bookings.find((b) => b.providerBookingId === providerId);
  }
}