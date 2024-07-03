"use client";
import React, { useState, useMemo } from "react";
import {
  RoomPanelProps,
} from "./type";
import { CustomInputNumber } from "./CustomInputNumber";
import { calculateRoomPrice } from "./utils"

export const RoomPanel: React.FC<RoomPanelProps> = ({
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