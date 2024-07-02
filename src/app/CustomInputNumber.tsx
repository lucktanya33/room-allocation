import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CustomInputNumberProps} from './type'

export const CustomInputNumber: React.FC<CustomInputNumberProps> = ({
    min,// 可以減少的下限
    max,// 可以增加的上限
    step,
    name,
    value,// 目前的數字
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
          className={`border-cyan-400 text-cyan-400	w-12 h-12 border border-gray-300 rounded flex items-center justify-center ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
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
          className={`mx-2 w-12 h-12 text-center border border-gray-300 rounded ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
        />
        <button
          type="button"
          className={`border-cyan-600 text-cyan-600	w-12 h-12 border border-gray-300 rounded flex items-center justify-center ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
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