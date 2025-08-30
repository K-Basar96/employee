import React, { useState } from "react";
import "./FormInput.css";

const FormInput = (props) => {
    const [focused, setFocused] = useState(false);
    const { label, errorMessage, onChange, id, ...inputProps } = props;

    let handleFocus = () => {
        setFocused(true);
    };
    return (
        <div className="FormInput">
            <input {...inputProps} onChange={onChange} 
                onBlur={handleFocus} focused={focused.toString()}/>

            <span>{errorMessage}</span>
        </div>
    );
};

export default FormInput;
