import fetch from 'node-fetch';
import { ProviderInterface } from './provider.interface';

export class OnelyaProvider implements ProviderInterface {
  constructor(private baseUrl: string, private apiKey: string) {}

  async search(params: any) {
    // пример: GET /search?from=... (реально смотрим docs)
    const url = `${this.baseUrl}/search?from=${params.from}&to=${params.to}&date=${params.date}&adults=${params.adults}`;
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${this.apiKey}` }});
    const json = await res.json();
    // маппинг от onelya -> internal DTO
    return this.mapSearch(json);
  }

  async createReservation(data: any) {
    const url = `${this.baseUrl}/book`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async confirmPayment(providerBookingId: string, paymentInfo: any) {
    // зависит от API onelya
  }

  async getPdf(providerBookingId: string) {
    const url = `${this.baseUrl}/bookings/${providerBookingId}/ticket`;
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${this.apiKey}` }});
    const buffer = await res.arrayBuffer();
    return Buffer.from(buffer);
  }

  private mapSearch(raw: any) {
    // минимум: id, from, to, date, departTime, arriveTime, price, currency
    return raw; // реализуй маппинг
  }
}