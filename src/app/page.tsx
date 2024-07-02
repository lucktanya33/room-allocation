'use client'
import React, { useState, useEffect, useRef } from 'react';

// 定義 CustomInputNumber 的屬性接口
interface CustomInputNumberProps {
  min: number; // 最小值
  max: number; // 最大值
  step: number; // 每次增加或減少的數量
  name: string; // 元件名稱
  value: number; // 當前值
  disabled?: boolean; // 是否禁用
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; // 值改變事件處理函數
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void; // 失去焦點事件處理函數
}

const CustomInputNumber: React.FC<CustomInputNumberProps> = ({
  min,
  max,
  step,
  name,
  value,
  disabled = false,
  onChange,
  onBlur,
}) => {
  const [currentValue, setCurrentValue] = useState<number>(value); // 使用 state 保存當前值
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // 保存 setInterval 的參考

  // 當外部的 value 改變時，同步更新當前值
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  // 處理數值變化，確保數值在 min 和 max 範圍內
  const handleChange = (newValue: number) => {
    if (newValue < min || newValue > max) return; // 如果新值超出範圍，則不做處理
    setCurrentValue(newValue); // 更新當前值
    onChange({
      target: { name, value: newValue.toString() }
    } as React.ChangeEvent<HTMLInputElement>); // 觸發 onChange 事件
  };

  // 處理輸入框變化事件
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = parseFloat(e.target.value);
    if (isNaN(newValue)) newValue = min; // 如果輸入的值不是數字，則設為最小值
    handleChange(newValue); // 處理新值
  };

  // 處理加減按鈕點擊事件
  const handleButtonClick = (increment: number) => {
    let newValue = currentValue + increment;
    if (newValue > max || newValue < min) return; // 如果新值超出範圍，則不做處理
    handleChange(newValue); // 處理新值
  };

  // 處理按鈕長按事件
  const handleMouseDown = (increment: number) => {
    intervalRef.current = setInterval(() => handleButtonClick(increment), 100); // 每100毫秒調用一次 handleButtonClick
  };

  // 處理按鈕鬆開事件
  const handleMouseUp = () => {
    if (intervalRef.current) clearInterval(intervalRef.current); // 清除計時器
  };

  return (
    <div className="flex items-center" onBlur={onBlur}>
      <button
        type="button"
        className={`w-12 h-12 border border-gray-300 rounded flex items-center justify-center ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => handleButtonClick(-step)}
        onMouseDown={() => handleMouseDown(-step)}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        disabled={disabled} // 按鈕禁用狀態
      >
        -
      </button>
      <input
        type="number"
        name={name}
        value={currentValue}
        min={min}
        max={max}
        step={step}
        onChange={handleInputChange}
        onBlur={onBlur}
        disabled={disabled} // 輸入框禁用狀態
        className={`mx-2 w-12 h-12 text-center border border-gray-300 rounded ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      <button
        type="button"
        className={`w-12 h-12 border border-gray-300 rounded flex items-center justify-center ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => handleButtonClick(step)}
        onMouseDown={() => handleMouseDown(step)}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        disabled={disabled} // 按鈕禁用狀態
      >
        +
      </button>
    </div>
  );
};

export default function Home() {
    // 處理輸入變化事件
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log(`Name: ${e.target.name}, Value: ${e.target.value}`);
    };
  
    // 處理輸入框失焦事件
    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      console.log(`Blur event on input: ${e.target.name}`);
    };
  return (
   <div>
     <div className="p-4">
      <CustomInputNumber
        min={1}
        max={10}
        step={1}
        name="customNumber"
        value={2}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        disabled={false}
      />
    </div>
   </div>
  );
}
