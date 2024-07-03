"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Room,
  Guest,
  Allocation,
  RoomAllocationProps,
  RoomPanelProps,
} from "./type";
import { CustomInputNumber } from "./CustomInputNumber";

// 處理輸入框失焦事件
const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  console.log(`Blur event on input: ${e.target.name}`);
};

// 計算房間價格
const calculateRoomPrice = (
  room: Room,
  adults: number,
  children: number
): number =>
  room.roomPrice + room.adultPrice * adults + room.childPrice * children;

// 檢查分配是否有效
const isValidAllocation = (allocation: Allocation[]): boolean => {
  for (const { child, adult } of allocation) {
    // 如果房間裡有小孩但是沒有大人，則分配無效
    if (child > 0 && adult === 0) return false;
  }
  return true;
};

const RoomPanel: React.FC<RoomPanelProps> = ({
  index,
  allocation,
  allocations,
  guestSetting,
  roomSetting,
  onChange,
}) => {
  const [panelState, setPanelState] = useState({
    adult: allocation.adult,
    child: allocation.child,
  });

  const handleAdultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAdult = parseInt(e.target.value);
    const newState = { ...panelState, adult: newAdult };
    setPanelState(newState);
    onChange({
      ...allocation,
      adult: newAdult,
      price: calculateRoomPrice(roomSetting, newAdult, newState.child),
    });
  };

  const handleChildChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChild = parseInt(e.target.value);
    const newState = { ...panelState, child: newChild };
    setPanelState(newState);
    onChange({
      ...allocation,
      child: newChild,
      price: calculateRoomPrice(roomSetting, newState.adult, newChild),
    });
  };

  // max 不能超過(1)此房間上限 以及 (2)大人數量上限
  const maxAdult = useMemo(() => {
    // 上限-總大人數量
    // 計算其他索引中的 adult 總和
    let theOtherAdults = 0;
    for (let i = 0; i < allocations.length; i++) {
      if (i !== index) {
        theOtherAdults += allocations[i].adult;
      }
    }
    const adultLimit = guestSetting.adult - theOtherAdults;
    // 上限-此房間大人數量
    const roomLimit = allocation.capacity - panelState.child;

    return Math.min(adultLimit, roomLimit);
  }, [panelState, allocations]);

  // max 不能超過(1)此房間上限 以及 (2)小孩數量上限
  const maxChild = useMemo(() => {
    // 上限-總小孩數量
    // 計算其他索引中的 child 總和
    let theOtherChilds = 0;
    for (let i = 0; i < allocations.length; i++) {
      if (i !== index) {
        theOtherChilds += allocations[i].child;
      }
    }
    const childLimit = guestSetting.child - theOtherChilds;
    // 上限-此房間小孩數量
    const roomLimit = allocation.capacity - panelState.adult;

    return Math.min(childLimit, roomLimit);
  }, [panelState, allocations]);

  return (
    <div key={index} className="border my-2 p-2">
      <p>{`此房間上限總人數${allocation.capacity}`}</p>
      <p>{`目前總人數：${allocation.adult + allocation.child}人`}</p>
      <div className="flex flex-row justify-between my-1">
        <div>
          <p>大人</p>
          <p className="text-neutral-400">年齡20+</p>
        </div>
        <CustomInputNumber
          min={1}
          max={maxAdult}
          step={1}
          name={`adult-${index}`}
          value={panelState.adult}
          onChange={handleAdultChange}
          // onBlur={(e) => {
          //   handleInputBlur(e);
          // }}
          onBlur={() => {}}
        />
      </div>
      <div className="flex flex-row justify-between">
        <p>小孩</p>
        <CustomInputNumber
          min={0}
          max={maxChild}
          step={1}
          name={`child-${index}`}
          value={panelState.child}
          onChange={handleChildChange}
          // onBlur={(e) => {
          //   handleInputBlur(e);
          // }}
          onBlur={() => {}}
        />
      </div>
    </div>
  );
};

// 計算最低價格分配方案/預設方案
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
