import { Room } from "./type";

export const calculateRoomPrice = (
  room: Room,
  adults: number,
  children: number
): number =>
  room.roomPrice + room.adultPrice * adults + room.childPrice * children;
