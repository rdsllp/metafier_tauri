import React, { useState } from "react";
interface SpinnerInputProps {
  disabled?: boolean;
}

export const SpinnerInput = (props: SpinnerInputProps = {disabled: false}) => {
  const [value, setValue] = useState(0.025);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(parseFloat(e.target.value) || 0);
  };


  return (
    <div className="flex flex-col items-center w-20">
      <input
        id="numberInput"
        type="number"
        disabled={props.disabled}
        className="w-full text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
        value={value}
        step="0.005"
        onChange={handleChange}
        min="0"
      />
    </div>
  );
};
