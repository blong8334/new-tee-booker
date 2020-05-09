const { OWNER } = process.env;
import { host, bookingPath } from '../constants';
import * as sensitive from '../sensitive';
import { request } from './utils';

const { [OWNER]: { partners }, buddies } = sensitive;

function getReservation(reservations): Array<object> {
  const baseObject = {
    ReservationType: reservations[0].resType,
    ReservationId: reservations[0].reservationId,
  };
  const getObj = (FullName: string, MemberId: string): object => ({ ...baseObject, FullName, MemberId });
  return [getObj(reservations[0].fullName, reservations[0].memberId)]
    .concat(partners.map((name: string) => getObj(name, buddies[name])));
}

export async function bookTime(bookingInfo: any, Cookie: string): Promise<object> {
  const { data: { bookingId: BookingId, primaryPlayerId: OwnerId, reservations } } = bookingInfo;
  const bookingBody = {
    BookingId,
    Holes: 18,
    Mode: 'Booking',
    Notes: '',
    OwnerId,
    Reservations: getReservation(reservations),
    StartingHole: '1',
    enabled: true,
    wait: false,
  };
  const write = JSON.stringify(bookingBody);
  const reqOptions = {
    headers: {
      Cookie,
      'Content-Type': 'application/json',
      'Content-Length': write.length,
    },
    host,
    path: bookingPath,
    method: 'POST',
  };
  const { results } = await request(reqOptions, { write });
  return JSON.parse(results);
}