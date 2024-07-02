export interface CustomInputNumberProps {
    min: number; // 最小值
    max: number; // 最大值
    step: number; // 每次增加或減少的數量
    name: string; // 元件名稱
    value: number; // 當前值
    disabled?: boolean; // 是否禁用
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; // 值改變事件處理函數
    onBlur: (event: React.FocusEvent<HTMLInputElement>) => void; // 失去焦點事件處理函數
  }

export interface Room {
roomPrice: number;
adultPrice: number;
childPrice: number;
capacity: number;
}

export interface Guest {
adult: number;
child: number;
}

export interface Allocation {
adult: number;
child: number;
price: number;
capacity: number;
}

export interface RoomAllocationProps {
guest: Guest;
rooms: Room[];
onChange: (result: Allocation[]) => void;
}

export interface RoomPanelProps {
  key: number;
  allocation: Allocation;
  onChange: (allocation: Allocation) => void;
}