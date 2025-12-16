import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({ icon, ...props }) => (
    <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500">{icon}</div>
        <input {...props} className="input-base input-with-icon" />
    </div>
);

export default InputField;
