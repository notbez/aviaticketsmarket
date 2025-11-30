// tickets-backend/src/booking/booking.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Booking, BookingDocument } from '../schemas/booking.schema';

export type CreateResult =
  | { success: true; booking: BookingDocument; raw?: any }
  | { success: false; booking: BookingDocument; error?: any; raw?: any };

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  // Onelya config from env
  private readonly baseUrl =
    process.env.ONELYA_BASE_URL || 'https://test.onelya.ru/api';
  private readonly login = process.env.ONELYA_LOGIN || 'trevel_test';
  private readonly password = process.env.ONELYA_PASSWORD || 'hldKMo@9';
  private readonly pos = process.env.ONELYA_POS || 'trevel_test';

  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private readonly http: HttpService,
  ) {
    // Проверка и предупреждения о пустых переменных
    if (!this.login || this.login === 'trevel_test') {
      this.logger.warn('ONELYA_LOGIN is not set or using default value');
    }
    if (!this.password || this.password === 'hldKMo@9') {
      this.logger.warn('ONELYA_PASSWORD is not set or using default value');
    }
    if (!this.pos || this.pos === 'trevel_test') {
      this.logger.warn('ONELYA_POS is not set or using default value');
    }
    this.logger.log(`Onelya baseUrl: ${this.baseUrl}`);
  }

  /**
   * Создание локального бронирования (fallback)
   * 
   * Используется когда Onelya API недоступен или возвращает ошибку
   * Создает бронирование в MongoDB с тестовыми данными
   * 
   * @param userId - ID пользователя из JWT токена
   * @param body - Данные бронирования (from, to, date, price и т.д.)
   * @returns Созданное бронирование в MongoDB
   */
  public async createLocal(userId: string, body: any): Promise<BookingDocument> {
    const booking = new this.bookingModel({
      user: new Types.ObjectId(userId),
      from: body.from || 'Санкт-Петербург',
      to: body.to || 'Москва',
      departureDate: body.date ? new Date(body.date) : new Date(),
      returnDate: body.returnDate ? new Date(body.returnDate) : null,
      isRoundTrip: body.isRoundTrip || false,
      flightNumber: body.flightNumber || 'SU 5411',
      departTime: body.departTime || '23:15',
      arriveTime: body.arriveTime || '23:55',
      returnDepartTime: body.returnDepartTime,
      returnArriveTime: body.returnArriveTime,
      passengers: body.passengers || [],
      providerBookingId: `onelya-${randomUUID()}`,
      bookingStatus: 'reserved',
      provider: 'onelya-mock',
      payment: {
        paymentStatus: 'pending',
        amount: body.price || 5600,
        currency: 'RUB',
      },
      seat: body.seat || '12A',
      gate: body.gate || 'B5',
      boardingTime: body.boardingTime || '08:45',
    });
    await booking.save();
    this.logger.log(`Created local booking ${booking._id}`);
    return booking;
  }

  /**
   * Публичный метод создания бронирования (используется контроллером)
   * 
   * Пытается создать бронирование через Onelya API
   * При ошибке автоматически переключается на локальное создание
   * 
   * @param userId - ID пользователя из JWT токена
   * @param body - Данные бронирования
   * @returns Результат создания с флагом success и данными бронирования
   */
  public async create(userId: string, body: any): Promise<CreateResult> {
    // Основной путь — попытаться создать в Onelya, в случае ошибки — fallback на локальный
    return this.createOnelya(userId, body);
  }

  /**
   * Создание бронирования через Onelya API
   * 
   * Отправляет запрос к Onelya API для создания резервации
   * При успехе сохраняет бронирование в MongoDB
   * При ошибке возвращает результат с success: false и создает локальное бронирование
   * 
   * @param userId - ID пользователя
   * @param body - Данные бронирования (from, to, date, passengers и т.д.)
   * @returns Результат создания с данными бронирования и raw ответом от API
   */
  public async createOnelya(userId: string, body: any): Promise<CreateResult> {
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

      // Сохраняем в MongoDB
      const booking = new this.bookingModel({
        user: new Types.ObjectId(userId),
        from: body.from,
        to: body.to,
        departureDate: body.date ? new Date(body.date) : new Date(),
        returnDate: body.returnDate ? new Date(body.returnDate) : null,
        isRoundTrip: body.isRoundTrip || false,
        flightNumber: body.flightNumber,
        departTime: body.departTime,
        arriveTime: body.arriveTime,
        returnDepartTime: body.returnDepartTime,
        returnArriveTime: body.returnArriveTime,
        passengers: body.passengers || [],
        providerBookingId,
        bookingStatus: 'reserved',
        provider: 'onelya',
        payment: {
          paymentStatus: 'pending',
          amount: body.price || 0,
          currency: 'RUB',
        },
        seat: body.seat || '12A',
        gate: body.gate || 'B5',
        boardingTime: body.boardingTime || '08:45',
        rawProviderData: data,
      });

      await booking.save();
      this.logger.log(
        `Created onelya booking ${providerBookingId} (local ${booking._id})`,
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
      const booking = await this.createLocal(userId, body);
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

      const booking = await this.bookingModel.findOne({
        providerBookingId,
      });
      if (booking) {
        booking.bookingStatus = 'ticketed';
        await booking.save();
      }

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
  public async getById(id: string): Promise<BookingDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.bookingModel.findById(id);
  }

  // find booking by provider id
  public async findByProviderId(providerId: string): Promise<BookingDocument | null> {
    return this.bookingModel.findOne({ providerBookingId: providerId });
  }

  // get all bookings for a user
  public async getUserBookings(userId: string): Promise<BookingDocument[]> {
    return this.bookingModel
      .find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }
}