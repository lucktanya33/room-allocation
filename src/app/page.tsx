"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Room,
  Guest,
  Allocation,
  RoomAllocationProps,
} from "./type";
import { RoomPanel } from "./RoomPanel";
import { calculateRoomPrice } from "./utils"

// 處理輸入框失焦事件
const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  console.log(`Blur event on input: ${e.target.name}`);
};

// 檢查分配是否有效
const isValidAllocation = (allocation: Allocation[]): boolean => {
  for (const { child, adult } of allocation) {
    // 如果房間裡有小孩但是沒有大人，則分配無效
    if (child > 0 && adult === 0) return false;
  }
  return true;
};

const getDefaultRoomAllocation = (
  guest: Guest,
  rooms: Room[]
): Allocation[] => {
  const { adult: totalAdults, child: totalChildren } = guest;
  const roomCount = rooms.length;
  const initialAllocation: Allocation[] = rooms.map((room) => ({
    adult: 0,
    child: 0,
    price: room.roomPrice,
    capacity: room.capacity,
  }));
  let minTotalPrice = Infinity;
  let bestAllocation: Allocation[] = [];

  // 遞迴尋找最小價格的分配方案
  const findMinimumPrice = (
    index: number,
    remainingAdults: number,
    remainingChildren: number,
    currentAllocation: Allocation[],
    currentPrice: number
  ) => {
    // 基本情況：如果所有成人和小孩都已經分配完畢
    if (remainingAdults === 0 && remainingChildren === 0) {
      // 當所有成人和小孩都已分配完畢時，檢查當前方案是否有效，並更新最優方案
      if (isValidAllocation(currentAllocation)) {
        if (currentPrice < minTotalPrice) {
          minTotalPrice = currentPrice;
          bestAllocation = [...currentAllocation];
        }
      }
      return;
    }

    // 遍歷所有剩餘的房間
    for (let i = index; i < roomCount; i++) {
      const room = rooms[i];
      const { capacity } = room;

      // 試圖在當前房間中分配成人和小孩
      for (
        let adultsInRoom = 0;
        adultsInRoom <= Math.min(remainingAdults, capacity);
        adultsInRoom++
      ) {
        for (
          let childrenInRoom = 0;
          childrenInRoom <=
          Math.min(remainingChildren, capacity - adultsInRoom);
          childrenInRoom++
        ) {
          // 如果房間裡有小孩但是沒有大人，則跳過該方案
          if (childrenInRoom > 0 && adultsInRoom === 0) continue;

          const price = calculateRoomPrice(room, adultsInRoom, childrenInRoom);
          const newAllocation = [...currentAllocation];
          newAllocation[i] = {
            adult: adultsInRoom,
            child: childrenInRoom,
            price,
            capacity,
          };

          // 遞迴處理下一個房間
          findMinimumPrice(
            i + 1,
            remainingAdults - adultsInRoom,
            remainingChildren - childrenInRoom,
            newAllocation,
            currentPrice + price
          );
        }
      }
    }
  };

  findMinimumPrice(0, totalAdults, totalChildren, initialAllocation, 0);
  return bestAllocation;
};

const RoomAllocation: React.FC<RoomAllocationProps> = ({
  guest,
  rooms,
  onChange,
}) => {
  const { adult, child } = guest;
  const [allocations, setAllocations] = useState<Allocation[]>(() =>
    getDefaultRoomAllocation(guest, rooms)
  );

  // 尚未分配的大人數量
  const leftAdult = useMemo(() => {
    return (
      adult - allocations.reduce((acc, allocation) => acc + allocation.adult, 0)
    );
  }, [allocations]);

  // 尚未分配的小孩數量
  const leftChild = useMemo(() => {
    return (
      child - allocations.reduce((acc, allocation) => acc + allocation.child, 0)
    );
  }, [allocations]);

  const handleAllocationChange = (index: number, newAllocation: Allocation) => {
    const newAllocations = [...allocations];
    newAllocations[index] = newAllocation;
    setAllocations(newAllocations);
  };

  // 當 allocations 改變時，觸發 onChange 回調
  useEffect(() => {
    onChange(allocations);
  }, [allocations, onChange]);

  return (
    <div className="p-4">
      <p className="text-xl font-bold">{`住客人數：${adult} 位大人，${child} 位小孩`}</p>
      <p>{`尚未分配人數：${leftAdult} 位大人，${leftChild} 位小孩`}</p>
      {allocations.map((allocation, index) => {
        return (
          <RoomPanel
            index={index}
            allocation={allocation}
            allocations={allocations}
            guestSetting={guest}
            roomSetting={rooms[index]}
            onChange={(updatedAllocation: Allocation) =>
              handleAllocationChange(index, updatedAllocation)
            }
          />
        );
      })}
    </div>
  );
};

export default function Home() {
  // 測試範例1
  const guest: Guest = { adult: 4, child: 3 };
  const rooms: Room[] = [
    { roomPrice: 100, adultPrice: 50, childPrice: 20, capacity: 4 },
    { roomPrice: 150, adultPrice: 60, childPrice: 30, capacity: 3 },
  ];

  // 測試範例2
  // const guest = { adult: 7, child: 3 };
  // const rooms = [
  //   { roomPrice: 2000, adultPrice: 200, childPrice: 100, capacity: 4 },
  //   { roomPrice: 2000, adultPrice: 200, childPrice: 100, capacity: 4 },
  //   { roomPrice: 2000, adultPrice: 400, childPrice: 200, capacity: 2 },
  //   { roomPrice: 2000, adultPrice: 400, childPrice: 200, capacity: 2 },
  // ];

  return (
    <div>
      <RoomAllocation
        guest={guest}
        rooms={rooms}
         onChange={(result) => console.log(result)}
      />
    </div>
  );
}
